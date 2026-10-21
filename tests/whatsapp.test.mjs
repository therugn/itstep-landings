// Проверка кнопки WhatsApp на лендингах: node --test tests/ (из корня репозитория, Node 20+).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const read = f => readFileSync(f, 'utf8');
const loc = (pathname, search = '') => ({origin: 'https://astana.it-step.kz', pathname, search});

/** Папки лендингов sites/<город>/<продукт> с index.html. */
function landings() {
 const out = [];
 for (const city of readdirSync(SITES)) {
  const dir = SITES + city;
  if (!statSync(dir).isDirectory()) continue;
  for (const product of readdirSync(dir)) {
   const d = `${dir}/${product}`;
   if (statSync(d).isDirectory() && existsSync(`${d}/index.html`)) out.push(d);
  }
 }
 return out;
}

// Код одинаков на всех лендингах (проверяется ниже), поэтому поведение проверяем на первом найденном.
const FIRST = landings().map(d => `${d}/whatsapp.js`).filter(existsSync)[0];
assert.ok(FIRST, 'нет ни одного sites/<город>/<продукт>/whatsapp.js');
const {buildWhatsAppUrl, landingPage} = await import(pathToFileURL(FIRST));
const {CONVERSIONS, fireWhatsAppClick} = await import(pathToFileURL(FIRST.replace(/whatsapp\.js$/, 'conversion.js')));

test('адрес страницы для сообщения: utm остаются, gclid и токен «Спасибо» уходят, слэш на конце', () => {
 assert.equal(landingPage(loc('/mka', '?utm_source=google&gclid=abc&utm_campaign=x')),
              'https://astana.it-step.kz/mka/?utm_source=google&utm_campaign=x');
 assert.equal(landingPage(loc('/mka/spasibo/', '?t=abc')), 'https://astana.it-step.kz/mka/');
 assert.equal(landingPage(loc('/mka/')), 'https://astana.it-step.kz/mka/');
});

test('ссылка wa.me: номер из настроек, адрес страницы в конце текста, не в начале', () => {
 const url = buildWhatsAppUrl(loc('/mka/', '?utm_campaign=x'), {phone: '77055353553', text: 'Здравствуйте! Хочу узнать о Малой академии.'});
 const u = new URL(url);
 assert.equal(u.origin + u.pathname, 'https://wa.me/77055353553');
 assert.equal(u.searchParams.get('text'), 'Здравствуйте! Хочу узнать о Малой академии. Пишу с сайта: https://astana.it-step.kz/mka/?utm_campaign=x');
});

test('конверсия клика WhatsApp: без ярлыка в gtag не уходит, с ярлыком уходит', () => {
 const calls = [];
 const win = {gtag: (...a) => calls.push(a)};
 assert.deepEqual(fireWhatsAppClick(win, {...CONVERSIONS, whatsappSendTo: ''}), []);
 assert.equal(calls.length, 0);
 assert.deepEqual(fireWhatsAppClick(win, {...CONVERSIONS, whatsappSendTo: 'AW-1/abc'}), ['google-ads']);
 assert.deepEqual(calls, [['event', 'conversion', {send_to: 'AW-1/abc'}]]);
});

test('копии whatsapp.js одинаковы на всех лендингах, кроме строки настроек; номер — 11 цифр с 7', () => {
 const files = landings().map(d => `${d}/whatsapp.js`).filter(existsSync);
 const strip = s => s.replace(/^export const WHATSAPP = \{.*\};$/m, '');
 const ref = strip(read(files[0]));
 for (const f of files) {
  assert.equal(strip(read(f)), ref, `отличается от ${files[0]}: ${f}`);
  assert.match(read(f), /^export const WHATSAPP = \{phone: '7\d{10}', text: '[^']+'\};$/m, f);
 }
});

test('лендинг с whatsapp.js подключает скрипт и ставит кнопки на странице продукта и на «Спасибо»', () => {
 for (const d of landings().filter(d => existsSync(`${d}/whatsapp.js`))) {
  for (const page of [`${d}/index.html`, `${d}/spasibo/index.html`]) {
   const html = read(page);
   assert.match(html, /<script type="module" src="whatsapp\.js"><\/script>/, page);
   assert.match(html, /<a [^>]*data-whatsapp[^>]*href="https:\/\/wa\.me\/7\d{10}"/, page);
  }
 }
});
