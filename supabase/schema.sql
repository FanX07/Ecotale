-- Run this in Supabase SQL Editor before enabling the real-data screens.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  species_name text not null,
  notes text,
  photo_path text,
  latitude double precision,
  longitude double precision,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 1000),
  observation_id uuid references public.observations(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Anonymous task submissions from the public EcoTale web experience.
-- Visitors may add rows, but only project administrators can read them.
create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  task_number smallint not null check (task_number between 3 and 5),
  kind text not null check (char_length(kind) between 1 and 40),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 2000),
  tag text check (char_length(tag) <= 40),
  location text check (char_length(location) <= 120),
  audience text not null check (audience in ('Public', 'Only me')),
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.task_submissions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('observation-photos', 'observation-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('task-submission-photos', 'task-submission-photos', false)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.observations enable row level security;
alter table public.posts enable row level security;
alter table public.task_submissions enable row level security;

create policy "Profiles are visible to signed-in users" on public.profiles for select to authenticated using (true);
create policy "Users manage their own profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Observations are visible to signed-in users" on public.observations for select to authenticated using (true);
create policy "Users create their own observations" on public.observations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own observations" on public.observations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own observations" on public.observations for delete to authenticated using ((select auth.uid()) = user_id);
create policy "Posts are visible to signed-in users" on public.posts for select to authenticated using (true);
create policy "Users create their own posts" on public.posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own posts" on public.posts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own posts" on public.posts for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Visitors submit EcoTale task responses" on public.task_submissions;
drop policy if exists "Signed-in users submit EcoTale task responses" on public.task_submissions;
create policy "Signed-in users submit EcoTale task responses" on public.task_submissions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users upload their own observation photos" on storage.objects for insert to authenticated with check (bucket_id = 'observation-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users view their own observation photos" on storage.objects for select to authenticated using (bucket_id = 'observation-photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists "Visitors upload EcoTale task photos" on storage.objects;
create policy "Visitors upload EcoTale task photos" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'task-submission-photos');
