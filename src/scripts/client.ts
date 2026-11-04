const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = document.querySelector<HTMLElement>('[data-site-nav]');
function closeMenu() { menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open navigation'); navigation?.removeAttribute('data-open'); document.body.classList.remove('nav-open'); }
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation?.toggleAttribute('data-open', open);
  document.body.classList.toggle('nav-open', open);
});
navigation?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {if (e.key === 'Escape') closeMenu();});

const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const cards = document.querySelectorAll<HTMLElement>('[data-project-card]');
function applyFilter(category: string) {
  let count = 0;
  cards.forEach(card => {const visible = category === 'All' || card.dataset.category === category; card.hidden = !visible; if (visible) count++;});
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  const counter = document.querySelector('[data-project-count]');
  if (counter) counter.textContent = `${String(count).padStart(2,'0')} ${count === 1 ? 'project' : 'projects'}`;
}
filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter || 'All')));

const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
let galleryItems: HTMLElement[] = [], galleryIndex = 0;
function showGalleryImage(index: number) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[galleryIndex];
  const image = dialog!.querySelector<HTMLImageElement>('[data-lightbox-image]')!;
  image.src = item.dataset.src!; image.alt = item.dataset.alt || '';
  dialog!.querySelector('[data-lightbox-caption]')!.textContent = item.dataset.caption || '';
  dialog!.querySelector('[data-lightbox-count]')!.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
  dialog!.querySelectorAll<HTMLButtonElement>('[data-lightbox-prev],[data-lightbox-next]').forEach(button => button.hidden = galleryItems.length < 2);
}
document.querySelectorAll<HTMLElement>('[data-gallery-trigger]').forEach(trigger => trigger.addEventListener('click', e => {
  if (!dialog?.showModal) return;
  e.preventDefault();
  galleryItems = Array.from(trigger.closest('[data-gallery]')!.querySelectorAll<HTMLElement>('[data-gallery-trigger]'));
  showGalleryImage(galleryItems.indexOf(trigger)); dialog.showModal();
}));
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
dialog?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showGalleryImage(galleryIndex + 1));
dialog?.addEventListener('click', e => {if (e.target === dialog) dialog.close();});
dialog?.addEventListener('keydown', e => {if (e.key === 'ArrowRight') {e.preventDefault();showGalleryImage(galleryIndex+1);} if (e.key === 'ArrowLeft') {e.preventDefault();showGalleryImage(galleryIndex-1);}});

