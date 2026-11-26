export function initCourseNavigation(root = document) {
 const header = root.querySelector('.course-header');
 const toggle = root.querySelector('.menu-toggle');
 const nav = root.querySelector('#course-navigation');
 if (!header || !toggle || !nav || header.dataset.navigationReady) return;
 const win = root.defaultView;
 const mobile = win.matchMedia('(max-width: 700px)');
 let open = false;
 const sync = () => {
  toggle.hidden = !mobile.matches;
  nav.hidden = mobile.matches && !open;
  toggle.setAttribute('aria-expanded', String(mobile.matches && open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
 };
 const close = (returnFocus = false) => {
  open = false;
  sync();
  if (returnFocus) toggle.focus();
 };
 header.dataset.navigationReady = 'true';
 sync();
 toggle.addEventListener('click', () => { open = !open; sync(); });
 nav.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = root.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  close();
  target.setAttribute('tabindex', '-1');
  target.focus({preventScroll: true});
  target.scrollIntoView({behavior: win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  win.history.replaceState(null, '', win.location.pathname + win.location.search + link.hash);
 });
 root.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && open) close(true);
 });
 root.addEventListener('click', event => {
  if (mobile.matches && open && !header.contains(event.target)) close();
 });
 mobile.addEventListener('change', () => { open = false; sync(); });
}
if (typeof document !== 'undefined') initCourseNavigation(document);
