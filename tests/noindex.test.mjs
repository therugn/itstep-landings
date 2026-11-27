// Лендинги закрыты от поисковиков (решение Ильи 27.11.2026): node --test tests/ (из корня репозитория, Node 20+).
// Каждая страница в sites/ — <meta name="robots" content="noindex, nofollow"> в <head>, ровно один раз.
// robots.txt с Disallow не ставим: робот тогда не прочитает noindex, а уже попавшие в поиск страницы так в нём и останутся.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const pages = dir => readdirSync(dir).flatMap(n => {
 const p = join(dir, n);
 return statSync(p).isDirectory() ? pages(p) : n.endsWith('.html') ? [p] : [];
});

test('каждая страница лендингов закрыта от индексации: noindex, nofollow в <head>, ровно один раз', () => {
 const all = pages(SITES);
 assert.ok(all.length > 40, `найдено страниц: ${all.length}`);
 for (const p of all) {
  const html = readFileSync(p, 'utf8');
  if (!/<head[\s>]/i.test(html)) continue;            // фрагмент (contacts-archive), не страница
  const head = html.slice(0, html.indexOf('</head>'));
  assert.equal((html.match(/name="robots"/g) || []).length, 1, `${p}: meta robots должен быть ровно один`);
  assert.ok(head.includes('<meta name="robots" content="noindex, nofollow">'), `${p}: нет noindex, nofollow в <head>`);
 }
});
