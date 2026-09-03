// START TASK DATA
const TASKS = [
  { idx: 1, shortTitle: 'Idea Garden', title: 'Start your Ecotale in the Idea Garden.', subtitle: 'Discover the wonders of nature on the UIUC campus.', image: '/figma-tasks/task-1-idea-garden.png', objectPosition: 'center center', icon: 'plant-bud', color: '#7CC074' },
  { idx: 2, shortTitle: 'Mutualism Quiz', title: 'Symbiosis Exploration', subtitle: 'In nature, many species depend on one another to survive.', image: '/figma-tasks/task-2-symbiosis.png', objectPosition: '44% center', icon: 'planet', color: '#4A9A4A' },
  { idx: 3, shortTitle: 'Wildlife Story', title: 'Share Your Wildlife Story', subtitle: 'Have you ever encountered wildlife in Illinois?', image: '/figma-tasks/task-3-wildlife.png', objectPosition: '52% center', icon: 'bird', color: '#36B3F9', activityTitle: 'Tell your wildlife story', activityPrompt: 'Write a short note about what you saw and where you saw it.', story: true },
  { idx: 4, shortTitle: 'Nature & Culture', title: 'Nature in Your Life and Culture', subtitle: 'Nature shapes our beliefs, our rituals, and the way we see the world.', image: '/figma-tasks/task-4-culture.png', objectPosition: '50% center', icon: 'leaf', color: '#7CC074', activityTitle: 'Where does nature appear in your life?', activityPrompt: 'Choose one connection you would like to share.', choices: ['Food and family', 'Art and stories', 'Traditions and celebrations'] },
  { idx: 5, shortTitle: 'Small Actions', title: 'Small Actions, Big Impact', subtitle: 'Even small choices in daily life can make a difference for nature.', image: '/figma-tasks/task-5-impact.png', objectPosition: '45% center', icon: 'puzzle', color: '#BFE85A', activityTitle: 'Choose one action for this week', activityPrompt: 'Make a small commitment that helps protect nature.', choices: ['Walk or bike for one trip', 'Use a reusable bottle', 'Plant or protect a native species'] }
];
// END TASK DATA

// START TASK FLOW
const FIGMA_TASK_FLOW_VERSION = 'task2-responsive-interactive-v2';
const REWARD_PUZZLE = '/figma-task2/asset-08.png';

function emitTaskSubmission(taskNumber, kind, submission) {
  window.parent.postMessage({
    type: 'ecotale:task-submission',
    payload: { taskNumber, kind, ...submission }
  }, window.location.origin);
}

const TASK1_ASSETS = {
  background: '/figma-task1/garden-background.png',
  gardenHero: '/figma-task1/garden-hero.png',
  gardenChildrens: '/figma-task1/garden-childrens.png',
  gardenPhoto: '/figma-task1/garden-photo.png',
  gardenSerenity: '/figma-task1/garden-serenity.png',
  gardenTrials: '/figma-task1/garden-trials.png',
  herbaceous: '/figma-task1/type-herbaceous.png',
  shrub: '/figma-task1/type-shrub.png',
  tree: '/figma-task1/type-tree.png',
  coneflower: '/figma-task1/coneflower.png',
  hazelnut: '/figma-task1/hazelnut.png',
  redbud: '/figma-task1/redbud.png',
  chokeberry: '/figma-task1/black-chokeberry.png',
  puzzle: '/figma-task1/puzzle-piece.png'
};

const TASK1_PLANTS = [
  {
    category: 'Herbaceous', uploadLabel: 'Herbaceous Plants', name: 'Pale Purple Coneflower', image: TASK1_ASSETS.coneflower,
    appearance: 'Long, drooping purple petals surround a tall central cone.',
    growth: 'Thrives in sunny, dry, open spaces from late spring to early summer.',
    ecological: 'Nectar feeds bees and butterflies; fall seeds feed goldfinches.'
  },
  {
    category: 'Shrub', uploadLabel: 'Shrubs', name: 'American Hazelnut', image: TASK1_ASSETS.hazelnut,
    appearance: 'Rounded, softly toothed leaves grow on arching branches that turn golden in fall.',
    growth: 'Grows in part shade to full sun at woodland edges or in home landscapes.',
    ecological: 'Its nuts feed wildlife, while dense branches shelter small mammals.'
  },
  {
    category: 'Trees', uploadLabel: 'Trees', name: 'Eastern Redbud', image: TASK1_ASSETS.redbud,
    appearance: 'Bright pink blossoms appear on bare branches before heart-shaped leaves.',
    growth: 'Grows in open woodland and sunny campus spaces at an easy-to-observe height.',
    ecological: 'Early flowers feed pollinators, and seeds support birds.'
  }
];

function FigmaTaskIntro({ task, onBack, onStart }) {
  return (
    <div className="figma-task-intro" data-task1-step="intro">
      <img className="figma-task-bg" src={task.image} alt="" style={{ objectPosition: task.objectPosition }} />
      <div className="figma-task-gradient" />
      <button className="figma-task-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
      <div className="figma-task-copy"><h1>{task.title}</h1><p>{task.subtitle}</p></div>
      <button className="figma-task-start" onClick={onStart} aria-label={'Start task ' + task.idx}><img src="/figma-tasks/start-disc.svg" alt="" /><span>Start</span></button>
    </div>
  );
}

function Task1Backdrop() {
  return <><img className="task1-garden-bg" src={TASK1_ASSETS.background} alt="" /><div className="task1-garden-wash" /></>;
}

function Task1Header({ title, onBack }) {
  return (
    <header className="task1-header">
      <button onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
      <h2>{title}</h2>
      <span aria-hidden="true" />
    </header>
  );
}

function Task1Next({ onClick, disabled, label = 'Next' }) {
  return <button className="task1-next" onClick={onClick} disabled={disabled} aria-label={label}><span>→</span></button>;
}

function Task1Page({ step, title, onBack, onNext, nextDisabled = false, children, className = '' }) {
  return (
    <div className={'task1-page ' + className} data-task1-step={step}>
      <Task1Backdrop />
      <Task1Header title={title} onBack={onBack} />
      <main className="task1-page-content">{children}</main>
      {onNext && <Task1Next onClick={onNext} disabled={nextDisabled} />}
    </div>
  );
}

function GardenOverview({ onBack, onNext }) {
  const gardens = [
    ['Children’s garden', TASK1_ASSETS.gardenChildrens],
    ['Photo garden', TASK1_ASSETS.gardenPhoto],
    ['Serenity garden', TASK1_ASSETS.gardenSerenity],
    ['Trials garden', TASK1_ASSETS.gardenTrials]
  ];
  return (
    <Task1Page step="garden-overview" title="Welcome to the Idea Garden" onBack={onBack} onNext={onNext} className="task1-overview">
      <p className="task1-intro-text">A living UIUC Master Gardeners showcase with five seasonal plant areas.</p>
      <img className="task1-garden-hero" src={TASK1_ASSETS.gardenHero} alt="The Idea Garden" />
      <h3>Themed Gardens</h3>
      <div className="task1-garden-grid">{gardens.map(([name, image]) => <article key={name}><img src={image} alt="" /><strong>{name}</strong></article>)}</div>
    </Task1Page>
  );
}

