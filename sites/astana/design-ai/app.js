import {initBenefitDeck} from './src/benefit-deck.js';
import {initCareerCarousel} from './src/career-carousel.js';
import {initTrialForms} from './src/trial-form.js';
export function initNavigation(root = document) {
  const toggle = root.querySelector('.menu-toggle');
  const menu = root.querySelector('#mobile-nav');
  if (!toggle || !menu || toggle.dataset.initialized === 'true') return;
  toggle.dataset.initialized = 'true';
  toggle.hidden = false;
  const setOpen = (open, returnFocus = false) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    toggle.querySelector('img').src = `assets/icons/${open ? 'x' : 'list'}.svg`;
    if (returnFocus) toggle.focus();
    else if (open) menu.querySelector('a')?.focus();
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setOpen(false, true);
  });
  root.addEventListener('pointerdown', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) setOpen(false);
  });
  const desktop = root.defaultView?.matchMedia?.('(min-width: 761px)');
  desktop?.addEventListener('change', event => {
    if (event.matches) setOpen(false);
  });
}

export function initCourseInteractions(root = document) {
  const show = root.querySelector('.show-modules');
  if (show && show.dataset.initialized !== 'true') {
    show.dataset.initialized = 'true';
    const additional = [...root.querySelectorAll('[data-module]')].slice(3);
    for (const module of additional) module.hidden = true;
    show.hidden = additional.length === 0;
    show.addEventListener('click', () => {
      for (const module of additional) module.hidden = false;
      if (additional[0]) {
        additional[0].querySelector('summary')?.focus();
      }
      show.hidden = true;
    });
  }
  for (const image of root.querySelectorAll('img[data-original-work]')) {
    if (image.dataset.initialized === 'true') continue;
    image.dataset.initialized = 'true';
    const unavailable = () => {
      const fallback = image.parentElement.querySelector('.image-fallback');
      if (!fallback) return;
      image.hidden = true;
      fallback.hidden = false;
    };
    image.addEventListener('error', unavailable);
    if (image.complete && image.naturalWidth === 0) unavailable();
  }
  initTrialForms(root);
  initCareerCarousel(root);
  initBenefitDeck(root);
}

if (typeof document !== 'undefined') {
  initNavigation(document);
  initCourseInteractions(document);
}

if(typeof document!=="undefined")document.addEventListener("click",event=>{const a=event.target.closest('a[href^="#"]');if(!a)return;const target=document.getElementById(a.getAttribute("href").slice(1));if(!target)return;event.preventDefault();target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});history.replaceState(null,"",location.pathname+location.search+a.getAttribute("href"));});
