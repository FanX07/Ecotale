import './styles.css';
import { supabase } from './lib/supabase';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="app-shell">
    <iframe class="ecotale-app" src="${import.meta.env.BASE_URL}prototype.html?v=20261004-events" title="EcoTale"></iframe>
    <section class="auth-gate" aria-live="polite">
      <form class="auth-card" id="auth-form">
        <p class="auth-kicker">ECOTALE</p>
        <h1>Welcome back</h1>
        <p class="auth-copy" id="auth-copy">Sign in to save your nature stories and task progress.</p>
        <label>Username<input id="auth-username" name="username" autocomplete="username" minlength="3" maxlength="32" required /></label>
        <label>Password<input id="auth-password" name="password" type="password" autocomplete="current-password" minlength="6" required /></label>
        <p class="auth-message" id="auth-message"></p>
        <button class="auth-submit" type="submit">Sign in</button>
        <button class="auth-switch" id="auth-switch" type="button">Create an account</button>
        <button class="auth-preview" id="auth-preview" type="button" hidden>Preview without saving</button>
      </form>
    </section>
  </main>
`;

const appFrame = document.querySelector<HTMLIFrameElement>('.ecotale-app');
const authGate = document.querySelector<HTMLElement>('.auth-gate')!;
const authForm = document.querySelector<HTMLFormElement>('#auth-form')!;
const usernameInput = document.querySelector<HTMLInputElement>('#auth-username')!;
const passwordInput = document.querySelector<HTMLInputElement>('#auth-password')!;
const authMessage = document.querySelector<HTMLElement>('#auth-message')!;
const authSubmit = document.querySelector<HTMLButtonElement>('.auth-submit')!;
const authSwitch = document.querySelector<HTMLButtonElement>('#auth-switch')!;
const authCopy = document.querySelector<HTMLElement>('#auth-copy')!;
const previewButton = document.querySelector<HTMLButtonElement>('#auth-preview')!;

let creatingAccount = false;
let currentUserId: string | null = null;
let currentProfile: { username: string; joinedAt: string; userId: string } | null = null;

function usernameEmail(username: string) {
  return `${username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@ecotale.local`;
}

function profileFromUser(user: { id: string; email?: string; created_at?: string; user_metadata?: { display_name?: unknown } }) {
  const displayName = typeof user.user_metadata?.display_name === 'string'
    ? user.user_metadata.display_name.trim()
    : '';
  return {
    username: displayName || user.email?.split('@')[0] || 'EcoTale Explorer',
    joinedAt: user.created_at || new Date().toISOString(),
    userId: user.id
  };
}

function sendProfile() {
  if (!currentProfile) return;
  appFrame?.contentWindow?.postMessage({ type: 'ecotale:profile', payload: currentProfile }, window.location.origin);
  void sendPersonalSubmissions();
}

type CommunityEntry = {
  id: string;
  taskNumber: number;
  kind: string;
  title: string;
  story: string;
  tag: string;
  location: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
};

async function sendPersonalSubmissions() {
  if (!supabase || !currentUserId) return;
  const { data: submissions, error } = await supabase
    .from('task_submissions')
    .select('id, task_number, kind, title, body, tag, location, photo_path, created_at')
    .eq('user_id', currentUserId)
    .in('task_number', [1, 2, 3, 4, 5])
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !submissions) return;

  const history = await Promise.all(submissions.map(async item => {
    let imageUrl: string | null = null;
    if (item.photo_path) {
      const { data } = await supabase.storage.from('task-submission-photos').createSignedUrl(item.photo_path, 60 * 60);
      imageUrl = data?.signedUrl ?? null;
    }
    return {
      id: item.id, taskNumber: item.task_number, kind: item.kind, title: item.title,
      story: item.body, tag: item.tag || '', location: item.location || '',
      author: currentProfile?.username || 'EcoTale Explorer', createdAt: item.created_at, imageUrl
    };
  }));
  appFrame?.contentWindow?.postMessage({ type: 'ecotale:personal-submissions', payload: history }, window.location.origin);
}

async function sendCommunityFeed() {
  if (!supabase || !currentUserId) return;

  const { data: submissions, error } = await supabase
    .from('task_submissions')
    .select('id, user_id, task_number, kind, title, body, tag, location, photo_path, created_at')
    .eq('audience', 'Public')
    .order('created_at', { ascending: false })
    .limit(60);

  if (error || !submissions) return;

  const userIds = [...new Set(submissions.map(item => item.user_id).filter((id): id is string => Boolean(id)))];
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', userIds)
    : { data: [] as Array<{ id: string; display_name: string }> };
  const names = new Map((profiles || []).map(profile => [profile.id, profile.display_name]));

  const feed = await Promise.all(submissions.map(async item => {
    let imageUrl: string | null = null;
    if (item.photo_path) {
      const { data } = await supabase.storage
        .from('task-submission-photos')
        .createSignedUrl(item.photo_path, 60 * 60);
      imageUrl = data?.signedUrl ?? null;
    }
    return {
      id: item.id,
      taskNumber: item.task_number,
      kind: item.kind,
      title: item.title,
      story: item.body,
      tag: item.tag || '',
      location: item.location || '',
      author: item.user_id ? names.get(item.user_id) || 'EcoTale Explorer' : 'EcoTale Explorer',
      createdAt: item.created_at,
      imageUrl
    } satisfies CommunityEntry;
  }));

  appFrame?.contentWindow?.postMessage({ type: 'ecotale:community-feed', payload: feed }, window.location.origin);
}

appFrame?.addEventListener('load', sendProfile);

function syncSignedInUser(user: { id: string; email?: string; created_at?: string; user_metadata?: { display_name?: unknown } } | null) {
  currentUserId = user?.id ?? null;
  currentProfile = user ? profileFromUser(user) : null;
  if (user) {
    sendProfile();
    showApp();
  }
}

function showApp() {
  authGate.classList.add('is-hidden');
}

function showMessage(message: string, isError = true) {
  authMessage.textContent = message;
  authMessage.classList.toggle('is-error', isError);
}

function updateAuthMode() {
  authSubmit.textContent = creatingAccount ? 'Create account' : 'Sign in';
  authSwitch.textContent = creatingAccount ? 'I already have an account' : 'Create an account';
  authCopy.textContent = creatingAccount
    ? 'Choose a username and password to save your EcoTale work.'
    : 'Sign in to save your nature stories and task progress.';
  passwordInput.autocomplete = creatingAccount ? 'new-password' : 'current-password';
  showMessage('', false);
}

if (!supabase) {
  authCopy.textContent = 'Supabase is not configured yet. You can preview the app, but submissions will not be saved.';
  authForm.querySelectorAll('input, .auth-submit, .auth-switch').forEach(element => (element as HTMLInputElement | HTMLButtonElement).disabled = true);
  previewButton.hidden = false;
  previewButton.addEventListener('click', showApp);
} else {
  void supabase.auth.getSession().then(({ data }) => syncSignedInUser(data.session?.user ?? null));

  supabase.auth.onAuthStateChange((_event, session) => {
    syncSignedInUser(session?.user ?? null);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      void supabase.auth.getSession().then(({ data }) => syncSignedInUser(data.session?.user ?? null));
    }
  });

  authSwitch.addEventListener('click', () => {
    creatingAccount = !creatingAccount;
    updateAuthMode();
  });

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = usernameEmail(username);
    if (email === '@ecotale.local' || username.length < 3) return showMessage('Use at least 3 letters or numbers for your username.');
    authSubmit.disabled = true;
    showMessage(creatingAccount ? 'Creating your account…' : 'Signing in…', false);
    const response = creatingAccount
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: username } } })
      : await supabase.auth.signInWithPassword({ email, password });
    authSubmit.disabled = false;
    if (response.error) return showMessage(response.error.message);
    syncSignedInUser(response.data.user ?? null);
    if (creatingAccount && !response.data.session) return showMessage('Account created. Disable email confirmation in Supabase, then sign in.', false);
    showApp();
  });
}

type TaskSubmission = {
  taskNumber: number;
  kind: string;
  title: string;
  story: string;
  tag: string;
  image?: string | null;
  location: string;
  audience: string;
};

const MAX_UPLOAD_BYTES = 200 * 1024;
const MAX_UPLOAD_EDGE = 1600;

async function decodePhoto(photo: Blob) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(photo, { imageOrientation: 'from-image' });
    } catch {
      // Fall through to the broadly supported HTMLImageElement decoder.
    }
  }

  const url = URL.createObjectURL(photo);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Photo compression failed.')),
      'image/jpeg',
      quality
    );
  });
}

async function compressPhoto(photo: Blob) {
  if (photo.size <= MAX_UPLOAD_BYTES && /image\/(jpeg|webp)/i.test(photo.type)) return photo;

  const image = await decodePhoto(photo);
  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const initialScale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(sourceWidth, sourceHeight));
  let width = Math.max(1, Math.round(sourceWidth * initialScale));
  let height = Math.max(1, Math.round(sourceHeight * initialScale));
  let quality = 0.86;
  let smallest: Blob | null = null;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Photo compression is not supported in this browser.');

  for (let attempt = 0; attempt < 18; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const compressed = await canvasBlob(canvas, quality);
    if (!smallest || compressed.size < smallest.size) smallest = compressed;
    if (compressed.size <= MAX_UPLOAD_BYTES) {
      if ('close' in image && typeof image.close === 'function') image.close();
      return compressed;
    }

    if (quality > 0.48) {
      quality -= 0.09;
    } else {
      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
      quality = 0.78;
    }
  }

  if ('close' in image && typeof image.close === 'function') image.close();
  if (smallest && smallest.size <= MAX_UPLOAD_BYTES) return smallest;
  throw new Error('The photo could not be reduced below 200KB.');
}

async function storeTaskSubmission(submission: TaskSubmission) {
  if (!supabase) return;

  let photoPath: string | null = null;
  if (submission.image?.startsWith('blob:')) {
    try {
      const originalPhoto = await fetch(submission.image).then(response => response.blob());
      const photo = await compressPhoto(originalPhoto);
      const extension = photo.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      photoPath = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from('task-submission-photos')
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });
      if (error) photoPath = null;
    } catch {
      photoPath = null;
    }
  }

  await supabase.from('task_submissions').insert({
    user_id: currentUserId,
    task_number: submission.taskNumber,
    kind: submission.kind.slice(0, 40),
    title: submission.title.trim().slice(0, 160),
    body: submission.story.trim().slice(0, 2000),
    tag: submission.tag.slice(0, 40),
    location: submission.location.slice(0, 120),
    audience: submission.audience === 'Only me' ? 'Only me' : 'Public',
    photo_path: photoPath
  });
  void sendPersonalSubmissions();
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.source !== appFrame?.contentWindow) return;
  if (event.data?.type === 'ecotale:logout') {
    void (async () => {
      if (supabase) await supabase.auth.signOut();
      currentUserId = null;
      currentProfile = null;
      creatingAccount = false;
      authForm.reset();
      updateAuthMode();
      authGate.classList.remove('is-hidden');
      appFrame?.contentWindow?.location.reload();
    })();
    return;
  }
  if (event.data?.type === 'ecotale:profile-ready') {
    sendProfile();
    return;
  }
  if (event.data?.type === 'ecotale:community-ready') {
    void sendCommunityFeed();
    return;
  }
  if (event.data?.type !== 'ecotale:task-submission') return;
  const submission = event.data.payload as Partial<TaskSubmission>;
  if (!Number.isInteger(submission.taskNumber) || typeof submission.title !== 'string' || typeof submission.story !== 'string') return;
  void storeTaskSubmission(submission as TaskSubmission);
});