function PlantTypes({ onBack, onNext }) {
  const types = [['Herbaceous Plants', TASK1_ASSETS.herbaceous], ['Shrubs', TASK1_ASSETS.shrub], ['Trees', TASK1_ASSETS.tree]];
  return (
    <Task1Page step="plant-types" title="Plant Types You Can Find Here" onBack={onBack} onNext={onNext}>
      <p className="task1-intro-text">New plants appear throughout the season.</p>
      <h3>Plant Types</h3>
      <div className="task1-type-list">{types.map(([name, image]) => <article key={name}><img src={image} alt="" /><strong>{name}</strong></article>)}</div>
    </Task1Page>
  );
}

function PlantDetail({ plant, step, onBack, onNext }) {
  return (
    <Task1Page step={step} title={<>{plant.category}<br />{plant.name}</>} onBack={onBack} onNext={onNext} className="task1-detail-page">
      <img className="task1-detail-photo" src={plant.image} alt={plant.name} />
      <section className="task1-facts">
        <h3>Appearance</h3><p>{plant.appearance}</p>
        <h3>Growth habits</h3><p>{plant.growth}</p>
        <h3>Ecological value</h3><p>{plant.ecological}</p>
      </section>
    </Task1Page>
  );
}

function EcosystemLayers({ onBack, onNext }) {
  return (
    <Task1Page step="ecosystem-layers" title={<>Herbaceous<br />Pale Purple Coneflower</>} onBack={onBack} onNext={onNext} className="task1-layers-page">
      <div className="task1-layer top"><img src={TASK1_ASSETS.redbud} alt="Eastern Redbud" /><p>Eastern Redbud gives pollinators early spring nectar.</p></div>
      <div className="task1-layer-pair">
        <div className="task1-layer"><img src={TASK1_ASSETS.coneflower} alt="Pale Purple Coneflower" /><p>Coneflower feeds bees, butterflies, and seed-eating birds.</p></div>
        <div className="task1-layer"><img src={TASK1_ASSETS.hazelnut} alt="American Hazelnut" /><p>Hazelnut offers nuts and dense cover for wildlife.</p></div>
      </div>
      <p className="task1-layer-summary">Together, these layers provide food, shelter, and a stronger habitat.</p>
    </Task1Page>
  );
}

function PlantHuntMission({ onBack, onNext }) {
  return (
    <Task1Page step="plant-hunt-mission" title="" onBack={onBack} onNext={onNext} className="task1-mission-page">
      <section className="task1-mission-card">
        <span className="task1-pin" />
        <h2>Task 1<br />Plant Hunt</h2>
        <div className="task1-sprout"><span /><i /></div>
        <strong>Find one plant from each category—herbaceous, shrub, and tree.<br />Take a photo and upload it to verify your discovery.</strong>
        <p>Collect all three photos to earn your first Puzzle Piece!</p>
      </section>
    </Task1Page>
  );
}

