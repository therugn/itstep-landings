(function () {
  'use strict';
  function nextIndex(current, direction, count, loop) {
    if (count < 2) return 0;
    const target = current + direction;
    return loop ? ((target % count) + count) % count : Math.max(0, Math.min(count - 1, target));
  }
  function isCarouselEnabled(viewportWidth) {return viewportWidth < 768;}
  if (typeof module !== 'undefined' && module.exports) module.exports = {nextIndex, isCarouselEnabled};
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    const track = root.querySelector('.carousel-track');
    const original = Array.from(track.children);
    const count = original.length;
    const loop = root.dataset.loop === 'true';
    const previous = root.querySelector('[data-previous]');
    const next = root.querySelector('[data-next]');
    const status = root.querySelector('[data-status]');
    let active = 0;
    let timer;
    let resizing;
    let enabled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)');
    function addClones() {
      if (!loop || count < 2) return;
      const before = document.createDocumentFragment();
      const after = document.createDocumentFragment();
      original.forEach(function (slide) {
        [before, after].forEach(function (fragment) {
          const clone = slide.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.inert = true;
          clone.dataset.carouselClone = 'true';
          fragment.appendChild(clone);
        });
      });
      track.prepend(before);
      track.append(after);
    }
    function step() {
      const children = track.children;
      return children.length > 1 ? children[1].offsetLeft - children[0].offsetLeft : track.clientWidth;
    }
    function setInstant(position) {
      const snap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      track.scrollTo({left: position, behavior: 'instant'});
      requestAnimationFrame(function () {track.style.scrollSnapType = snap;});
    }
    function render() {
      if (!enabled) return;
      if (loop) {
        active = nextIndex(Math.round(track.scrollLeft / step()) - count, 0, count, true);
      } else {
        const max = track.scrollWidth - track.clientWidth;
        active = max > 0 ? Math.round(track.scrollLeft / max * (count - 1)) : 0;
      }
      previous.disabled = !loop && active === 0;
      next.disabled = !loop && active === count - 1;
      status.textContent = 'Карточка ' + (active + 1) + ' из ' + count;
    }
    function settle() {
      if (!enabled) return;
      if (loop) {
        const width = step();
        const physical = Math.round(track.scrollLeft / width);
        if (physical < count) setInstant((physical + count) * width);
        else if (physical >= count * 2) setInstant((physical - count) * width);
      }
      render();
    }
    function move(direction) {
      if (!enabled) return;
      render();
      const target = nextIndex(active, direction, count, loop);
      let left;
      if (loop) {
        left = (Math.round(track.scrollLeft / step()) + direction) * step();
      } else {
        left = target / Math.max(1, count - 1) * (track.scrollWidth - track.clientWidth);
      }
      track.scrollTo({left: left, behavior: reduced.matches ? 'instant' : 'smooth'});
    }
    previous.addEventListener('click', function () {move(-1);});
    next.addEventListener('click', function () {move(1);});
    track.addEventListener('scroll', function () {
      if (!enabled) return;
      clearTimeout(timer);
      timer = setTimeout(settle, 180);
    }, {passive: true});
    track.addEventListener('keydown', function (event) {
      if (!enabled) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    function layout() {
      clearTimeout(timer);
      if (!enabled) return;
      if (loop) setInstant((count + active) * step());
      else setInstant(active / Math.max(1, count - 1) * (track.scrollWidth - track.clientWidth));
      render();
    }
    function applyMode() {
      const useCarousel = isCarouselEnabled(window.innerWidth);
      if (useCarousel === enabled) {
        if (enabled) requestAnimationFrame(layout);
        else {
          track.removeAttribute('tabindex');
          root.removeAttribute('aria-roledescription');
        }
        return;
      }
      clearTimeout(timer);
      track.querySelectorAll('[data-carousel-clone]').forEach(function (node) {node.remove();});
      enabled = useCarousel;
      if (enabled) {
        track.tabIndex = 0;
        root.setAttribute('aria-roledescription', 'карусель');
        addClones();
        requestAnimationFrame(layout);
      } else {
        track.removeAttribute('tabindex');
        root.removeAttribute('aria-roledescription');
        track.style.scrollSnapType = '';
        track.scrollTo({left: 0, behavior: 'instant'});
      }
    }
    applyMode();
    mobile.addEventListener('change', applyMode);
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () {
        cancelAnimationFrame(resizing);
        resizing = requestAnimationFrame(layout);
      }).observe(track);
    }
  });

  // The resume is static on desktop; native details provide mobile disclosures.
  const resumeDetails = Array.from(document.querySelectorAll('.resume-disclosure'));
  if (resumeDetails.length) {
    const resumeMobile = window.matchMedia('(max-width: 767px)');
    function syncResumeLayout() {
      resumeDetails.forEach(function (detail) {
        detail.open = resumeMobile.matches ? false : true;
        detail.querySelector('summary').tabIndex = resumeMobile.matches ? 0 : -1;
      });
    }
    resumeDetails.forEach(function (detail) {
      detail.querySelector('summary').addEventListener('click', function (event) {
        if (!resumeMobile.matches) event.preventDefault();
      });
    });
    syncResumeLayout();
    resumeMobile.addEventListener('change', syncResumeLayout);
  }
}());
