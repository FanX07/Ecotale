import './styles.css';
import { supabase } from './lib/supabase';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="app-shell">
    <iframe class="ecotale-app" src="/prototype.html" title="EcoTale"></iframe>
  </main>
`;

const appFrame = document.querySelector<HTMLIFrameElement>('.ecotale-app');

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
