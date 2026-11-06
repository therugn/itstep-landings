// Заголовок под ключевое слово (sites/<город>/<направление>/headline.js): node --test tests/ (из корня репозитория, Node 20+).
// С 06.11.2026 подмену видят все посетители (тест 50/50 снят). Новый город или направление — строка в CITIES / PRODUCTS.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const CITIES = {
 almaty: ['Академия ШАГ', 'в Алматы', 'Алматы'], astana: ['Академия ШАГ', 'в Астане', 'Астана'],
 karaganda: ['Академия ШАГ', 'в Караганде', 'Караганда'], shymkent: ['Академия ШАГ', 'в Шымкенте', 'Шымкент'],
 tashkent: ['IT STEP Academy', 'в Ташкенте', 'Ташкент'], samarkand: ['IT STEP Academy', 'в Самарканде', 'Самарканд'],
};
const SUFFIX = {
 'mka': ([brand, inCity]) => ` — ${brand} ${inCity}`,
 'rpo-ai': ([brand, , name]) => ` — ${brand}, ${name}`,
 'design-ai': ([brand, , name]) => ` + AI — ${brand}, ${name}`,
};

// Ключи кампаний Google (выгрузка 06.11.2026) → правило заголовка.
const KEYWORDS = {
 'mka': {
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
 },
 'rpo-ai': {
  'it курсы': 'it', 'айти курсы': 'it', 'ит курсы': 'it', 'курсы it': 'it', 'курсы по айти': 'it', 'it курсы в ташкенте': 'it',
  'vibe coding': 'vibe', 'вайб кодинг': 'vibe', 'вайбкодинг': 'vibe', 'курсы вайб кодинга': 'vibe', 'обучение вайб кодингу': 'vibe',
  'ии курсы': 'ai', 'курсы ai': 'ai', 'курсы ии': 'ai', 'курсы искусственного интеллекта': 'ai', 'курсы нейросетей': 'ai',
  'курсы по ии': 'ai', 'обучение искусственному интеллекту': 'ai',
  'python курсы': 'python', 'курсы пайтон': 'python', 'курсы по питону': 'python', 'курсы программирования python астана': 'python',
  'python с нуля': 'python', 'обучение python': 'python',
  'frontend разработчик курсы': 'web', 'full stack разработчик курсы': 'web', 'веб разработчик курсы': 'web', 'курсы backend': 'web',
  'курсы javascript': 'web', 'курсы js': 'web', 'курсы react': 'web', 'курсы веб программирования': 'web', 'курсы веб разработки алматы': 'web',
  'курсы по программированию': 'courses', 'курсы программирования': 'courses', 'программирование курсы': 'courses',
  'курсы программирования в алматы': 'courses', 'курсы программирования ташкент': 'courses', 'курсы программирования шымкент': 'courses',
  'курсы программиста': 'developer', 'курсы разработчика': 'developer', 'обучение на разработчика': 'developer',
  'где учиться на программиста': 'developer', 'обучение на программиста': 'developer', 'программист обучение': 'developer',
  'научиться программированию': 'learning', 'обучение программированию': 'learning', 'обучение программированию в ташкенте': 'learning',
  'курсы программирования для взрослых': 'adults', 'курсы программирования с нуля для взрослых': 'adults',
  'курсы программирования для начинающих': 'zero', 'курсы программирования с нуля': 'zero', 'обучение программированию с нуля': 'zero',
  'программирование с нуля': 'zero',
 },
 'design-ai': {
  'графический дизайн курсы для подростков': 'teens', 'курсы дизайна для подростков': 'teens', 'курсы дизайна для школьников': 'teens',
  'графический дизайн с нуля': 'zero', 'дизайн с нуля': 'zero', 'курсы графического дизайна с нуля': 'zero',
  'курсы figma': 'figma', 'adobe illustrator обучение': 'illustrator', 'illustrator курсы': 'illustrator', 'курсы иллюстратора': 'illustrator',
  'курсы photoshop': 'photoshop', 'курсы по фотошопу': 'photoshop', 'обучение фотошопу с нуля': 'photoshop',
  'курсы веб дизайна': 'web', 'курсы графического дизайна': 'courses', 'обучение графическому дизайну': 'learning', 'курсы дизайна': 'courses',
  'графический дизайнер обучение': 'profession', 'курсы дизайнера': 'profession', 'курсы дизайнера в астане': 'profession',
  'обучение дизайну': 'learning', 'обучение на графического дизайнера': 'profession',
  'как стать графическим дизайнером': 'profession', 'профессия графический дизайнер': 'profession',
 },
};
const COMPETITORS = ['kodland', 'кодленд', 'algoritmika', 'алгоритмика астана', 'robotek', 'роботек астана', 'kiberone', 'киберван',
 'jascode academy', 'жаскод', 'kursor school', 'курсор скул', 'impact academies астана', 'techspace school',
 'hexlet python', 'хекслет python', 'skillbox python', 'skillbox программирование', 'яндекс практикум python',
 'bang bang education графический дизайн', 'contented графический дизайн', 'geekbrains дизайн', 'id&me алматы', 'skillbox дизайн',
 'академия шаг программирование', 'it step курсы дизайна'];

