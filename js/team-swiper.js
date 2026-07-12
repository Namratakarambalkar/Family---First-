(function () {
  const slider = document.getElementById('teamSlider');
  if (!slider) return;

  const viewport = slider.querySelector('.team-slider-viewport');
  const track = slider.querySelector('.team-slider-track');
  const items = Array.from(slider.querySelectorAll('.team-slider-item'));
  const prevBtn = slider.querySelector('[data-prev]');
  const nextBtn = slider.querySelector('[data-next]');
  const dotsWrap = slider.querySelector('.team-slider-dots');

  if (!viewport || !track || items.length === 0) return;

  let index = 0;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let width = viewport.getBoundingClientRect().width || 1;

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'team-slider-dot';
      dot.setAttribute('aria-label', `Go to team member ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    syncDots();
  }

  function syncDots() {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.querySelectorAll('.team-slider-dot'));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === items.length - 1;
  }

  function applyTranslate(overrideIndex) {
    const i = typeof overrideIndex === 'number' ? overrideIndex : index;
    width = viewport.getBoundingClientRect().width || width;
    track.style.transform = `translateX(${-i * width}px)`;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, items.length - 1));
    applyTranslate(index);
    syncDots();
    updateButtons();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Swipe handling (pointer events)
  viewport.addEventListener('pointerdown', (e) => {
    if (items.length <= 1) return;
    isDragging = true;
    startX = e.clientX;
    currentX = e.clientX;
    track.style.transition = 'none';
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const dx = currentX - startX;

    // Prevent huge jumps by clamping
    const maxDx = width;
    const clampedDx = Math.max(-maxDx, Math.min(maxDx, dx));

    track.style.transform = `translateX(${ -index * width + clampedDx }px)`;
  });

  viewport.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 350ms ease';

    const dx = currentX - startX;
    const threshold = Math.min(80, width * 0.18);

    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();
    else goTo(index);
  });

  viewport.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 350ms ease';
    goTo(index);
  });

  window.addEventListener('resize', () => {
    applyTranslate(index);
  });

  buildDots();
  applyTranslate(0);
  updateButtons();
})();

