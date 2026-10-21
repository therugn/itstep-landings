// Проверка кнопки WhatsApp на лендингах: node --test tests/ (из корня репозитория, Node 20+).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const read = f => readFileSync(f, 'utf8');
const loc = (pathname, search = '') => ({host: 'astana.it-step.kz', pathname, search});

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
const {buildWhatsAppUrl, clickPayload, landingPage, newCode, reportClick} = await import(pathToFileURL(FIRST));
const {CONVERSIONS, fireWhatsAppClick} = await import(pathToFileURL(FIRST.replace(/whatsapp\.js$/, 'conversion.js')));

test('адрес страницы для сообщения: только хост и путь, без схемы, меток и слэша на конце', () => {
 assert.equal(landingPage(loc('/mka', '?utm_source=google&gclid=abc&utm_campaign=x')), 'astana.it-step.kz/mka');
 assert.equal(landingPage(loc('/mka/spasibo/', '?t=abc')), 'astana.it-step.kz/mka');
 assert.equal(landingPage(loc('/mka/')), 'astana.it-step.kz/mka');
});

test('ссылка wa.me: номер из настроек, адрес страницы с кодом клика в конце текста, не в начале', () => {
 const url = buildWhatsAppUrl(loc('/mka/', '?utm_campaign=x'), {phone: '77055353553', text: 'Здравствуйте! Хочу узнать о Малой академии.'}, 'k7f3');
 const u = new URL(url);
 assert.equal(u.origin + u.pathname, 'https://wa.me/77055353553');
 assert.equal(u.searchParams.get('text'), 'Здравствуйте! Хочу узнать о Малой академии. Пишу с сайта astana.it-step.kz/mka/k7f3');
});

test('код клика: 4 знака без путающихся символов, каждый раз новый', () => {
 const codes = new Set(Array.from({length: 50}, newCode));
 for (const c of codes) assert.match(c, /^[abcdefghjkmnpqrstuvwxyz23456789]{4}$/, c);
 assert.ok(codes.size > 40);
});

test('запись о клике: код, страница без меток, utm и идентификаторы кликов, ничего лишнего', () => {
 const l = {host: 'astana.it-step.kz', origin: 'https://astana.it-step.kz', pathname: '/mka/',
            search: '?utm_source=google&utm_campaign=x&gclid=G1&fbclid=F1&foo=bar'};
 assert.deepEqual(clickPayload(l, 'k7f3'), {code: 'k7f3', page: 'https://astana.it-step.kz/mka/',
                                            utm_source: 'google', utm_campaign: 'x', gclid: 'G1', fbclid: 'F1'});
});

test('отправка клика: keepalive, text/plain, JSON в теле; сбой сети глотается', async () => {
 const calls = [];
 const ok = await reportClick({code: 'k7f3'}, (url, init) => { calls.push([url, init]); return Promise.resolve({ok: true}); });
 assert.equal(ok, true);
 const [url, init] = calls[0];
 assert.equal(url, 'https://api.it-step.kz/wa/click');
 assert.equal(init.method, 'POST');
 assert.equal(init.keepalive, true);
 assert.equal(init.headers['Content-Type'], 'text/plain');
 assert.deepEqual(JSON.parse(init.body), {code: 'k7f3'});
 assert.equal(await reportClick({code: 'k7f3'}, () => Promise.reject(new Error('net'))), false);
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

test('лендинг с whatsapp.js: на странице продукта скрипт и одна плавающая кнопка, на «Спасибо» кнопки нет', () => {
 for (const d of landings().filter(d => existsSync(`${d}/whatsapp.js`))) {
  const html = read(`${d}/index.html`);
  assert.match(html, /<script type="module" src="whatsapp\.js"><\/script>/, d);
  const buttons = html.match(/<a [^>]*data-whatsapp[^>]*>/g) || [];
  assert.equal(buttons.length, 1, `${d}: ссылок data-whatsapp ${buttons.length}, нужна одна плавающая`);
  assert.match(buttons[0], /class="wa-float"[^>]*href="https:\/\/wa\.me\/7\d{10}"/, d);
  const thanks = read(`${d}/spasibo/index.html`);
  assert.doesNotMatch(thanks, /data-whatsapp|whatsapp\.js/, `${d}/spasibo`);
 }
});
