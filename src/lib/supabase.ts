import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __ECOTALE_SUPABASE__?: { url?: string; anonKey?: string };
  }
}

const runtimeConfig = window.__ECOTALE_SUPABASE__;
const url = runtimeConfig?.url || import.meta.env.VITE_SUPABASE_URL;
const anonKey = runtimeConfig?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    })
  : null;
