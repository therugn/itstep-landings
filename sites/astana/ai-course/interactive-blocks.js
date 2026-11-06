(() => {
  const mobile = matchMedia('(max-width: 700px)');
  const resumeSections = [...document.querySelectorAll('.resume-disclosure')];
  function keepOneResumeSection(section) {
    if (mobile.matches || !section.open) return;
    resumeSections.forEach(other => { if (other !== section) other.open = false; });
  }
  resumeSections.forEach(section => section.addEventListener('toggle', () => keepOneResumeSection(section)));
  mobile.addEventListener('change', () => {
    const firstOpen = resumeSections.find(section => section.open);
    if (firstOpen) keepOneResumeSection(firstOpen);
  });

  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', updateTierCounts);
    tab.addEventListener('keydown', updateTierCounts);
  });
  function updateTierCounts() {
    const download = document.querySelector('[data-program-download]');
    if (download) download.dataset.tier = document.getElementById('tab-pro')?.getAttribute('aria-selected') === 'true' ? 'pro' : 'basic';
    document.querySelectorAll('[data-tier-count]').forEach(count => {
      const tab = document.getElementById('tab-' + count.dataset.tierCount);
      count.classList.toggle('is-active', tab?.getAttribute('aria-selected') === 'true');
    });
  }
  updateTierCounts();

  document.querySelectorAll('[data-carousel]').forEach(track => {
    const slides = [...track.querySelectorAll('[data-carousel-slide]')];
    const controls = document.querySelector(`[data-carousel-controls="${track.id}"]`);
    let frame = 0;
    function currentIndex() {
      const left = track.getBoundingClientRect().left;
      return slides.reduce((best, slide, index) => Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(slides[best].getBoundingClientRect().left - left) ? index : best, 0);
    }
    function update() {
      frame = 0;
      track.tabIndex = mobile.matches ? 0 : -1;
      if (!mobile.matches) {
        track.style.height = '';
        track.style.removeProperty('--practice-slide-height');
        return;
      }
      if (track.id === 'practice-carousel') {
        const firstHeight = slides[0].getBoundingClientRect().height;
        if (firstHeight > 0) track.style.setProperty('--practice-slide-height', firstHeight + 'px');
      }
      const index = currentIndex();
      track.style.height = '';
      if (controls) {
        controls.querySelector('[data-carousel-step="-1"]').disabled = index === 0;
        controls.querySelector('[data-carousel-step="1"]').disabled = index === slides.length - 1;
      }
    }
    function queueUpdate() { if (!frame) frame = requestAnimationFrame(update); }
    function goTo(index) {
      if (!mobile.matches) return;
      index = Math.max(0, Math.min(slides.length - 1, index));
      const offset = slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      track.scrollTo({ left: offset, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    controls?.querySelectorAll('[data-carousel-step]').forEach(button => button.addEventListener('click', () => goTo(currentIndex() + Number(button.dataset.carouselStep))));
    track.addEventListener('scroll', queueUpdate, { passive: true });
    track.addEventListener('keydown', event => {
      if (!mobile.matches || event.target !== track) return;
      let index;
      if (event.key === 'ArrowRight') index = currentIndex() + 1;
      if (event.key === 'ArrowLeft') index = currentIndex() - 1;
      if (event.key === 'Home') index = 0;
      if (event.key === 'End') index = slides.length - 1;
      if (index !== undefined) { event.preventDefault(); goTo(index); }
    });
    mobile.addEventListener('change', () => { if (!mobile.matches) track.scrollLeft = 0; queueUpdate(); });
    window.addEventListener('resize', queueUpdate, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(queueUpdate);
      slides.forEach(slide => observer.observe(slide));
    }
    update();
  });
})();
