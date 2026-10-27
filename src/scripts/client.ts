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

document.querySelectorAll<HTMLElement>('[data-model-shell]').forEach(shell => {
  const launch = shell.querySelector<HTMLButtonElement>('[data-model-launch]');
  const stage = shell.querySelector<HTMLElement>('[data-model-stage]')!;
  const status = shell.querySelector<HTMLElement>('[data-model-status]')!;
  const actions = shell.querySelector<HTMLElement>('[data-model-actions]')!;
  const poster = stage.querySelector<HTMLImageElement>('.model-poster');
  let viewer: any, timeout: ReturnType<typeof setTimeout>, attempts = 0;
  const fail = () => {
    clearTimeout(timeout); viewer?.remove(); launch!.hidden = false; launch!.disabled = false;
    if (poster) poster.hidden = false;
    launch!.textContent = 'Try the 3D model again'; actions.hidden = true;
    status.textContent = 'The model could not load. You can retry; the assembly photographs remain available.';
  };
  launch?.addEventListener('click', async () => {
    launch.disabled = true; status.textContent = 'Loading the interactive assembly…';
    try {
      await import('@google/model-viewer');
      const ModelClass = customElements.get('model-viewer') as any;
      ModelClass.meshoptDecoderLocation = shell.dataset.decoderSrc;
      viewer = document.createElement('model-viewer');
      const modelSrc = shell.dataset.modelSrc! + (attempts++ ? `?retry=${attempts}` : '');
      for (const [key, value] of Object.entries({src:modelSrc, alt:shell.dataset.modelName!, 'camera-controls':'', 'touch-action':'pan-y', 'shadow-intensity':'0.7', exposure:'1.3', 'environment-image':'neutral', 'camera-orbit':'45deg 70deg auto', 'interaction-prompt':'auto', loading:'eager'})) viewer.setAttribute(key, value);
      viewer.className = 'assembly-viewer';
      viewer.addEventListener('load', () => {
        clearTimeout(timeout); launch.hidden = true; launch.disabled = false; actions.hidden = false;
        if (poster) poster.hidden = true;
        status.textContent = 'Drag to rotate. Scroll or pinch to zoom. Focus the model and use arrow keys for keyboard rotation.';
      }, {once:true});
      viewer.addEventListener('error', fail, {once:true});
      stage.append(viewer); timeout = setTimeout(fail, 60000);
    } catch {fail();}
  });
  shell.querySelector('[data-model-reset]')?.addEventListener('click', () => {if (viewer) {viewer.cameraOrbit='45deg 70deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal();}});
  shell.querySelector('[data-model-expand]')?.addEventListener('click', async () => {try {if (document.fullscreenElement) await document.exitFullscreen();else await shell.requestFullscreen();} catch {status.textContent='Fullscreen is unavailable here. The model can still be rotated and zoomed in this page.';}});
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