function PlantTip({ plant, onClose }) {
  const tips = {
    'Herbaceous Plants': { title: 'Herbaceous Plant Tip', facts: ['Soft, non-woody stems usually die back in winter.', 'Look for flowers and leaves growing close to the ground.'], hint: 'Find a pale purple coneflower with a raised central cone.' },
    'Shrubs': { title: 'Shrub Tip', facts: ['Short woody plants with several stems near the ground.', 'Look for dense, rounded growth along paths and garden edges.'], hint: 'Find a compact shrub with glossy leaves and small dark berries.' },
    'Trees': { title: 'Tree Tip', facts: ['Trees have one main woody trunk and grow taller than shrubs.', 'Look up for a broad canopy and branching high above the ground.'], hint: 'Find an Eastern Redbud with heart-shaped leaves or pink spring blossoms.' }
  };
  const tip = tips[plant.uploadLabel];
  return ReactDOM.createPortal(
    <div className="task1-modal-backdrop" role="dialog" aria-modal="true" aria-label={tip.title} onClick={onClose}>
      <section className="task1-tip-card" onClick={event => event.stopPropagation()}>
        <button className="task1-tip-close" onClick={onClose} aria-label="Close">×</button>
        <h2>{tip.title}</h2>
        <h3>What to look for</h3>
        <ul>{tip.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
        <img src={plant.image} alt={plant.name} />
        <h3 className="hint">Hint: Find {plant.name}</h3>
        <ul className="hint"><li>{tip.hint}</li></ul>
      </section>
    </div>,
    document.body
  );
}

function UploadSheet({ category, onClose, onFile }) {
  return (
    <div className="task1-sheet-backdrop" onClick={onClose}>
      <section className="task1-upload-sheet" onClick={event => event.stopPropagation()} aria-label={'Upload ' + category.uploadLabel}>
        <h3>Upload</h3>
        <div className="task1-upload-actions">
          <label>
            <span className="task1-gallery-icon">▧</span><strong>Choose From Gallery</strong>
            <input type="file" accept="image/*" onChange={event => onFile(event.target.files && event.target.files[0])} />
          </label>
          <label>
            <span className="task1-camera-icon">●</span><strong>Take Photo</strong>
            <input type="file" accept="image/*" capture="environment" onChange={event => onFile(event.target.files && event.target.files[0])} />
          </label>
        </div>
      </section>
    </div>
  );
}

function PlantAnswer({ plant, image, initialAnswer, onBack, onSave }) {
  const [answer, setAnswer] = React.useState(initialAnswer || '');
  return (
    <Task1Page step="plant-answer" title="Plant Hunt" onBack={onBack} className="task1-answer-page">
      <img className="task1-answer-photo" src={image} alt={plant.uploadLabel} />
      <h2 className="task1-answer-question">Pick a plant. How does it support the life around it?</h2>
      <p className="task1-answer-helper">Think about what this plant provides for pollinators, birds, or other plants and animals.</p>
      <textarea value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Write your observation..." aria-label="How this plant supports life" />
      <button className="task1-answer-save" onClick={() => onSave(answer)}>Save answer</button>
    </Task1Page>
  );
}

function PlantHunt({ onBack, onNext, uploads, setUploads, onUploaded }) {
  const [uploadIndex, setUploadIndex] = React.useState(null);
  const [tipIndex, setTipIndex] = React.useState(null);
  const complete = uploads.every(Boolean);

  function saveFile(file) {
    if (!file || uploadIndex === null) return;
    const url = URL.createObjectURL(file);
    setUploads(current => current.map((item, index) => index === uploadIndex ? url : item));
    onUploaded(uploadIndex, url);
    setUploadIndex(null);
  }

  return (
    <Task1Page step={complete ? 'plant-hunt-complete' : 'plant-hunt-upload'} title="Task 1  Plant Hunt" onBack={onBack} onNext={onNext} nextDisabled={!complete} className="task1-hunt-page">
      <p className="task1-hunt-prompt"><strong>Find one plant from each category—herbaceous, shrub, and tree.</strong><br />Take a photo and upload it to verify your discovery.</p>
      <div className="task1-upload-list">
        {TASK1_PLANTS.map((plant, index) => (
          <article key={plant.uploadLabel} className={uploads[index] ? 'uploaded' : ''}>
            <button className="task1-upload-target" onClick={() => setUploadIndex(index)} aria-label={'Upload ' + plant.uploadLabel}>
              {uploads[index] ? <img src={uploads[index]} alt={'Uploaded ' + plant.uploadLabel} /> : <span>＋</span>}
            </button>
            <footer><strong>{plant.uploadLabel}</strong><button onClick={() => setTipIndex(index)} aria-label={'Info for ' + plant.uploadLabel}>!</button></footer>
          </article>
        ))}
      </div>
      {uploadIndex !== null && <UploadSheet category={TASK1_PLANTS[uploadIndex]} onClose={() => setUploadIndex(null)} onFile={saveFile} />}
      {tipIndex !== null && <PlantTip plant={TASK1_PLANTS[tipIndex]} onClose={() => setTipIndex(null)} />}
    </Task1Page>
  );
}

function Brainstorming({ uploads, onBack, onNext }) {
  return (
    <Task1Page step="brainstorming" title="Brainstorming" onBack={onBack} onNext={onNext} className="task1-brainstorm-page">
      <p className="task1-brainstorm-prompt">“What role might these plants play in sustaining life around them?”</p>
      <div className="task1-brainstorm-images">
        <img className="top" src={uploads[0] || TASK1_ASSETS.coneflower} alt="Herbaceous discovery" />
        <img src={uploads[1] || TASK1_ASSETS.hazelnut} alt="Shrub discovery" />
        <img src={uploads[2] || TASK1_ASSETS.redbud} alt="Tree discovery" />
      </div>
    </Task1Page>
  );
}

function Task1Complete({ onBack, onComplete }) {
  return (
    <Task1Page step="task1-complete" title="" onBack={onBack} onNext={onComplete} className="task1-finish-page">
      <section className="task1-finish-card">
        <span className="task1-pin" />
        <h2>🎉 Task 1 Complete!</h2>
        <img src={REWARD_PUZZLE} alt="Unlocked yellow puzzle piece" />
        <strong>You successfully found all three plant types in the Idea Garden.</strong>
        <p>Your Ecotale Puzzle Piece has been unlocked!</p>
      </section>
    </Task1Page>
  );
}

const TASK2_ASSETS = {
  flowerBee: '/figma-task2/asset-01.png',
  milkweed: '/figma-task2/figma-monarch-milkweed.png',
  mutualism: '/figma-task2/figma-mutualism.png',
  burReed: '/figma-task2/asset-03.png',
  goldfinch: '/figma-task2/asset-04.png',
  hoverfly: '/figma-task2/asset-05.png',
  puzzle: '/figma-task2/asset-08.png',
  pollinator: '/figma-task2/asset-07.png',
  milkweedClose: '/figma-task2/asset-06.png',
  bumblebeeQuiz: '/figma-task2/figma-quiz-bumblebee.png',
  deer: '/figma-task2/figma-quiz-deer.png',
  hoverflyQuiz: '/figma-task2/figma-quiz-hoverfly.png',
  aphidsQuiz: '/figma-task2/figma-quiz-aphids-1917.png',
  beeFeedback: '/figma-task2/figma-correct-bee.png',
  deerFeedback: '/figma-task2/figma-correct-deer.png'
};

function Task2Intro({ onBack, onNext }) {
  return <Task1Page step="task2-intro" title="" onBack={onBack} className="task2-intro-page">
    <h1>Symbiosis<br />Exploration</h1>
    <p>In nature, many species depend on one another to survive.</p>
    <button className="task2-start" onClick={onNext}><img src="/figma-tasks/start-disc.svg" alt="" /><span>Start</span></button>
  </Task1Page>;
}

function Task2ImagePage({ title, body, image, onBack, onNext, className = '' }) {
  return <section className={'task2-story-page ' + className}>
    <img className="task2-story-photo" src={image} alt="" />
    <div className="task2-story-wash" />
    <button className="task2-story-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <div className="task2-story-copy"><h1>{title}</h1><p>{body}</p></div>
    <Task1Next onClick={onNext} label="Continue" />
  </section>;
}

function Task2Species({ onBack, onNext }) {
  const items = [
    ['Purple Coneflower', TASK2_ASSETS.flowerBee], ['Bur Reed', TASK2_ASSETS.burReed],
    ['Goldfinch', TASK2_ASSETS.goldfinch], ['Bumblebee', TASK2_ASSETS.hoverfly],
    ['Milkweed', TASK2_ASSETS.milkweed], ['Monarch Caterpillar', TASK2_ASSETS.milkweedClose],
    ['Purple Coneflower', TASK2_ASSETS.flowerBee], ['Bur Reed', TASK2_ASSETS.burReed],
    ['Goldfinch', TASK2_ASSETS.goldfinch], ['Bumblebee', TASK2_ASSETS.hoverfly]
  ];
  return <Task1Page step="task2-species" title="" onBack={onBack} onNext={onNext} className="task2-species-page">
    <h1>Illinois Symbiotic<br />Species</h1>
    <p>Across Illinois, many species form complex ecological networks.<br />They, too, rely on different types of symbiotic relationships.</p>
    <div className="task2-species-grid">{items.map(([name, image]) => <article key={name}><img src={image} alt="" /><strong>{name}</strong></article>)}</div>
  </Task1Page>;
}

function Task2Mission({ onBack, onNext }) {
  return <Task1Page step="task2-mission" title="" onBack={onBack} onNext={onNext} className="task2-mission-page">
    <section className="task2-mission-card"><span className="task1-pin" /><h2>Task 2<br />Symbiosis Exploration</h2><div className="task1-sprout" aria-hidden="true"><span /><i /></div>
      <strong>Understand the relationships between organisms and identify three groups of different symbiotic relationships.</strong>
      <p>Correctly selecting all the relationships to earn your first Puzzle Piece!</p></section>
  </Task1Page>;
}

const TASK2_QUIZZES = [
  {
    pair: 'Bumblebee and Purple Coneflower', image: TASK2_ASSETS.bumblebeeQuiz, correct: 'Mutualism', options: ['Mutualism', 'Commensalism', 'Parasitism'],
    hint: 'Both species benefit: the bee gets nectar and pollen, while the flower receives pollination.',
    impact: 'If bumblebees disappear, Purple Coneflower would have reduced pollination and produce fewer seeds. If Purple Coneflower disappears, bumblebees lose an important summer nectar and pollen source.',
    actions: ['Plant native flowers', 'Avoid harmful pesticides', 'Leave nesting habitat']
  },
  {
    pair: 'White-tailed Deer and Bur Reed', image: TASK2_ASSETS.deer, correct: 'Commensalism', options: ['Mutualism', 'Commensalism', 'Parasitism'],
    hint: 'Deer can use tall prairie grasses and shrubs for shelter while the plant is largely unaffected.',
    impact: 'If White-tailed Deer disappear, some plant populations may grow more densely due to reduced browsing. If Bur Reed disappears, deer lose a small seasonal food source and wetland habitats become less healthy.',
    actions: ['Reduce runoff pollution', 'Control invasive species', 'Protect wetland habitat']
  },
  {
    pair: 'Wild Bergamot and Goldfinch', image: TASK2_ASSETS.goldfinch, correct: 'Commensalism', options: ['Mutualism', 'Commensalism', 'Parasitism'],
    hint: 'Goldfinches feed on seeds without significantly helping or harming the Wild Bergamot plant.',
    impact: 'If Wild Bergamot disappears, goldfinches lose a native seed source. Keeping diverse prairie plants available supports healthy bird populations throughout the year.',
    actions: ['Grow native seed plants', 'Protect prairie habitat', 'Keep birds safely fed']
  },
  {
    pair: 'Wild Bergamot and Hoverfly', image: TASK2_ASSETS.hoverflyQuiz, correct: 'Mutualism', options: ['Mutualism', 'Commensalism', 'Parasitism'],
    hint: 'Hoverflies pollinate Wild Bergamot while feeding on its nectar, so both species benefit.',
    impact: 'If hoverflies disappear, Wild Bergamot has fewer pollinators. If Wild Bergamot disappears, adult hoverflies lose a nectar source, weakening local pollination networks.',
    actions: ['Plant pollinator gardens', 'Avoid harmful pesticides', 'Protect flowering habitat']
  },
  {
    pair: 'Hoverfly larvae and Aphids', image: TASK2_ASSETS.aphidsQuiz, correct: 'Predation', options: ['Mutualism', 'Commensalism', 'Predation'],
    hint: 'Hoverfly larvae prey on aphids, helping keep aphid populations from damaging prairie plants.',
    impact: 'If aphids disappear, hoverfly larvae lose a major food source. If hoverfly larvae disappear, aphid populations can increase and damage Wild Bergamot and other plants.',
    actions: ['Leave stems standing in fall', 'Keep small patches of leaf litter', 'Use manual aphid removal']
  }
];

const TASK2_RELATIONSHIP_TIP = [
  ['Mutualism', 'A relationship where both species benefit from the interaction.'],
  ['Commensalism', 'A relationship where one species benefits while the other is unaffected.'],
  ['Predation', 'A relationship in which one organism hunts, kills, and eats another organism.'],
  ['Parasitism', 'A relationship in which one organism lives on or inside a host and benefits while usually harming the host.']
];

function Task2Hint({ quiz, onClose }) {
  return <div className="task2-modal" role="dialog" aria-modal="true" aria-label="Tip card"><section><button onClick={onClose} aria-label="Close tip">×</button><h2>Tip Card</h2>{TASK2_RELATIONSHIP_TIP.map(([name, description]) => <div className="task2-tip-definition" key={name}><h3>{name}</h3><p>{description}</p></div>)}<div className="task2-tip-definition task2-tip-hint"><h3>Hint</h3><p>{quiz.hint}</p></div></section></div>;
}

function Task2CorrectCard({ quiz, mode, onContinue }) {
  if (mode === 'summary') {
    return <section className="task2-feedback task2-summary-card" role="dialog" aria-modal="true" aria-label="Correct answer">
      <button className="task2-feedback-close" onClick={onContinue} aria-label="Continue">×</button>
      <strong>You are Correct!</strong>
      <div className="task2-summary-images"><img src={TASK2_ASSETS.goldfinch} alt="Goldfinch" /><img src={TASK2_ASSETS.hoverfly} alt="Hoverfly" /><img src="/figma-task2/figma-summary-aphids-2036.png" alt="Hoverfly larvae" /></div>
      <div className="task2-summary-copy"><b>Flower and Goldfinch → Commensalism</b><p>Goldfinches feed on seeds without harming the plant significantly.</p><b>Flower and Hoverfly → Mutualism</b><p>Hoverflies pollinate Wild Bergamot while feeding on nectar.</p><b>Hoverfly larvae → Aphids → Predation</b><p>Hoverfly larvae prey on aphids, reducing pests on Illinois prairie plants.</p></div>
    </section>;
  }
  const isBee = mode === 'bee';
  const relationship = isBee ? 'Mutualism' : 'Commensalism';
  const definition = isBee
    ? 'A relationship where both species benefit from the interaction.'
    : 'A relationship where one species benefits while the other is unaffected.';
  const explanation = isBee
    ? 'Bumblebees gather nectar and pollen from Echinacea. Echinacea depends on bees for efficient pollination.'
    : 'Deer use tall prairie grasses or shrubs for shelter and hiding. The grass does not benefit or suffer from this interaction.';
  return <section className="task2-feedback task2-correct-card" role="dialog" aria-modal="true" aria-label="Correct answer">
    <button className="task2-feedback-close" onClick={onContinue} aria-label="Continue">×</button>
    <strong>You are Correct!</strong><h3>{relationship}:</h3><p className="task2-feedback-definition">• {definition}</p>
    <img src={isBee ? TASK2_ASSETS.beeFeedback : TASK2_ASSETS.deerFeedback} alt="" />
    <h3>Explanation:</h3><p className="task2-feedback-definition">• {explanation}</p>
  </section>;
}

function Task2Quiz({ quiz, index, feedbackMode = 'none', onBack, onNext }) {
  const [picked, setPicked] = React.useState(null);
  const [showHint, setShowHint] = React.useState(false);
  const correct = picked === quiz.correct;
  const choose = option => setPicked(option);
  return <section className="task2-live-screen task2-quiz-live" data-task2-quiz={index + 1}>
    <img className="task2-live-bg" src={quiz.image} alt="" />
    <div className="task2-live-shade" />
    <button className="task2-live-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <main className="task2-quiz-content">
      <h1>What type of relationship do <em>{quiz.pair}</em> share?</h1>
      <div className="task2-options">{quiz.options.map(option => <button key={option} className={picked === option ? (correct ? 'correct' : 'wrong') : ''} onClick={() => choose(option)}>{option}</button>)}</div>
      <button className="task2-hint" onClick={() => setShowHint(true)}>ⓘ&nbsp; Need Hint?</button>
    </main>
    <Task1Next onClick={() => correct && onNext()} disabled={!correct} label={correct ? 'Continue' : 'Choose the correct answer'} />
    {picked && !correct && <section className="task2-feedback is-wrong" role="dialog" aria-live="polite"><strong>Try again</strong><p>That relationship does not match. Use the tip card, then choose again.</p><button onClick={() => setPicked(null)}>Try another answer</button></section>}
    {correct && feedbackMode !== 'none' && <Task2CorrectCard quiz={quiz} mode={feedbackMode} onContinue={onNext} />}
    {showHint && <Task2Hint quiz={quiz} onClose={() => setShowHint(false)} />}
  </section>;
}

function Task2FinalActions({ onBack, onNext }) {
  const [choices, setChoices] = React.useState([]);
  const actions = ['Leave stems standing in fall', 'Small patches of leaf litter', 'Use manual removal for aphid'];
  const toggleChoice = action => setChoices(current => current.includes(action) ? current.filter(item => item !== action) : [...current, action]);
  return <section className="task2-live-screen task2-impact-live">
    <img className="task2-live-bg" src={TASK2_ASSETS.aphidsQuiz} alt="" />
    <div className="task2-live-shade" />
    <button className="task2-live-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <main className="task2-impact-content">
      <h1>What would happen if one of these species disappeared?</h1>
      <p>If aphids disappear, hoverfly larvae lose a major food source, reducing hoverfly populations.</p>
      <p>If hoverfly larvae disappear, aphid populations can explode, damaging Wild Bergamot and other plants.</p>
      <p>If Wild Bergamot disappears, adult hoverflies lose nectar sources, weakening pollination networks.</p>
      <p>They form a small but important balance: plant → aphid → hoverfly → pollination control system.</p>
      <h3>What things we can do to protect them?</h3>
      <p className="task2-multiselect-note">Choose all that apply.</p>
      <div className="task2-options">{actions.map(action => <button key={action} className={choices.includes(action) ? 'selected' : ''} onClick={() => toggleChoice(action)} aria-pressed={choices.includes(action)}>{action}</button>)}</div>
      {choices.length > 0 && <p className="task2-choice-note">Great choices — these actions help support this ecological balance.</p>}
    </main>
    <Task1Next onClick={onNext} disabled={choices.length !== actions.length} label={choices.length === actions.length ? 'Continue' : 'Choose all actions'} />
  </section>;
}

function Task2Complete({ onBack, onComplete }) {
  return <Task1Page step="task2-complete" title="" onBack={onBack} onNext={onComplete} className="task2-complete-page"><section className="task2-complete-card"><h2>🎉 Task 2 Complete!</h2><img src={REWARD_PUZZLE} alt="Unlocked yellow puzzle piece" /><strong>You successfully explored three types of symbiotic relationships.</strong><p>Your Ecotale Puzzle Piece has been unlocked!</p></section></Task1Page>;
}

function Task2Flow({ task, onBack, onComplete }) {
  const [step, setStep] = React.useState(0);
  const next = () => setStep(value => value + 1);
  const previous = () => step === 0 ? onBack() : setStep(value => value - 1);
  if (step === 0) return <FigmaTaskIntro task={task} onBack={onBack} onStart={next} />;
  if (step === 1) return <Task2ImagePage title="Monarch & Milkweed" body="A classic example is the relationship between the Monarch butterfly and Milkweed." image={TASK2_ASSETS.milkweed} onBack={previous} onNext={next} className="task2-monarch-page" />;
  if (step === 2) return <Task2ImagePage title="Mutualism" body="Milkweed is the only food source for Monarch caterpillars. In return, Monarchs help pollinate Milkweed." image={TASK2_ASSETS.mutualism} onBack={previous} onNext={next} className="task2-mutualism-page" />;
  if (step === 3) return <Task2Species onBack={previous} onNext={next} />;
  if (step === 4) return <Task2Mission onBack={previous} onNext={next} />;
  if (step >= 5 && step <= 9) {
    const quizIndex = step - 5;
    const feedbackMode = quizIndex === 0 ? 'bee' : quizIndex === 1 ? 'deer' : quizIndex === 4 ? 'summary' : 'none';
    return <Task2Quiz key={quizIndex} quiz={TASK2_QUIZZES[quizIndex]} index={quizIndex} feedbackMode={feedbackMode} onBack={previous} onNext={next} />;
  }
  if (step === 10) return <Task2FinalActions onBack={previous} onNext={next} />;
  return <Task2Complete onBack={previous} onComplete={onComplete} />;
}

const TASK3_ASSETS = {
  intro: '/figma-task3/intro-figma.png', squirrel: '/figma-task3/squirrel-figma.png', bird: '/figma-task3/bird-figma.png',
  mission: '/figma-task3/mission-figma.png', story: '/figma-task3/story-image.png'
};

function Task3Intro({ onBack, onNext }) {
  return <section className="task3-hero">
    <img src={TASK3_ASSETS.intro} alt="Wildlife in Illinois" /><div className="task3-hero-wash" />
    <button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <div className="task3-hero-copy"><h1>Share Your<br />Wildlife Story</h1><p>Have you ever encountered wildlife in Illinois?</p></div>
    <button className="task3-start" onClick={onNext}>Start</button>
  </section>;
}

const TASK3_STORIES = [
  { title: 'Favorite Squirrel Stories?', image: TASK3_ASSETS.squirrel, text: 'I had one squirrel sneaking in my apartment. It opened my Christmas gift given by my friend and enjoyed the chocolate…. Pretty smart 🤣', author: 'Grass-dalin26', date: '07/30/2024' },
  { title: 'Bird around us', image: TASK3_ASSETS.bird, text: 'Canada geese have their babies on campus by the Grainger Library in spring. Seeing the newly hatched goslings makes me so happy, it really brightens my whole day.', author: 'Fan Summer', date: '03/30/2025' }
];

function Task3Story({ story, onBack, onNext }) {
  return <section className="task3-story">
    <img src={story.image} alt="" /><div className="task3-story-wash" />
    <button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <div className="task3-story-copy"><h1>{story.title}</h1><p>{story.text}</p><div className="task3-author"><span>{story.author.slice(0, 1)}</span><div><b>{story.author}</b><small>{story.date}</small></div></div></div>
    <Task1Next onClick={onNext} label="Continue" />
  </section>;
}

function Task3Mission({ onBack, onNext }) {
  return <section className="task3-mission-page"><img src={TASK3_ASSETS.mission} alt="" /><div className="task3-mission-wash" />
    <button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <section className="task3-mission-card"><span className="task1-pin" /><h2>Task 3<br />Share Your Wildlife Story</h2><img className="task3-wildlife-icon" src="/figma-task3/wildlife-icon.svg" alt="" /><strong>Have you ever encountered wildlife in Illinois? Deer, squirrels, birds, or even insects—share a moment that impressed you and see what others in the community have experienced!</strong><p>Earn reward fragments by participating!</p></section>
    <Task1Next onClick={onNext} label="Continue" />
  </section>;
}

function Task3Composer({ onBack, onShare, kind = 'story' }) {
  const [title, setTitle] = React.useState('');
  const [story, setStory] = React.useState('');
  const tags = kind === 'culture' ? ['#Culture', '#Life', '#Tradition'] : kind === 'action' ? ['#Action', '#Change', '#Family'] : ['#Story', '#Campus', '#Wildlife'];
  const [tag, setTag] = React.useState(tags[0]);
  const [image, setImage] = React.useState(null);
  const [location, setLocation] = React.useState('');
  const [audience, setAudience] = React.useState('');
  const [picker, setPicker] = React.useState(null);
  const places = ['Idea Garden', 'Main Quad', 'Japan House', 'Grainger Library'];
  const chooseImage = event => { const file = event.target.files && event.target.files[0]; if (file) setImage(URL.createObjectURL(file)); };
  const canShare = title.trim() && story.trim() && location && audience;
  return <section className="task3-compose">
    <header><button onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button></header>
    <main><label className={'task3-image-upload ' + (image ? 'has-image' : '')}>{image ? <img src={image} alt="Your upload" /> : <><span>＋</span><b>Add a photo</b></>}<input type="file" accept="image/*" onChange={chooseImage} /></label>
      <input className="task3-title-input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Title" aria-label="Story title" />
      <textarea value={story} onChange={event => setStory(event.target.value)} placeholder={kind === 'culture' ? '#Culture\n“How has nature shaped your cultural or personal life, and how do you think about your relationship with nature?”' : kind === 'action' ? '#Action\n“Your turn! What’s one thing you can do to help nature thrive?”' : '#Story\n“Have you ever encountered wildlife in Illinois that left an impression on you? How can people live peacefully with them?”'} aria-label="Your story" />
      <div className="task3-tags">{tags.map(item => <button key={item} className={tag === item ? 'active' : ''} onClick={() => setTag(item)}>{item}</button>)}</div>
      <div className="task3-settings"><span className={location ? 'is-selected' : ''}>{location ? '●' : '○'}&nbsp; Location</span><button onClick={() => setPicker('location')} aria-haspopup="dialog">{location || 'Select'}&nbsp; ›</button><span className={audience ? 'is-selected' : ''}>{audience ? '●' : '○'}&nbsp; Audience</span><button onClick={() => setPicker('audience')} aria-haspopup="dialog">{audience || 'Select'}&nbsp; ›</button></div>
      <button className="task3-share" disabled={!canShare} onClick={() => onShare({ title, story, tag, image, location, audience })}>Share</button>
    </main>
    {picker === 'location' && <div className="task3-picker-backdrop" role="presentation" onClick={() => setPicker(null)}><section className="task3-picker task3-map-picker" role="dialog" aria-modal="true" aria-label="Choose a location" onClick={event => event.stopPropagation()}><button className="task3-picker-close" onClick={() => setPicker(null)} aria-label="Close">×</button><h2>Choose a location</h2><p>Pick a place on the UIUC campus map.</p><div className="task3-campus-map" aria-label="UIUC campus map">{places.map((place, index) => <button key={place} className={'task3-map-pin pin-' + index + (location === place ? ' selected' : '')} onClick={() => { setLocation(place); setPicker(null); }}><i />{place}</button>)}</div><button className="task3-map-campus" onClick={() => { setLocation('Campus'); setPicker(null); }}>Use campus location</button></section></div>}
    {picker === 'audience' && <div className="task3-picker-backdrop" role="presentation" onClick={() => setPicker(null)}><section className="task3-picker" role="dialog" aria-modal="true" aria-label="Choose audience" onClick={event => event.stopPropagation()}><button className="task3-picker-close" onClick={() => setPicker(null)} aria-label="Close">×</button><h2>Who can see this story?</h2><button className={'task3-audience-option ' + (audience === 'Public' ? 'selected' : '')} onClick={() => { setAudience('Public'); setPicker(null); }}><b>Public</b><small>Anyone in the EcoTale community can see it.</small></button><button className={'task3-audience-option ' + (audience === 'Only me' ? 'selected' : '')} onClick={() => { setAudience('Only me'); setPicker(null); }}><b>Only me</b><small>Keep this story private in your profile.</small></button></section></div>}
  </section>;
}

function Task3Complete({ onBack, onComplete }) {
  return <section className="task3-mission-page"><img src={TASK3_ASSETS.mission} alt="" /><div className="task3-mission-wash" />
    <button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button>
    <section className="task3-mission-card task3-complete-card"><span className="task1-pin" /><h2>🎉 Task 3 Complete!</h2><img src={REWARD_PUZZLE} alt="Unlocked yellow puzzle piece" /><strong>Thank you!<br />Your story has been shared with the community.</strong><p>Your Ecotale Puzzle Piece has been unlocked!</p></section>
    <Task1Next onClick={onComplete} label="Finish task" />
  </section>;
}

function Task3Flow({ onBack, onComplete }) {
  const [step, setStep] = React.useState(0);
  const next = () => setStep(value => value + 1);
  const previous = () => step === 0 ? onBack() : setStep(value => value - 1);
  if (step === 0) return <Task3Intro onBack={onBack} onNext={next} />;
  if (step === 1) return <Task3Story story={TASK3_STORIES[0]} onBack={previous} onNext={next} />;
  if (step === 2) return <Task3Story story={TASK3_STORIES[1]} onBack={previous} onNext={next} />;
  if (step === 3) return <Task3Mission onBack={previous} onNext={next} />;
  if (step === 4) return <Task3Composer onBack={previous} onShare={submission => { emitTaskSubmission(3, 'wildlife', submission); next(); }} />;
  return <Task3Complete onBack={previous} onComplete={onComplete} />;
}

const TASK4_ASSETS = { intro: '/figma-task4/intro.png', japan: '/figma-task4/japan.png', china: '/figma-task4/china.png', usa: '/figma-task4/united-states.png', mission: '/figma-task4/mission-background.png', puzzle: '/figma-task4/puzzle.png' };
const TASK4_STORIES = [
  { title: 'Japan — Nature as Impermanence and Calm', body: 'In Japanese culture, nature reflects impermanence and subtle beauty—known as wabi-sabi. Gardens, and seasonal rituals celebrate simplicity and the quiet passage of time.', image: TASK4_ASSETS.japan },
  { title: 'China — Nature as Harmony', body: 'In Chinese traditions, nature symbolizes harmony between humans and the universe. Mountains, rivers, and plants appear in poetry, and philosophy as reflections of balance and moral cultivation.', image: TASK4_ASSETS.china },
  { title: 'United States — Nature as Wilderness', body: 'In American culture, nature is often seen as open wilderness—spaces for freedom, exploration, and conservation. National parks, outdoor recreation, and ecological stewardship are central themes.', image: TASK4_ASSETS.usa }
];

function Task4Intro({ onBack, onNext }) {
  return <section className="task3-hero task4-hero"><img src={TASK4_ASSETS.intro} alt="Nature and culture" /><div className="task3-hero-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><div className="task3-hero-copy"><h1>Nature in Your<br />Life and Culture</h1><p>Nature shapes our beliefs, our rituals, and the way we see the world.</p></div><button className="task3-start" onClick={onNext}>Start</button></section>;
}

function Task4Story({ story, onBack, onNext }) {
  return <section className="task4-story"><img src={story.image} alt="" /><div className="task4-story-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><div className="task4-story-copy"><h1>{story.title}</h1><p>{story.body}</p></div><Task1Next onClick={onNext} label="Continue" /></section>;
}

function Task4Mission({ onBack, onNext }) {
  return <section className="task3-mission-page"><img src={TASK4_ASSETS.mission} alt="" /><div className="task3-mission-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><section className="task3-mission-card"><span className="task1-pin" /><h2>Task 4<br />Share how nature shapes you</h2><img className="task3-wildlife-icon" src="/figma-task4/culture-icon.svg" alt="" /><strong>How has nature shaped your cultural or personal life, and how do you think about your relationship with nature?</strong><p>Earn reward fragments by participating!</p></section><Task1Next onClick={onNext} label="Continue" /></section>;
}

function Task4Complete({ onBack, onComplete }) {
  return <section className="task3-mission-page"><img src={TASK4_ASSETS.mission} alt="" /><div className="task3-mission-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><section className="task3-mission-card task3-complete-card"><span className="task1-pin" /><h2>🎉 Task 4 Complete!</h2><img src={REWARD_PUZZLE} alt="Unlocked yellow puzzle piece" /><strong>Thank you!<br />Your story has been shared with the community.</strong><p>Your Ecotale Puzzle Piece has been unlocked!</p></section><Task1Next onClick={onComplete} label="Finish task" /></section>;
}

function Task4Flow({ onBack, onComplete }) {
  const [step, setStep] = React.useState(0);
  const next = () => setStep(value => value + 1);
  const previous = () => step === 0 ? onBack() : setStep(value => value - 1);
  if (step === 0) return <Task4Intro onBack={onBack} onNext={next} />;
  if (step >= 1 && step <= 3) return <Task4Story story={TASK4_STORIES[step - 1]} onBack={previous} onNext={next} />;
  if (step === 4) return <Task4Mission onBack={previous} onNext={next} />;
  if (step === 5) return <Task3Composer kind="culture" onBack={previous} onShare={submission => { emitTaskSubmission(4, 'culture', submission); next(); }} />;
  return <Task4Complete onBack={previous} onComplete={onComplete} />;
}

const TASK5_ASSETS = {
  intro: '/figma-task5/intro.png', eat: '/figma-task5/eat.png', live: '/figma-task5/live.png',
  transportation: '/figma-task5/transportation.png', mission: '/figma-task5/mission-background.png',
  icon: '/figma-task5/action-icon.svg', puzzle: '/figma-task5/puzzle.png'
};

const TASK5_CATEGORIES = [
  { key: 'eat', title: 'Action Category: Eat', image: TASK5_ASSETS.eat, points: ['Choose more local or seasonal foods.', 'Reduce food waste by planning meals wisely.', 'Try more plant-forward meals to lower environmental impact.'] },
  { key: 'live', title: 'Action Category: Live', image: TASK5_ASSETS.live, points: ['Save water with shorter showers and by fixing leaks.', 'Use energy wisely—choose LED lights, efficient heating, and unplug devices.', 'Reduce waste by reusing and recycling at home.'] },
  { key: 'transportation', title: 'Action Category: Transportation', image: TASK5_ASSETS.transportation, points: ['Walk or bike when possible.', 'Use public transit to reduce carbon emissions.', 'Carpool or combine errands to reduce unnecessary trips.'] }
];

function Task5Intro({ onBack, onNext }) {
  return <section className="task5-hero"><img src={TASK5_ASSETS.intro} alt="Small actions for nature" /><div className="task5-hero-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><div className="task5-hero-copy"><h1>Small Actions,<br />Big Impact</h1><p>Even small choices in daily life can make a difference for nature.</p></div><button className="task3-start" onClick={onNext}>Start</button></section>;
}

function Task5Category({ category, onBack, onNext }) {
  return <section className={'task5-category task5-' + category.key}><img src={category.image} alt="" /><div className="task5-category-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><div className="task5-category-copy"><h1>{category.title}</h1><ul>{category.points.map(point => <li key={point}>{point}</li>)}</ul></div><Task1Next onClick={onNext} label="Continue" /></section>;
}

function Task5Mission({ onBack, onNext }) {
  return <section className="task3-mission-page task5-mission-page"><img src={TASK5_ASSETS.mission} alt="" /><div className="task3-mission-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><section className="task3-mission-card"><span className="task1-pin" /><h2>Task 5<br />Choose the change you plan to make</h2><img className="task5-action-icon" src={TASK5_ASSETS.icon} alt="" /><strong>Write a short reflection about how you will take this action in your life or with your family.</strong><p>Earn reward fragments by participating!</p></section><Task1Next onClick={onNext} label="Continue" /></section>;
}

function Task5Complete({ onBack, onComplete }) {
  return <section className="task3-mission-page task5-mission-page"><img src={TASK5_ASSETS.mission} alt="" /><div className="task3-mission-wash" /><button className="task3-back" onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><section className="task3-mission-card task3-complete-card"><span className="task1-pin" /><h2>🎉 Task 5 Complete!</h2><img src={REWARD_PUZZLE} alt="Unlocked yellow puzzle piece" /><strong>Thank you!<br />Your commitment helps protect nature.</strong><p>Your EcoTale Puzzle Piece has been unlocked!</p></section><Task1Next onClick={onComplete} label="Finish task" /></section>;
}

function Task5Flow({ onBack, onComplete }) {
  const [step, setStep] = React.useState(0);
  const next = () => setStep(value => value + 1);
  const previous = () => step === 0 ? onBack() : setStep(value => value - 1);
  if (step === 0) return <Task5Intro onBack={onBack} onNext={next} />;
  if (step >= 1 && step <= 3) return <Task5Category category={TASK5_CATEGORIES[step - 1]} onBack={previous} onNext={next} />;
  if (step === 4) return <Task5Mission onBack={previous} onNext={next} />;
  if (step === 5) return <Task3Composer kind="action" onBack={previous} onShare={submission => { emitTaskSubmission(5, 'action', submission); next(); }} />;
  return <Task5Complete onBack={previous} onComplete={onComplete} />;
}

function Task1Flow({ task, onBack, onComplete }) {
  const [step, setStep] = React.useState(0);
  const [uploads, setUploads] = React.useState([null, null, null]);
  const [answers, setAnswers] = React.useState(['', '', '']);
  const [answerIndex, setAnswerIndex] = React.useState(null);
  const createdUrls = React.useRef([]);

  React.useEffect(() => {
    uploads.filter(Boolean).forEach(url => {
      if (!createdUrls.current.includes(url)) createdUrls.current.push(url);
    });
  }, [uploads]);
  React.useEffect(() => () => createdUrls.current.forEach(url => URL.revokeObjectURL(url)), []);

  const previous = () => step === 0 ? onBack() : setStep(value => value - 1);
  const next = () => setStep(value => value + 1);
  const saveAnswer = answer => {
    setAnswers(current => current.map((item, index) => index === answerIndex ? answer : item));
    setAnswerIndex(null);
  };

  if (step === 0) return <FigmaTaskIntro task={task} onBack={onBack} onStart={next} />;
  if (step === 1) return <GardenOverview onBack={previous} onNext={next} />;
  if (step === 2) return <PlantTypes onBack={previous} onNext={next} />;
  if (step === 3) return <PlantDetail plant={TASK1_PLANTS[0]} step="herbaceous-detail" onBack={previous} onNext={next} />;
  if (step === 4) return <PlantDetail plant={TASK1_PLANTS[1]} step="shrub-detail" onBack={previous} onNext={next} />;
  if (step === 5) return <PlantDetail plant={TASK1_PLANTS[2]} step="tree-detail" onBack={previous} onNext={next} />;
  if (step === 6) return <EcosystemLayers onBack={previous} onNext={next} />;
  if (step === 7) return <PlantHuntMission onBack={previous} onNext={next} />;
  if (step === 8 && answerIndex !== null) return <PlantAnswer plant={TASK1_PLANTS[answerIndex]} image={uploads[answerIndex]} initialAnswer={answers[answerIndex]} onBack={() => setAnswerIndex(null)} onSave={saveAnswer} />;
  if (step === 8) return <PlantHunt onBack={previous} onNext={next} uploads={uploads} setUploads={setUploads} onUploaded={index => setAnswerIndex(index)} />;
  if (step === 9) return <Brainstorming uploads={uploads} onBack={previous} onNext={next} />;
  return <Task1Complete onBack={previous} onComplete={onComplete} />;
}

function TaskTopBar({ task, onBack }) {
  return <div className="task-flow-topbar"><button onClick={onBack} aria-label="Back"><img src="/figma-tasks/back.svg" alt="" /></button><span>Task {task.idx} of 5</span><strong>+10</strong></div>;
}

function TaskComplete({ task, onComplete }) {
  return (
    <div className="task-flow-screen task-complete-screen">
      <div className="task-complete-piece"><Icon name="puzzle" size={84} color={COLORS.blue} fill={COLORS.blue} /></div>
      <div className="task-kicker">Puzzle piece earned</div><h2>Task {task.idx} complete!</h2>
      <p>Your action has been added to your EcoTale. One step at a time helps protect nature.</p>
      <button className="task-primary-button" onClick={onComplete}>Continue</button>
    </div>
  );
}

function MutualismActivity({ task, onBack, onDone }) {
  const [picked, setPicked] = React.useState(null);
  const options = [
    { id: 'a', label: 'Bee & Milkweed flower', correct: true, hint: 'Pollination' },
    { id: 'b', label: 'Squirrel & Acorn', correct: false, hint: 'Seed predation' },
    { id: 'c', label: 'Mosquito & Deer', correct: false, hint: 'Parasitism' }
  ];
  function pick(option) {
    setPicked(option.id);
    if (option.correct) setTimeout(onDone, 700);
    else setTimeout(() => setPicked(null), 900);
  }
  return (
    <div className="task-flow-screen"><TaskTopBar task={task} onBack={onBack} /><main className="task-flow-content">
      <div className="task-kicker">Symbiosis Exploration</div><h2>Which pair shows a mutualistic relationship?</h2>
      <img className="task-quiz-photo" src={task.image} alt="Idea Garden" />
      <div className="task-options">{options.map(option => {
        const selected = picked === option.id;
        return <button key={option.id} onClick={() => pick(option)} className={selected ? (option.correct ? 'correct' : 'wrong') : ''}><span><strong>{option.label}</strong>{selected && <small>{option.correct ? 'Correct — ' + option.hint : 'Try again — ' + option.hint}</small>}</span>{selected && option.correct && <Icon name="check" size={20} color={COLORS.greenDeep} />}</button>;
      })}</div>
    </main></div>
  );
}

function ReflectionActivity({ task, onBack, onDone }) {
  const [choice, setChoice] = React.useState('');
  const [story, setStory] = React.useState('');
  const ready = task.story ? story.trim().length >= 8 : Boolean(choice);
  return (
    <div className="task-flow-screen"><TaskTopBar task={task} onBack={onBack} /><main className="task-flow-content">
      <div className="task-kicker">EcoTale field activity</div><h2>{task.activityTitle}</h2><p className="task-prompt">{task.activityPrompt}</p>
      <img className="task-activity-photo" src={task.image} alt="" style={{ objectPosition: task.objectPosition }} />
      {task.story ? <textarea value={story} onChange={event => setStory(event.target.value)} placeholder="I saw..." aria-label="Your wildlife story" /> : <div className="task-options compact">{task.choices.map(item => <button key={item} className={choice === item ? 'selected' : ''} onClick={() => setChoice(item)}><strong>{item}</strong></button>)}</div>}
      <button className="task-primary-button" disabled={!ready} onClick={onDone}>Complete task</button>
    </main></div>
  );
}

function TaskScreen({ task, onBack, onComplete }) {
  const activeTask = task || TASKS[0];
  const [phase, setPhase] = React.useState('intro');
  if (activeTask.idx === 1) return <Task1Flow task={activeTask} onBack={onBack} onComplete={onComplete} />;
  if (activeTask.idx === 2) return <Task2Flow task={activeTask} onBack={onBack} onComplete={onComplete} />;
  if (activeTask.idx === 3) return <Task3Flow onBack={onBack} onComplete={onComplete} />;
  if (activeTask.idx === 4) return <Task4Flow onBack={onBack} onComplete={onComplete} />;
  if (activeTask.idx === 5) return <Task5Flow onBack={onBack} onComplete={onComplete} />;
  if (phase === 'intro') return <FigmaTaskIntro task={activeTask} onBack={onBack} onStart={() => setPhase('activity')} />;
  if (phase === 'complete') return <TaskComplete task={activeTask} onComplete={onComplete} />;
  if (activeTask.idx === 2) return <MutualismActivity task={activeTask} onBack={() => setPhase('intro')} onDone={() => setPhase('complete')} />;
  return <ReflectionActivity task={activeTask} onBack={() => setPhase('intro')} onDone={() => setPhase('complete')} />;
}
// END TASK FLOW