const PAGES = [];
for (const city of Object.keys(CITIES)) for (const product of Object.keys(KEYWORDS)) {
 const dir = new URL(`../sites/${city}/${product}/`, import.meta.url);
 PAGES.push({city, product, dir, mod: await import(new URL('headline.js', dir)), lead: await import(new URL('lead.js', dir))});
}
const q = (term, campaign = 'x_search_core') => '?' + new URLSearchParams({utm_source: 'google', utm_campaign: campaign, utm_term: term});
const text = html => html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/‑ /g, '‑');

test('каждый ключ кампании получает свой заголовок на всех лендингах направления', () => {
 for (const {city, product, mod} of PAGES)
  for (const [term, expected] of Object.entries(KEYWORDS[product])) assert.equal(mod.pickHeadline(q(term))?.id ?? null, expected, `${city}/${product}: ${term}`);
});

test('конкуренты, бренды и кампании конкурентов: стандартный H1', () => {
 for (const {city, product, mod} of PAGES) {
  for (const term of COMPETITORS) assert.equal(mod.pickHeadline(q(term)), null, `${city}/${product}: ${term}`);
  assert.equal(mod.pickHeadline(q('курсы программирования', 'rpo_ai_ast_search_comp')), null);
  assert.equal(mod.pickHeadline(q('робототехника для детей', 'mka_ast_search_comp')), null);
 }
});

test('нет ключа или правила: стандартный H1', () => {
 for (const {mod} of PAGES) {
  assert.equal(mod.pickHeadline(''), null);
  assert.equal(mod.pickHeadline('?utm_source=google'), null);
  assert.equal(mod.pickHeadline(q('английский язык')), null);
  assert.equal(mod.pickHeadline(q('---autotargeting')), null);
 }
});

test('ключ нормализуется: регистр, ё, модификаторы соответствия', () => {
 const mka = PAGES.find(p => p.product === 'mka').mod;
 assert.equal(mka.pickHeadline(q('+Python +для +детей')).id, 'python');
 assert.equal(mka.pickHeadline(q('"[Курсы Робототехники]"')).id, 'robotics-courses');
 assert.equal(mka.pickHeadline(q('кружок для ребёнка')).id, 'clubs');
});

test('файл одинаков для направления во всех городах, кроме TITLE_SUFFIX; суффикс — бренд страны и город', () => {
 for (const product of Object.keys(KEYWORDS)) {
  const same = PAGES.filter(p => p.product === product).map(p => {
   assert.equal(p.mod.TITLE_SUFFIX, SUFFIX[product](CITIES[p.city]), `${p.city}/${product}`);
   return readFileSync(new URL('headline.js', p.dir), 'utf8').replace(/\r\n/g, '\n').replace(/^export const TITLE_SUFFIX = .*$/m, '');
  });
  assert.equal(new Set(same).size, 1, `${product}: headline.js разошёлся между городами`);
 }
});

