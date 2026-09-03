import './styles.css';
import { supabase } from './lib/supabase';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="app-shell">
    <iframe class="ecotale-app" src="${import.meta.env.BASE_URL}prototype.html?v=20260903-flat3" title="EcoTale"></iframe>
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

function usernameEmail(username: string) {
  return `${username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@ecotale.local`;
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
  void supabase.auth.getSession().then(({ data }) => {
    currentUserId = data.session?.user.id ?? null;
    if (currentUserId) showApp();
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
    currentUserId = response.data.user?.id ?? null;
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

async function storeTaskSubmission(submission: TaskSubmission) {
  if (!supabase) return;

  let photoPath: string | null = null;
  if (submission.image?.startsWith('blob:')) {
    try {
      const photo = await fetch(submission.image).then(response => response.blob());
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
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.source !== appFrame?.contentWindow) return;
  if (event.data?.type !== 'ecotale:task-submission') return;
  const submission = event.data.payload as Partial<TaskSubmission>;
  if (!Number.isInteger(submission.taskNumber) || typeof submission.title !== 'string' || typeof submission.story !== 'string') return;
  void storeTaskSubmission(submission as TaskSubmission);
});
