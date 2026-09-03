import fs from 'node:fs';
import zlib from 'node:zlib';

const file = new URL('../public/prototype.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');

const manifestMatch = html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/);
const templateMatch = html.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/);
if (!manifestMatch || !templateMatch) throw new Error('Prototype bundle data was not found.');

const manifest = JSON.parse(manifestMatch[1]);

// The original prototype stores all seeded image slots in a bundled JSON
// resource. On static hosts the runtime misses that resource map and falls
// back to a non-existent sidecar. Generate an ordinary public JSON sidecar
// during every build. This is more reliable on mobile Safari than a very long
// data: URL embedded in JavaScript.
const imageSlotsStateEntry = manifest['0d1fa546-8124-4bbf-a011-a3edecac1302'];
const imageSlotsScriptEntry = manifest['44252422-0e0f-4f7a-b6e3-f475bf9caca6'];
if (imageSlotsStateEntry && imageSlotsScriptEntry) {
  let imageSlotsState = Buffer.from(imageSlotsStateEntry.data, 'base64');
  if (imageSlotsStateEntry.compressed) imageSlotsState = zlib.gunzipSync(imageSlotsState);
  fs.writeFileSync(new URL('../public/image-slots.state.json', import.meta.url), imageSlotsState);

  let imageSlotsScript = Buffer.from(imageSlotsScriptEntry.data, 'base64');
  if (imageSlotsScriptEntry.compressed) imageSlotsScript = zlib.gunzipSync(imageSlotsScript);
  imageSlotsScript = Buffer.from(imageSlotsScript.toString('utf8').replace(
    /const url = [\s\S]*?;\s*loadP = fetch\(url\)/,
    'const url = "./image-slots.state.json?v=20260903-final";\n    loadP = fetch(url)'
  ));
  imageSlotsScriptEntry.compressed = true;
  imageSlotsScriptEntry.data = zlib.gzipSync(imageSlotsScript, { level: 9 }).toString('base64');
}
const primitivesId = '459a8c3b-26cb-4d65-ad35-9fe60f773052';
const screensId = '7e8c2677-9d90-4cde-91aa-7e105d9cbf06';
const primitivesEntry = manifest[primitivesId];
let primitivesBuffer = Buffer.from(primitivesEntry.data, 'base64');
if (primitivesEntry.compressed) primitivesBuffer = zlib.gunzipSync(primitivesBuffer);
let primitives = primitivesBuffer.toString('utf8');

if (!primitives.includes('Native shell adapter')) {
  primitives = primitives.replace(
    /function StatusBar\([\s\S]*?\n}\n\n\/\/ ─── Bottom Tab Bar/,
    `// Native shell adapter: iOS supplies the real status bar.
function StatusBar() {
  return <div style={{ height: 0, flexShrink: 0 }} />;
}

// ─── Bottom Tab Bar`
  );
  primitives = primitives.replace(
    "position: 'absolute', left: 16, right: 16, bottom: 14,",
    "position: 'absolute', left: 16, right: 16, bottom: 'max(10px, env(safe-area-inset-bottom))',"
  );
  primitives = primitives.replace(
    /function HomeIndicator\([\s\S]*?\n}\n\n\/\/ ─── Phone Frame/,
    `function HomeIndicator() {
  return null;
}

// ─── Phone Frame`
  );
  primitives = primitives.replace(
    /function PhoneFrame\([\s\S]*?\n}\n\n\/\/ ─── Striped placeholder/,
    `function PhoneFrame({ children }) {
  return <div className="native-phone-frame">{children}</div>;
}

// ─── Striped placeholder`
  );
}