document.querySelectorAll<HTMLElement>('[data-video]').forEach(frame => frame.querySelector('[data-video-launch]')?.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${frame.dataset.video}?autoplay=1&rel=0`;
  iframe.title = frame.dataset.videoTitle || 'Project video';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.allowFullscreen = true;
  frame.replaceChildren(iframe); iframe.focus();
}));

document.querySelectorAll<HTMLElement>('[data-loop-clip]').forEach(section => {
  const video = section.querySelector<HTMLVideoElement>('[data-loop-video]')!;
  const toggle = section.querySelector<HTMLButtonElement>('[data-loop-toggle]')!;
  const error = section.querySelector<HTMLElement>('[data-loop-error]')!;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false, userPaused = false, pagePaused = false;
  video.muted = true;
  video.defaultMuted = true;
  toggle.hidden = false;
  const updateButton = () => {toggle.textContent = video.paused ? 'Play head test' : 'Pause head test';};
  const pauseForPage = () => {
    if (!video.paused) {pagePaused = true; video.pause();}
  };
  const play = async () => {
    try {await video.play();} catch {updateButton();} // Native controls remain available if autoplay is blocked.
  };
  const syncPlayback = () => {
    const canAutoplay = inView && !document.hidden && !motion.matches && !userPaused;
    video.toggleAttribute('autoplay', canAutoplay);
    if (!inView || document.hidden) pauseForPage();
    else if (canAutoplay) void play();
  };
  video.addEventListener('play', () => {userPaused = false; updateButton();});
  video.addEventListener('pause', () => {
    if (pagePaused) pagePaused = false;
    else {userPaused = true; video.removeAttribute('autoplay');}
    updateButton();
  });
  const showVideoError = () => {error.hidden = false; updateButton();};
  video.addEventListener('error', showVideoError);
  video.querySelector('source')?.addEventListener('error', showVideoError);
  toggle.addEventListener('click', () => {
    if (video.paused) {userPaused = false; void play();}
    else {userPaused = true; video.pause();}
  });
  motion.addEventListener('change', () => {if (motion.matches) pauseForPage(); syncPlayback();});
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {inView = entries[0].isIntersecting; syncPlayback();}, {threshold:0.15}).observe(video);
  } else {inView = true; syncPlayback();}
});

document.querySelectorAll<HTMLElement>('[data-model-shell]').forEach(shell => {
  const launch = shell.querySelector<HTMLButtonElement>('[data-model-launch]');
  const stage = shell.querySelector<HTMLElement>('[data-model-stage]')!;
  const status = shell.querySelector<HTMLElement>('[data-model-status]')!;
  const actions = shell.querySelector<HTMLElement>('[data-model-actions]')!;
  const spin = shell.querySelector<HTMLButtonElement>('[data-model-spin]')!;
  const poster = stage.querySelector<HTMLImageElement>('.model-poster');
  let viewer: {dispose:()=>void}|undefined, timeout: ReturnType<typeof setTimeout>, attempts = 0;
  let loading = false, loaded = false, generation = 0;
  const fail = () => {
    clearTimeout(timeout); loading = false; loaded = false; generation++;
    viewer?.dispose(); viewer = undefined; launch!.hidden = false; launch!.disabled = false;
    shell.querySelectorAll('canvas').forEach(canvas=>canvas.remove());
    shell.querySelector('[data-model-explosion-controls]')?.setAttribute('hidden','');
    shell.classList.remove('model-loaded');
    if (poster) poster.hidden = false;
    launch!.textContent = 'Try the 3D model again'; actions.hidden = true;
    status.textContent = 'The model could not load. You can retry; the assembly photographs remain available.';
  };
  const loadModel = async () => {
    if (!launch || loading || loaded) return;
    loading = true;
    attempts++;const request=++generation;
    launch.disabled = true; status.textContent = 'Loading the interactive assembly…';
    timeout = setTimeout(fail,90000);
    try {
      const {createCADViewer}=await import('./cad-viewer');
      const result=await createCADViewer(shell);
      if(request!==generation){result?.dispose();return;}
      viewer=result;clearTimeout(timeout); loading=false;loaded=true;
      launch.hidden=true;launch.disabled=false;actions.hidden=false;
      if(poster)poster.hidden=true;
      shell.classList.add('model-loaded');
      shell.querySelector('[data-model-explosion-controls]')?.removeAttribute('hidden');
      result?.refresh?.();
      status.textContent='Drag to inspect. Click the model to enable wheel zoom; pinch or use + / −. Rotation resumes after you release it.';
    } catch {if(request===generation)fail();}
  };
  launch?.addEventListener('click', loadModel);
  shell.addEventListener('model-error',fail);
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !attempts) void loadModel();
    }, {threshold:0.1});
    visibility.observe(stage);
  } else {void loadModel();}
});

const engineText: Record<string,string> = {
  temperature: 'The temperature engine steps through morning, afternoon, evening and night forecast indications.',
  transition: 'The scheduler hands control to the fader. Weather effects pause so they do not compete with the transition.',
  weather: 'The weather engine adds the selected forecast pattern. The scheduler can then return to the temperature cycle.'
};
document.querySelectorAll<HTMLElement>('[data-engine-demo]').forEach(demo => demo.querySelectorAll<HTMLButtonElement>('[data-engine]').forEach(button => button.addEventListener('click', () => {
  const state = button.dataset.engine!;
  demo.querySelectorAll('[data-engine]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  (demo.querySelector('[data-stage]') as HTMLElement).dataset.stage = state;
  demo.querySelector('[data-engine-explanation]')!.textContent = engineText[state];
})));
