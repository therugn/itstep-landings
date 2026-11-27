// Куки пикселя Meta в заявке: node --test tests/ (из корня репозитория, Node 20+).
// ЦУП 27.11.2026: CRM шлёт по заявке серверный Lead в пиксель, и для связи с рекламой ему нужны fbp и fbc.
// Каждый lead.js кладёт куки _fbp и _fbc в тело заявки (fbp, fbc); приёмщик проверяет формат и передаёт их в CRM.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));

/** Все lead.js в sites/ — у каждого лендинга с формой свой. */
function leadFiles(dir = SITES, out = []) {
 for (const name of readdirSync(dir)) {
  const path = `${dir}${name}`;
  if (statSync(path).isDirectory()) leadFiles(`${path}/`, out);
  else if (name === 'lead.js') out.push(path);
 }
 return out;
}
const FILES = leadFiles();
const DATA = {name: 'Тест', phone: '+77001112233'};
const LOC = {href: 'https://x.it-step.kz/mka/?utm_source=facebook', search: '?utm_source=facebook'};

test('нашлись lead.js', () => assert.ok(FILES.length >= 40, `lead.js: ${FILES.length}`));

test('lead.js: куки _fbp и _fbc уходят в заявку как fbp и fbc, чужие куки — нет', async () => {
 const cookie = '_ga=GA1.1.1; _fbp=fb.1.1764233000000.1116446470;_fbc=fb.1.1764233000123.IwAR2F4-d_b; x_fbp=1';
 for (const file of FILES) {
  const {buildPayload} = await import(pathToFileURL(file));
  const p = buildPayload(DATA, LOC, {cookie, documentElement: {dataset: {}}});
  const where = file.slice(SITES.length);
  assert.equal(p.fbp, 'fb.1.1764233000000.1116446470', where);
  assert.equal(p.fbc, 'fb.1.1764233000123.IwAR2F4-d_b', where);
  assert.equal(p.utm_source, 'facebook', where);
  assert.equal('_ga' in p || 'ga' in p || 'x_fbp' in p, false, where);
 }
});

test('lead.js: без кук пикселя и без document заявка собирается без fbp и fbc', async () => {
 for (const file of FILES) {
  const {buildPayload} = await import(pathToFileURL(file));
  for (const doc of [undefined, {cookie: ''}, {cookie: '_ga=1'}]) {
   const p = buildPayload(DATA, LOC, doc);
   assert.equal('fbp' in p || 'fbc' in p, false, file.slice(SITES.length));
  }
 }
});
