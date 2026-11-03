const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector<HTMLElement>('[data-carousel-track]')!;
  const slides = Array.from(track.children) as HTMLElement[];
  const previous = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]')!;
  const next = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]')!;
  const count = carousel.querySelector<HTMLElement>('[data-carousel-count]')!;
  const cycle = carousel.querySelector<HTMLButtonElement>('[data-carousel-cycle]');
  let current = 0, inView = false, hover = false, focused = false;
  let cycling = carousel.dataset.cycling === 'true' && !reducedMotion.matches;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const nearest = () => slides.reduce((best, slide, index) => Math.abs(slide.offsetLeft - slides[0].offsetLeft - track.scrollLeft) < Math.abs(slides[best].offsetLeft - slides[0].offsetLeft - track.scrollLeft) ? index : best, 0);
  const schedule = () => {
    clearTimeout(timer);
    if (cycle) {cycle.textContent = cycling ? 'Pause slideshow' : 'Play slideshow'; cycle.setAttribute('aria-pressed', String(cycling));}
    if (cycling && inView && !hover && !focused && !document.hidden && !document.querySelector('[data-lightbox][open]')) timer = setTimeout(() => go(current + 1), 6500);
  };
  const update = () => {
    current = nearest();
    count.textContent = `${current + 1} / ${slides.length}`;
    if (!cycle) {previous.disabled = current === 0; next.disabled = current === slides.length - 1;}
  };
  const go = (index: number) => {
    const target = cycle ? (index + slides.length) % slides.length : Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({left: slides[target].offsetLeft - slides[0].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    current = target;
    schedule();
  };
  const manualGo = (index: number) => {cycling = false; go(index);};
  previous.addEventListener('click', () => manualGo(current - 1));
  next.addEventListener('click', () => manualGo(current + 1));
  cycle?.addEventListener('click', () => {cycling = !cycling; schedule();});
  track.addEventListener('scroll', update, {passive:true});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const target = event.key === 'ArrowRight' ? current + 1 : event.key === 'ArrowLeft' ? current - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : null;
    if (target !== null) {event.preventDefault(); manualGo(target);}
  });
  track.addEventListener('pointerdown', () => {cycling = false; schedule();}, {passive:true});
  carousel.addEventListener('mouseenter', () => {hover = true; schedule();});
  carousel.addEventListener('mouseleave', () => {hover = false; schedule();});
  carousel.addEventListener('focusin', () => {focused = true; schedule();});
  carousel.addEventListener('focusout', event => {focused = carousel.contains(event.relatedTarget as Node | null); schedule();});
  reducedMotion.addEventListener('change', () => {if (reducedMotion.matches) cycling = false; schedule();});
  document.addEventListener('visibilitychange', schedule);
  document.querySelector('[data-lightbox]')?.addEventListener('close', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {inView = entries[0].isIntersecting; schedule();}, {threshold:0.25}).observe(track);
  else {inView = true; schedule();}
  new ResizeObserver(update).observe(track);
  carousel.querySelector<HTMLElement>('[data-carousel-controls]')!.hidden = false;
  update();
});