test('заголовки: ключ дословно не вставляется, короткие, без возраста; id уникальны', () => {
 for (const {city, product, mod} of PAGES) {
  for (const h of mod.HEADLINES) {
   assert.ok(text(h.html).length <= (product === 'mka' ? 42 : 30), `${city}/${product}/${h.id}: ${text(h.html).length} знаков`);
   assert.doesNotMatch(text(h.html), /\d+\s*[–-]\s*\d+|\d+\+|лет/, `${h.id}: без возраста`);
   if (product === 'mka') assert.match(h.html, /^[^<]+ <span>[^<]+<\/span>$/, h.id);
  }
  assert.equal(new Set(mod.HEADLINES.map(h => h.id)).size, mod.HEADLINES.length);
 }
});

function fakeDoc(innerHTML, lockup) {
 const h1 = {innerHTML, querySelector: sel => (sel === '.hero-ai-lockup' && lockup ? {outerHTML: lockup} : null)};
 return {h1, title: 'исходный', getElementById: id => (id === 'hero-title' ? h1 : null), documentElement: {dataset: {}}};
}

test('подмена: H1 и title меняются у всех, у дизайна плашка «+ AI» остаётся; без правила ничего не меняется', () => {
 const page = (city, product) => PAGES.find(p => p.city === city && p.product === product).mod;

 let doc = fakeDoc('Малая компьютерная <span>академия ШАГ</span>');
 assert.equal(page('astana', 'mka').applyHeadline(doc, q('python для детей')), 'kw:python');
 assert.equal(doc.h1.innerHTML, 'Python <span>для детей</span>');
 assert.equal(doc.title, 'Python для детей — Академия ШАГ в Астане');

 doc = fakeDoc('AI-Native Developer');
 assert.equal(page('tashkent', 'rpo-ai').applyHeadline(doc, q('курсы python ташкент')), 'kw:python');
 assert.equal(doc.h1.innerHTML, 'Курсы Python с AI');
 assert.equal(doc.title, 'Курсы Python с AI — IT STEP Academy, Ташкент');

 const lockup = '<span class="hero-ai-lockup"><span class="hero-plus">+</span> <span class="ai-badge">AI</span></span>';
 doc = fakeDoc('Графический<br>дизайн ' + lockup, lockup);
 assert.equal(page('almaty', 'design-ai').applyHeadline(doc, q('курсы веб дизайна')), 'kw:web');
 assert.equal(doc.h1.innerHTML, 'Веб‑<br>дизайн ' + lockup);
 assert.equal(doc.title, 'Веб‑дизайн + AI — Академия ШАГ, Алматы');

 doc = fakeDoc('AI-Native Developer');
 assert.equal(page('astana', 'rpo-ai').applyHeadline(doc, q('skillbox python')), '');
 assert.equal(doc.h1.innerHTML, 'AI-Native Developer');
 assert.equal(doc.title, 'исходный');
});

test('метка заголовка уходит с заявкой со всех лендингов', () => {
 for (const {city, product, lead} of PAGES) {
  const loc = {href: `https://x.it-step.kz/${product}/` + q('курсы'), search: q('курсы')};
  const data = {name: 'Тест', phone: '+77001112233'};
  assert.equal(lead.buildPayload(data, loc, {documentElement: {dataset: {h1: 'kw:courses'}}}).h1, 'kw:courses', `${city}/${product}`);
  assert.equal('h1' in lead.buildPayload(data, loc, {documentElement: {dataset: {}}}), false);
  assert.equal('h1' in lead.buildPayload(data, loc, undefined), false);
 }
});

test('index.html: headline.js до app.js, H1 скрыт только на время подмены, id="hero-title" на месте', () => {
 for (const {city, product, dir} of PAGES) {
  const html = readFileSync(new URL('index.html', dir), 'utf8');
  const at = html.indexOf('src="headline.js"');
  assert.ok(at > 0 && at < html.indexOf('src="app.js"'), `${city}/${product}`);
  assert.match(html, /\.h1-wait #hero-title\{visibility:hidden\}/);
  assert.match(html, /classList\.remove\('h1-wait'\)\},1500\)/);
  assert.match(html, /<h1 id="hero-title">/, `${city}/${product}`);
  if (product === 'design-ai') assert.match(html, /<h1 id="hero-title">[^]*?class="hero-ai-lockup"[^]*?<\/h1>/, `${city}/${product}: плашка AI в H1`);
 }
});
