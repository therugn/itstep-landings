// Кнопка Telegram на лендингах Узбекистана (вместо WhatsApp): node --test tests/ (из корня репозитория, Node 20+).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const read = f => readFileSync(f, 'utf8');

/** Папки лендингов sites/<город>/<продукт> с telegram.js. */
function landings() {
 const out = [];
 for (const city of readdirSync(SITES)) {
  const dir = SITES + city;
  if (!statSync(dir).isDirectory()) continue;
  for (const product of readdirSync(dir)) {
   const d = `${dir}/${product}`;
   if (statSync(d).isDirectory() && existsSync(`${d}/telegram.js`)) out.push(d);
  }
 }
 return out;
}

const DIRS = landings();
assert.ok(DIRS.length, 'нет ни одного sites/<город>/<продукт>/telegram.js');
const {buildTelegramUrl, TELEGRAM} = await import(pathToFileURL(`${DIRS[0]}/telegram.js`));

test('ссылка t.me: имя из настроек, адрес страницы с кодом клика в конце текста', () => {
 const loc = {host: 'tashkent.stepacademy.uz', pathname: '/mka/spasibo/', search: '?utm_source=google'};
 const u = new URL(buildTelegramUrl(loc, TELEGRAM, 'k7f3'));
 assert.equal(u.origin + u.pathname, `https://t.me/${TELEGRAM.username}`);
 const text = u.searchParams.get('text');
 assert.ok(text.startsWith(TELEGRAM.text), text);
 assert.ok(text.endsWith('Пишу с сайта tashkent.stepacademy.uz/mka/k7f3'), text);
 assert.doesNotMatch(text, /utm_|https?:/);
});

test('копии telegram.js одинаковы, кроме строки настроек', () => {
 const strip = s => s.replace(/^export const TELEGRAM = \{.*\};$/m, '');
 const ref = strip(read(`${DIRS[0]}/telegram.js`));
 for (const d of DIRS) {
  assert.equal(strip(read(`${d}/telegram.js`)), ref, d);
  assert.match(read(`${d}/telegram.js`), /^export const TELEGRAM = \{username: '[A-Za-z0-9_]{5,32}', text: '[^']+'\};$/m, d);
 }
});

test('лендинг с telegram.js: скрипт и одна плавающая кнопка, без WhatsApp, на «Спасибо» кнопки нет', () => {
 for (const d of DIRS) {
  assert.ok(!existsSync(`${d}/whatsapp.js`), `${d}: и whatsapp.js, и telegram.js`);
  const html = read(`${d}/index.html`);
  assert.match(html, /<script type="module" src="telegram\.js"><\/script>/, d);
  const buttons = html.match(/<a [^>]*data-telegram[^>]*>/g) || [];
  assert.equal(buttons.length, 1, `${d}: ссылок data-telegram ${buttons.length}, нужна одна плавающая`);
  assert.match(buttons[0], /class="wa-float tg-float"[^>]*href="https:\/\/t\.me\/[A-Za-z0-9_]+"/, d);
  assert.doesNotMatch(html, /data-whatsapp/, d);
  assert.doesNotMatch(read(`${d}/spasibo/index.html`), /data-telegram|telegram\.js/, `${d}/spasibo`);
 }
});
