// Заголовок под ключевое слово (sites/astana/mka/headline.js): node --test tests/ (из корня репозитория, Node 20+).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const DIR = new URL('../sites/astana/mka/', import.meta.url);
const {HEADLINES, STORAGE_KEY, abVariant, applyHeadline, pickHeadline} = await import(new URL('headline.js', DIR));
const {buildPayload} = await import(new URL('lead.js', DIR));
const q = (term, campaign = 'mka_ast_search_core') => '?' + new URLSearchParams({utm_source: 'google', utm_campaign: campaign, utm_term: term});
const id = (term, campaign) => pickHeadline(q(term, campaign))?.id ?? null;

// Ключи кампании «МКА Астана | Дети-IT v2» (itstep-search-campaigns, загрузка 20.10.2026) → правило заголовка.
const CORE = {
 'программирование для детей': 'programming', 'программирование для детей астана': 'programming',
 'it программирование для детей': 'programming', 'азы программирования для детей': 'programming',
 'python для детей': 'python', 'scratch программирование для детей': 'scratch',
 'курсы программирования для детей': 'programming-courses', 'курсы программиста для детей': 'programming-courses',
 'it для детей': 'it', 'it курсы для детей': 'it', 'it курсы для детей астана': 'it', 'it обучение для детей': 'it', 'айти курсы для детей': 'it',
 'it курсы для подростков': 'teens', 'айти курсы для подростков': 'teens', 'курсы для подростков': 'teens', 'курсы для подростков астана': 'teens',
 'робототехника для детей': 'robotics', 'робототехника для детей астана': 'robotics', 'робототехника для детей лего': 'robotics',
 'lego mindstorms для детей': 'robotics', 'кружок робототехника': 'robotics-courses', 'курсы робототехники': 'robotics-courses',
 'курсы робототехники астана': 'robotics-courses', 'курсы робототехники для детей': 'robotics-courses',
 '3d моделирование для детей': '3d', '3д моделирование для детей': '3d', '3д печать для детей': '3d', 'моделирование для детей': '3d',
 'курсы 3д моделирования': '3d-courses', 'обучение 3д моделированию': '3d-courses',
 'создание игр для детей': 'games',
 'кружки для детей астана': 'clubs', 'кружок для ребёнка астана': 'clubs', 'кружок программирования астана': 'programming',
};
const COMPETITORS = ['kodland', 'кодленд', 'algoritmika', 'алгоритмика астана', 'robotek', 'роботек астана', 'kiberone', 'киберван',
 'jascode academy', 'жаскод', 'kursor school', 'курсор скул', 'impact academies астана', 'techspace school'];

test('каждый ключ основной кампании получает свой заголовок', () => {
 for (const [term, expected] of Object.entries(CORE)) assert.equal(id(term), expected, term);
});

test('конкуренты и бренды: стандартный H1, даже если в ключе есть слово из правил', () => {
 for (const term of COMPETITORS) assert.equal(id(term, 'mka_ast_search_comp'), null, term);
 for (const term of COMPETITORS) assert.equal(id(term), null, `${term} в чужой кампании`);
 assert.equal(id('роботек робототехника для детей'), null);
 assert.equal(id('академия шаг программирование'), null);
 assert.equal(id('программирование для детей', 'mka_ast_search_comp'), null, 'вся кампания конкурентов');
});

test('нет ключа или правила: стандартный H1', () => {
 assert.equal(pickHeadline(''), null);
 assert.equal(pickHeadline('?utm_source=google'), null);
 assert.equal(id('английский для детей'), null);
 assert.equal(id('---autotargeting'), null);
});

test('ключ нормализуется: регистр, ё, модификаторы соответствия', () => {
 assert.equal(id('+Python +для +детей'), 'python');
 assert.equal(id('"[Курсы Робототехники]"'), 'robotics-courses');
 assert.equal(id('кружок для ребёнка'), 'clubs');
});

test('заголовки: без ключа поиска в тексте, короткие, акцент в span', () => {
 for (const h of HEADLINES) {
  const text = h.html.replace(/<[^>]+>/g, '');
  assert.match(h.html, /^[^<]+ <span>[^<]+<\/span>$/, h.id);
  assert.ok(text.length <= 42, `${h.id}: ${text.length} знаков`);
  assert.doesNotMatch(text, /\d+\s*[–-]\s*\d+|\d+\+|лет/, `${h.id}: без возраста, просто «для детей» (Илья 23.10)`);
 }
 assert.equal(new Set(HEADLINES.map(h => h.id)).size, HEADLINES.length, 'id правил уникальны');
});

function fakeDoc() {
 return {title: 'Малая компьютерная академия ШАГ в Астане', getElementById: () => fakeDoc.h1, documentElement: {dataset: {}}};
}

test('вариант kw подменяет H1 и title, base оставляет как есть; метка уходит в заявку', () => {
 fakeDoc.h1 = {innerHTML: 'Малая компьютерная <span>академия ШАГ</span>'};
 const doc = fakeDoc();
 assert.equal(applyHeadline(doc, q('python для детей'), 'kw'), 'kw:python');
 assert.equal(fakeDoc.h1.innerHTML, 'Python <span>для детей</span>');
 assert.equal(doc.title, 'Python для детей — Академия ШАГ в Астане');

 fakeDoc.h1 = {innerHTML: 'Малая компьютерная <span>академия ШАГ</span>'};
 const base = fakeDoc();
 assert.equal(applyHeadline(base, q('python для детей'), 'base'), 'base:python');
 assert.equal(fakeDoc.h1.innerHTML, 'Малая компьютерная <span>академия ШАГ</span>');
 assert.equal(base.title, 'Малая компьютерная академия ШАГ в Астане');

 assert.equal(applyHeadline(fakeDoc(), q('kodland', 'mka_ast_search_comp'), 'kw'), '');

 const loc = {href: 'https://astana.it-step.kz/mka/' + q('python для детей'), search: q('python для детей')};
 const data = {name: 'Тест', phone: '+77001112233'};
 assert.equal(buildPayload(data, loc, {documentElement: {dataset: {h1: 'kw:python'}}}).h1, 'kw:python');
 assert.equal('h1' in buildPayload(data, loc, {documentElement: {dataset: {}}}), false);
 assert.equal('h1' in buildPayload(data, loc, undefined), false);
});

test('тест 50/50: вариант закрепляется за посетителем, сбой хранилища не ломает страницу', () => {
 const store = new Map();
 const storage = {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v)};
 assert.equal(abVariant(storage, () => 0.2), 'kw');
 assert.equal(store.get(STORAGE_KEY), 'kw');
 assert.equal(abVariant(storage, () => 0.9), 'kw', 'повторный заход — тот же вариант');
 assert.equal(abVariant({getItem: () => { throw new Error('blocked'); }}, () => 0.9), 'base');
 assert.equal(abVariant(undefined, () => 0.1), 'kw');
});

test('index.html: headline.js подключён до app.js, H1 скрыт только на время подмены', () => {
 const html = readFileSync(new URL('index.html', DIR), 'utf8');
 assert.ok(html.indexOf('src="headline.js"') > 0 && html.indexOf('src="headline.js"') < html.indexOf('src="app.js"'));
 assert.match(html, /\.h1-wait #hero-title\{visibility:hidden\}/);
 assert.match(html, /classList\.remove\('h1-wait'\)\},1500\)/);
 assert.match(html, /<h1 id="hero-title">Малая компьютерная <span>академия ШАГ<\/span><\/h1>/, 'стандартный H1 в разметке');
});
