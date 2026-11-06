// Пиксель Meta на лендингах: node --test tests/ (из корня репозитория, Node 20+).
// Казахстан (*.it-step.kz) — пиксель 1116204957997416, Узбекистан (*.stepacademy.uz) — 1115445171398466.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const PIXEL = {KZ: '1116204957997416', UZ: '1115445171398466'};
const UZ_CITIES = new Set(['tashkent', 'samarkand']);   // новый город Узбекистана — добавить сюда

/** Лендинги sites/<город>/<продукт> с index.html (корневые переадресации и sites/test не трогаем). */
function landings() {
 const out = [];
 for (const city of readdirSync(SITES)) {
  if (city === 'test' || !statSync(SITES + city).isDirectory()) continue;
  for (const product of readdirSync(SITES + city)) {
   const d = `${SITES}${city}/${product}`;
   if (statSync(d).isDirectory() && existsSync(`${d}/index.html`)) out.push({city, dir: d});
  }
 }
 return out;
}

test('на каждой странице продукта и «Спасибо» — пиксель своей страны, ровно один', () => {
 const all = landings();
 assert.ok(all.length > 0);
 for (const {city, dir} of all) {
  const want = UZ_CITIES.has(city) ? PIXEL.UZ : PIXEL.KZ;
  const other = UZ_CITIES.has(city) ? PIXEL.KZ : PIXEL.UZ;
  for (const page of [`${dir}/index.html`, `${dir}/spasibo/index.html`]) {
   const html = readFileSync(page, 'utf8');
   const head = html.slice(0, html.indexOf('</head>'));
   assert.equal((head.match(/fbq\('init'/g) || []).length, 1, `${page}: fbq init должен быть один раз в <head>`);
   assert.ok(head.includes(`fbq('init', '${want}')`), `${page}: нет пикселя ${want}`);
   assert.ok(head.includes(`tr?id=${want}&`), `${page}: noscript не на пиксель ${want}`);
   assert.ok(!html.includes(other), `${page}: пиксель другой страны ${other}`);
   assert.equal((html.match(/fbq\('track', 'PageView'\)/g) || []).length, 1, `${page}: PageView ровно один`);
  }
 }
});

test('корневые переадресации городов без пикселя (иначе двойной PageView)', () => {
 for (const city of readdirSync(SITES)) {
  const f = `${SITES}${city}/index.html`;
  if (existsSync(f)) assert.ok(!readFileSync(f, 'utf8').includes('fbq('), f);
 }
});

const FIRST = landings().map(x => `${x.dir}/conversion.js`).filter(existsSync)[0];
const {CONVERSIONS, fireConversions, fireWhatsAppClick} = await import(pathToFileURL(FIRST));
const fakeWin = () => { const calls = []; return {calls, fbq: (...a) => calls.push(['fbq', ...a]), gtag: (...a) => calls.push(['gtag', ...a])}; };

test('заявка подтверждена — Lead в Meta вместе с конверсией Google', () => {
 const w = fakeWin();
 assert.deepEqual(fireConversions(w), ['google-ads', 'meta']);
 assert.deepEqual(w.calls.filter(c => c[0] === 'fbq'), [['fbq', 'track', 'Lead']]);
});

test('клик по мессенджеру — Contact в Meta', () => {
 const w = fakeWin();
 assert.deepEqual(fireWhatsAppClick(w), ['google-ads', 'meta']);
 assert.deepEqual(w.calls.filter(c => c[0] === 'fbq'), [['fbq', 'track', 'Contact']]);
});

test('без загруженного fbq (блокировщик рекламы) ничего не падает', () => {
 const gtagOnly = {gtag() {}};
 assert.deepEqual(fireConversions(gtagOnly), ['google-ads']);
 assert.deepEqual(fireWhatsAppClick(gtagOnly), ['google-ads']);
 assert.deepEqual(fireConversions({}), []);
 assert.equal(CONVERSIONS.metaPixel, true);
});
