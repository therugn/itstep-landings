/** Лёгкое конфетти без библиотек: два «залпа» снизу и дождь сверху, затем всё убирается само. */
export const COLORS = ['#d5f54a', '#ff7428', '#ffffff', '#e5d8ff', '#ffe1c6', '#1d1b36'];

/** Частицы для залпа. rng подменяется в тестах. */
export function createParticles({count = 140, width = 1000, height = 700, rng = Math.random} = {}) {
 const particles = [];
 for (let i = 0; i < count; i++) {
  const fromLeft = i % 2 === 0;
  const angle = (fromLeft ? -65 : -115) * Math.PI / 180 + (rng() - 0.5) * 0.9;
  const speed = 9 + rng() * 11;
  particles.push({
   x: fromLeft ? width * 0.12 : width * 0.88, y: height * 0.92,
   vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
   size: 6 + rng() * 7, rot: rng() * Math.PI * 2, vr: (rng() - 0.5) * 0.35,
   color: COLORS[Math.floor(rng() * COLORS.length)], round: rng() < 0.25, life: 0
  });
 }
 return particles;
}

export function startConfetti(canvas, {duration = 4200, win = globalThis.window} = {}) {
 if (!canvas || !win || win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};
 const ctx = canvas.getContext('2d');
 const dpr = Math.min(win.devicePixelRatio || 1, 2);
 let width = 0, height = 0;
 const resize = () => {
  width = win.innerWidth; height = win.innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
 };
 resize();
 win.addEventListener('resize', resize);

 let particles = createParticles({count: width < 700 ? 90 : 150, width, height});
 const started = performance.now();
 let rainAt = 0, raf = 0, stopped = false;

 const stop = () => {
  if (stopped) return;
  stopped = true;
  cancelAnimationFrame(raf);
  win.removeEventListener('resize', resize);
  ctx.clearRect(0, 0, width, height);
 };

 const frame = now => {
  const elapsed = now - started;
  ctx.clearRect(0, 0, width, height);
  if (elapsed < duration * 0.7 && now - rainAt > 90) {            // дождь сверху
   rainAt = now;
   for (let i = 0; i < 4; i++) {
    particles.push({x: Math.random() * width, y: -12, vx: (Math.random() - 0.5) * 2.4, vy: 1.5 + Math.random() * 2.5,
     size: 6 + Math.random() * 6, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
     color: COLORS[Math.floor(Math.random() * COLORS.length)], round: Math.random() < 0.25, life: 0});
   }
  }
  const fade = elapsed > duration * 0.75 ? Math.max(0, 1 - (elapsed - duration * 0.75) / (duration * 0.25)) : 1;
  particles = particles.filter(p => p.y < height + 30);
  for (const p of particles) {
   p.vy += 0.28; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
   ctx.save();
   ctx.globalAlpha = fade;
   ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
   if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.283); ctx.fill(); }
   else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
   ctx.restore();
  }
  if (elapsed >= duration || particles.length === 0) return stop();
  raf = requestAnimationFrame(frame);
 };
 raf = requestAnimationFrame(frame);
 return stop;
}