if (!primitives.includes('className="ecotale-tabbar"')) {
  primitives = primitives.replace(
    /function TabBar\(([\s\S]*?)return \(\n    <div style=/,
    'function TabBar($1return (\n    <div className="ecotale-tabbar" style='
  );
}

// Use filled icons for the native task carousel and completion visuals.
primitives = primitives.replace(
  'strokeWidth={1.6} strokeLinejoin="round">',
  'strokeWidth={fill === \'none\' ? 1.6 : 0} strokeLinejoin="round">'
);

const compressedPrimitives = zlib.gzipSync(Buffer.from(primitives), { level: 9 });
primitivesEntry.compressed = true;
primitivesEntry.data = compressedPrimitives.toString('base64');

const screensEntry = manifest[screensId];
let screensBuffer = Buffer.from(screensEntry.data, 'base64');
if (screensEntry.compressed) screensBuffer = zlib.gunzipSync(screensBuffer);
let screens = screensBuffer.toString('utf8');

// Welcome copy uses a centered text block, including the smaller description.
if (!screens.includes('welcome-copy-centered')) {
  screens = screens.replace(
    "position: 'absolute', top: 70, left: 28, right: 28, zIndex: 5",
    "position: 'absolute', top: 70, left: 28, right: 28, zIndex: 5, textAlign: 'center' /* welcome-copy-centered */"
  );
  screens = screens.replace(
    "margin: '20px 0 0', maxWidth: 290, fontWeight: 400, fontFamily: \"\\\"SF Pro Text\\\"\"",
    "margin: '20px auto 0', maxWidth: 290, fontWeight: 400, fontFamily: \"\\\"SF Pro Text\\\"\", textAlign: 'center'"
  );
}

const figmaTaskSource = fs.readFileSync(new URL('./figma-task-flow.jsx', import.meta.url), 'utf8');
const taskData = figmaTaskSource.match(/\/\/ START TASK DATA\n([\s\S]*?)\n\/\/ END TASK DATA/)[1];
const taskFlow = figmaTaskSource.match(/\/\/ START TASK FLOW\n([\s\S]*?)\n\/\/ END TASK FLOW/)[1];

screens = screens.replace(/const TASKS = \[[\s\S]*?\];/, taskData);
if (screens.includes('FIGMA_TASK_FLOW_VERSION')) {
  screens = screens.replace(
    /const FIGMA_TASK_FLOW_VERSION[\s\S]*?\nfunction TaskScreen\([\s\S]*?\n}\n\nObject\.assign/,
    `${taskFlow}\n\nObject.assign`
  );
} else if (screens.includes('function FigmaTaskIntro')) {
  screens = screens.replace(
    /function FigmaTaskIntro\([\s\S]*?\nfunction TaskScreen\([\s\S]*?\n}\n\nObject\.assign/,
    `${taskFlow}\n\nObject.assign`
  );
} else {
  screens = screens.replace(
    /function TaskScreen\([\s\S]*?\n}\n\nObject\.assign/,
    `${taskFlow}\n\nObject.assign`
  );
}

if (!screens.includes('shortTitle || task.title')) {
  screens = screens.replace(
    'onClick={() => setTaskIdx(0)}',
    'onClick={() => setTaskIdx(i => (i + TASKS.length - 1) % TASKS.length)}'
  );
  screens = screens.replace(
    'onClick={() => setTaskIdx(2)}',
    'onClick={() => setTaskIdx(i => (i + 1) % TASKS.length)}'
  );
  screens = screens.replace('opacity: taskIdx === 0 ? 1 : 0.5', 'opacity: 0.72');
  screens = screens.replace('opacity: taskIdx === 2 ? 1 : 0.5', 'opacity: 0.72');
  screens = screens.replace('Task{task.idx}: {task.title}', 'Task{task.idx}: {task.shortTitle || task.title}');
  screens = screens.replace('name="planet" size={42}', 'name={task.icon || "planet"} size={42}');
}

if (!screens.includes('home-task-switch')) {
  screens = screens.replace(
    /          \{\/\* Side icons \(clickable to switch task\) \*\/\}[\s\S]*?          \{\/\* Center button \*\/\}/,
    `          {/* Task carousel switches */}
          {taskIdx > 0 && <button className="home-task-switch home-task-switch-left" onClick={() => setTaskIdx(i => i - 1)} aria-label="Previous task"><span>←</span></button>}
          {taskIdx < TASKS.length - 1 && <button className="home-task-switch home-task-switch-right" onClick={() => setTaskIdx(i => i + 1)} aria-label="Next task"><span>→</span></button>}

          {/* Center button */}`
  );
  screens = screens.replace(
    '<Icon name={task.icon || "planet"} size={42} color="#fff" strokeWidth={1.8} />',
    '<Icon name={task.icon || "planet"} size={42} color="#fff" fill="#fff" strokeWidth={0} />'
  );
}

// Keep the dashboard focused on the next unfinished task and do not award
// duplicate puzzle pieces when a completed task is revisited.
if (!screens.includes('const [taskCursor, setTaskCursor]')) {
  screens = screens.replace(
    /function HomeScreen\(\{ onOpenTask, onOpenNews, puzzlePieces, onTabChange, activeTab \}\) \{\n  const \[taskIdx, setTaskIdx\] = React\.useState\([^;]+;/,
    'function HomeScreen({ onOpenTask, onOpenNews, puzzlePieces, taskCursor = 0, onTabChange, activeTab }) {\n  const [taskIdx, setTaskIdx] = React.useState(taskCursor);'
  );
}

// Profile list rows navigate forward; the original icon was a left-facing back arrow.
if (!screens.includes('profile-right-arrows')) {
  screens = screens.replace(
    '<Icon name="back" size={16} color={COLORS.ink3} strokeWidth={2} />',
    '<span className="profile-right-arrows" style={{ color: COLORS.ink3, fontSize: 24, lineHeight: 1 }}>›</span>'
  );
}

const compressedScreens = zlib.gzipSync(Buffer.from(screens), { level: 9 });
screensEntry.compressed = true;
screensEntry.data = compressedScreens.toString('base64');

// Profile is supplied by a separate prototype bundle.  Replace the left-facing
// back glyph used for the three settings rows with an explicit right chevron.
const profileEntry = manifest['cc69a8d3-8216-442c-b91c-00df652c1e93'];
if (profileEntry) {
  let profileBuffer = Buffer.from(profileEntry.data, 'base64');
  if (profileEntry.compressed) profileBuffer = zlib.gunzipSync(profileBuffer);
  let profile = profileBuffer.toString('utf8');
  profile = profile.replace(
    '<Icon name="back" size={16} color={COLORS.ink3} strokeWidth={2} />\n                <div style={{ transform: \'scaleX(-1)\', display: \'none\' }} />',
    '<span style={{ color: COLORS.ink3, fontSize: 24, lineHeight: 1 }}>›</span>'
  );
  if (!profile.includes('ecotale:profile-ready')) {
    profile = profile.replace(
      'function ProfileScreen({ onTabChange, activeTab, puzzlePieces }) {\n  return (',
      `function ProfileScreen({ onTabChange, activeTab, puzzlePieces }) {
  const [viewerProfile, setViewerProfile] = React.useState({ username: 'EcoTale Explorer', joinedAt: new Date().toISOString() });
  React.useEffect(() => {
    function receiveProfile(event) {
      if (event.origin !== window.location.origin || event.data?.type !== 'ecotale:profile') return;
      const next = event.data.payload;
      if (typeof next?.username === 'string' && typeof next?.joinedAt === 'string') setViewerProfile(next);
    }
    window.addEventListener('message', receiveProfile);
    window.parent.postMessage({ type: 'ecotale:profile-ready' }, window.location.origin);
    return () => window.removeEventListener('message', receiveProfile);
  }, []);
  const joinedLabel = new Date(viewerProfile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return (`
    );
    profile = profile.replace('>Alex Morgan</h2>', '>{viewerProfile.username}</h2>');
    profile = profile.replace("Junior · UIUC '27 · Joined Sep 2025", 'Joined {joinedLabel}');
  }
  profileEntry.compressed = true;
  profileEntry.data = zlib.gzipSync(Buffer.from(profile), { level: 9 }).toString('base64');
}

let template = JSON.parse(templateMatch[1]);
// Require the facilitator's task-specific password every time a player opens
// a task from the home carousel.  Keep the gate in the prototype shell so it
// protects all five task implementations consistently.
if (!template.includes('TASK_ENTRY_PASSWORDS')) {
  template = template.replace(
    '  function PhoneApp({ initialScreen = \'welcome\', label }) {',
    `  const TASK_ENTRY_PASSWORDS = { 1: 'eco', 2: 'tale', 3: 'uiuc', 4: 'nature', 5: 'protect' };

  function TaskPasswordDialog({ task, onCancel, onUnlock }) {
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
      function closeOnEscape(event) {
        if (event.key === 'Escape') onCancel();
      }
      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onCancel]);

    function submit(event) {
      event.preventDefault();
      if (password === TASK_ENTRY_PASSWORDS[task.idx]) {
        onUnlock();
        return;
      }
      setError('Incorrect password. Please try again.');
    }

    return ReactDOM.createPortal(
      <div className="task-password-backdrop" onClick={onCancel} role="presentation">
        <form className="task-password-card" onSubmit={submit} onClick={event => event.stopPropagation()}>
          <button className="task-password-close" type="button" onClick={onCancel} aria-label="Close">×</button>
          <p className="task-password-kicker">TASK {task.idx}</p>
          <h2>Enter task password</h2>
          <p className="task-password-copy">Enter the password to begin {task.shortTitle || task.title}.</p>
          <label htmlFor={'task-password-' + task.idx}>Password</label>
          <input
            id={'task-password-' + task.idx}
            type="password"
            value={password}
            onChange={event => { setPassword(event.target.value); setError(''); }}
            autoComplete="off"
            autoFocus
          />
          <p className="task-password-error" aria-live="polite">{error}</p>
          <button className="task-password-submit" type="submit">Start task</button>
        </form>
      </div>,
      document.body
    );
  }

  function PhoneApp({ initialScreen = 'welcome', label }) {`
  );
  template = template.replace(
    '    const [activeTask, setActiveTask] = React.useState(null);',
    '    const [activeTask, setActiveTask] = React.useState(null);\n    const [passwordTask, setPasswordTask] = React.useState(null);'
  );
  template = template.replace(
    '        onOpenTask={(t) => { setActiveTask(t); setScreen(\'task\'); }}',
    '        onOpenTask={(t) => setPasswordTask(t)}'
  );
  template = template.replace(
    '        {showAdd && <AddSightingScreen onClose={() => setShowAdd(false)} onLogged={() => { setShowAdd(false); setPieces(p => Math.min(5, p + 1)); }}/>}\n      </PhoneFrame>',
    `        {showAdd && <AddSightingScreen onClose={() => setShowAdd(false)} onLogged={() => { setShowAdd(false); setPieces(p => Math.min(5, p + 1)); }}/>}\n        {passwordTask && <TaskPasswordDialog\n          task={passwordTask}\n          onCancel={() => setPasswordTask(null)}\n          onUnlock={() => { const task = passwordTask; setPasswordTask(null); setActiveTask(task); setScreen('task'); }}\n        />}\n      </PhoneFrame>`
  );
}
// A new player starts with an empty puzzle board. Completion state is earned,
// never pre-filled by the selected preview screen.
template = template.replace(
  /const \[pieces, setPieces\] = React\.useState\([^;]+;/,
  'const [pieces, setPieces] = React.useState(0);'
);
template = template.replace(
  /const \[completedTasks, setCompletedTasks\] = React\.useState\([^;]+;/,
  'const [completedTasks, setCompletedTasks] = React.useState([]);'
);
if (!template.includes('const [taskCursor, setTaskCursor]')) {
  template = template.replace(
    "const [activeTask, setActiveTask] = React.useState(null);",
    "const [activeTask, setActiveTask] = React.useState(null);\n    const [taskCursor, setTaskCursor] = React.useState(initialScreen === 'home' ? 1 : 0);\n    const [completedTasks, setCompletedTasks] = React.useState(initialScreen === 'home' ? [1] : []);"
  );
  template = template.replace(
    'puzzlePieces={pieces}\n        activeTab={tab}',
    'puzzlePieces={pieces}\n        taskCursor={taskCursor}\n        activeTab={tab}'
  );
  template = template.replace(
    "onComplete={() => { setPieces(p => Math.min(5, p + 1)); setScreen('home'); }}",
    "onComplete={() => { const finished = activeTask && !completedTasks.includes(activeTask.idx); if (finished) { setCompletedTasks(current => [...current, activeTask.idx]); setPieces(p => Math.min(5, p + 1)); } if (activeTask) setTaskCursor(activeTask.idx % TASKS.length); setScreen('home'); }}"
  );
}
if (!template.includes('ecotale-native-shell')) {
  template = template.replace(
    'width=device-width, initial-scale=1',
    'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no'
  );
  template = template.replace(
    '</head>',
    `<style id="ecotale-native-shell">
      html, body, #root { width: 100%; height: 100%; min-height: 100%; margin: 0; overflow: hidden; }
      body { padding: 0 !important; background: #FBFBF8 !important; overscroll-behavior: none; }
      .head { display: none !important; }
      .stage { display: block !important; width: 100%; height: 100%; }
      .native-phone-frame { width: 100%; height: 100%; position: relative; overflow: hidden; background: #FBFBF8; }
      button { -webkit-tap-highlight-color: transparent; }
      image-slot { pointer-events: none; }
    </style></head>`
  );
  template = template.replace(
    /function App\(\) \{[\s\S]*?\n  \}\n\n  ReactDOM\.createRoot/,
    `function App() {
    return <PhoneApp initialScreen="welcome" />;
  }

  ReactDOM.createRoot`
  );
}

if (!template.includes('ecotale-responsive-v2')) {
  template = template.replace(
    '</head>',
    `<style id="ecotale-responsive-v2">
      :root { --content-drop: clamp(48px, 6.7vh, 57px); }
      html, body, #root, .stage, .native-phone-frame { height: 100%; height: 100dvh; }
      .native-phone-frame > div:has(> .ecotale-tabbar) > :not(.ecotale-tabbar) {
        transform: translateY(var(--content-drop));
      }
      .ecotale-tabbar { transform: none !important; }

      .figma-task-intro, .task-flow-screen {
        width: 100%; height: 100%; min-height: 100dvh; position: relative;
        overflow: hidden; background: #fbfbf8; color: #111;
        font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
      }
      .figma-task-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .figma-task-gradient {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.72) 22%, rgba(255,255,255,0) 66%);
        pointer-events: none;
      }
      .figma-task-back {
        position: absolute; z-index: 3; top: clamp(18px, 3vh, 30px); left: clamp(18px, 6vw, 24px);
        width: 44px; height: 44px; border: 0; padding: 12px; border-radius: 50%;
        background: rgba(255,255,255,.42); backdrop-filter: blur(10px);
      }
      .figma-task-back img { width: 20px; height: 20px; display: block; }
      .figma-task-copy { position: absolute; z-index: 2; top: clamp(66px, 9vh, 90px); left: clamp(30px, 11vw, 44px); right: 22px; text-align: left; }
      .figma-task-copy h1 {
        max-width: 330px; margin: 0; font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
        font-size: clamp(36px, 10.2vw, 42px); line-height: 1.25; font-weight: 500; letter-spacing: -.5px;
      }
      .figma-task-copy p { max-width: 305px; margin: 12px 0 0 5px; font-size: clamp(15px, 4.1vw, 17px); line-height: 1.28; font-weight: 500; }
      .figma-task-start {
        position: absolute; z-index: 4; left: 50%; bottom: clamp(58px, 9vh, 90px); transform: translateX(-50%);
        width: 150px; height: 150px; padding: 0; border: 0; border-radius: 50%; background: transparent;
      }
      .figma-task-start img { position: absolute; inset: -10px; width: 170px; height: 170px; }
      .figma-task-start span { position: relative; z-index: 1; color: #72c85d; font-size: 24px; font-weight: 800; }

      .task-flow-screen { overflow-y: auto; padding-bottom: 28px; }
      .task-flow-topbar { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: 8px; padding: clamp(18px, 3vh, 28px) 20px 8px; }
      .task-flow-topbar button, .task-flow-topbar strong {
        width: 42px; height: 42px; border-radius: 50%; border: 1px solid #ecece6; background: #fff;
        display: flex; align-items: center; justify-content: center;
      }
      .task-flow-topbar button img { width: 18px; height: 18px; }
      .task-flow-topbar span { text-align: center; color: #5a5f62; font-size: 14px; }
      .task-flow-topbar strong { color: #4a9a4a; font-size: 13px; }
      .task-flow-content { padding: 12px clamp(20px, 6vw, 28px) 36px; text-align: left; }
      .task-kicker { color: #4a9a4a; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .task-flow-content h2, .task-complete-screen h2 { margin: 8px 0 18px; font-family: "Source Serif 4", Georgia, serif; font-size: clamp(27px, 7.5vw, 32px); line-height: 1.15; font-weight: 500; }
      .task-prompt { margin: -6px 0 16px; color: #5a5f62; font-size: 15px; line-height: 1.45; }
      .task-quiz-photo, .task-activity-photo { width: 100%; height: clamp(142px, 22vh, 190px); object-fit: cover; border-radius: 20px; margin-bottom: 18px; }
      .task-options { display: flex; flex-direction: column; gap: 10px; }
      .task-options button { min-height: 58px; padding: 14px 16px; border: 1.5px solid #ecece6; border-radius: 14px; background: #fff; text-align: left; display: flex; align-items: center; justify-content: space-between; }
      .task-options button.correct, .task-options button.selected { background: #dcefd8; border-color: #7cc074; }
      .task-options button.wrong { background: #fce6e6; border-color: #e5667a; }
      .task-options small { display: block; margin-top: 4px; color: #4a9a4a; }
      .task-options.compact button { min-height: 52px; }
      .task-flow-content textarea { width: 100%; min-height: 126px; resize: none; padding: 15px; border: 1.5px solid #deded7; border-radius: 16px; background: #fff; font: 16px -apple-system, "SF Pro Text", system-ui, sans-serif; }
      .task-primary-button { width: 100%; min-height: 52px; margin-top: 20px; border: 0; border-radius: 999px; background: #4a9a4a; color: #fff; font-size: 16px; font-weight: 700; }
      .task-primary-button:disabled { opacity: .35; }
      .task-complete-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; text-align: center; }
      .task-complete-piece { width: 150px; height: 150px; margin-bottom: 22px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #dff0d9, #dcefd8); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 42px rgba(54,179,249,.28); }
      .task-complete-screen h2 { margin-bottom: 8px; }
      .task-complete-screen p { max-width: 300px; margin: 0; color: #5a5f62; line-height: 1.5; }
      .task-complete-screen .task-primary-button { max-width: 260px; }

      @media (max-height: 700px) {
        :root { --content-drop: 42px; }
        .figma-task-copy { top: 58px; }
        .figma-task-copy h1 { font-size: 34px; }
        .figma-task-start { bottom: 30px; transform: translateX(-50%) scale(.84); }
        .task-quiz-photo, .task-activity-photo { height: 126px; }
      }
    </style></head>`
  );
}

template = template.replaceAll('href="/task1-flow.css"', 'href="task1-flow.css"');
template = template.replace(/href="task1-flow\.css(?:\?[^\"]*)?"/g, 'href="task1-flow.css?v=20260903-ui5"');
if (!template.includes('task1-flow.css')) {
  template = template.replace('</head>', '<link rel="stylesheet" href="task1-flow.css?v=20260903-ui5"></head>');
}

const safeManifest = JSON.stringify(manifest).replace(/<\/script/gi, '<\\u002Fscript');
const safeTemplate = JSON.stringify(template).replace(/<\/script/gi, '<\\u002Fscript');
html = html.replace(manifestMatch[0], `<script type="__bundler/manifest">\n${safeManifest}\n  </script>`);
html = html.replace(templateMatch[0], `<script type="__bundler/template">\n${safeTemplate}\n  </script>`);
fs.writeFileSync(file, html);

console.log('Converted EcoTale prototype to the native single-screen tab shell.');
