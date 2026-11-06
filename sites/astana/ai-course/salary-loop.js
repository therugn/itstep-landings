(() => {
  const track = document.querySelector('[data-salary-loop]');
  if (!track) return;
  const mobile = matchMedia('(max-width: 700px)');
  const originals = [...track.children];
  const controls = document.querySelector('.salary-loop-controls');
  let slides = originals;
  let timer;
  let jumping = false;
  let active = 0;
  let trackWidth = track.getBoundingClientRect().width;
  function nearest() {
    const left = track.getBoundingClientRect().left;
    return slides.reduce((best, slide, index) => Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(slides[best].getBoundingClientRect().left - left) ? index : best, 0);
  }
  function offset(index) { return track.scrollLeft + slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left; }
  function jump(index) {
    if (!mobile.matches || !slides[index]) return;
    jumping = true;
    track.style.scrollSnapType = 'none';
    track.scrollTo({left:offset(index),behavior:'instant'});
    requestAnimationFrame(() => requestAnimationFrame(() => { track.style.scrollSnapType = ''; jumping = false; }));
  }
  function settle() {
    if (!mobile.matches || jumping) return;
    const index = nearest();
    if (index === 0) { active = originals.length - 1; jump(originals.length); }
    else if (index === slides.length - 1) { active = 0; jump(1); }
    else active = index - 1;
  }
  function clone(card) {
    const copy = card.cloneNode(true);
    copy.dataset.loopClone = '';
    copy.setAttribute('aria-hidden','true');
    copy.setAttribute('inert','');
    return copy;
  }
  function setup() {
    clearTimeout(timer);
    trackWidth = track.getBoundingClientRect().width;
    track.querySelectorAll('[data-loop-clone]').forEach(card => card.remove());
    track.tabIndex = mobile.matches ? 0 : -1;
    if (!mobile.matches) { slides = originals; track.style.scrollSnapType=''; track.scrollLeft=0; return; }
    track.prepend(clone(originals[originals.length-1]));
    track.append(clone(originals[0]));
    slides = [...track.children];
    requestAnimationFrame(() => jump(active+1));
  }
  function move(step) {
    if (!mobile.matches || jumping) return;
    const index = Math.max(0, Math.min(slides.length-1, nearest()+step));
    active = (index - 1 + originals.length) % originals.length;
    track.scrollTo({left:offset(index),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    clearTimeout(timer); timer=setTimeout(settle,140);
  }
  controls.querySelectorAll('[data-loop-step]').forEach(button => button.addEventListener('click',() => move(Number(button.dataset.loopStep))));
  track.addEventListener('scroll',() => { if (!jumping) {clearTimeout(timer);timer=setTimeout(settle,140);} },{passive:true});
  track.addEventListener('keydown',event => {
    if (event.target!==track || !mobile.matches) return;
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') {event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
  });
  mobile.addEventListener('change',setup);
  let resizeTimer;
  window.addEventListener('resize',() => {
    const width = track.getBoundingClientRect().width;
    // Mobile browser chrome changes viewport height while the card width stays the same.
    if (!mobile.matches || Math.abs(width - trackWidth) < 0.5) return;
    trackWidth = width;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => jump(active+1),120);
  });
  setup();
})();
