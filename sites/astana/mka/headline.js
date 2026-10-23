/** Заголовок первого экрана под ключевое слово из поиска. Google и Яндекс передают ключ из кабинета в utm_term
 *  ({keyword}); по нему выбираем заранее написанный заголовок из HEADLINES. Сам ключ на страницу не попадает никогда.
 *  Подмены нет: у кампании конкурентов (utm_campaign с _comp), у ключа с брендом конкурента или нашим брендом,
 *  у ключа без правила — там остаётся стандартный H1 из index.html.
 *  Тест 50/50: половина посетителей с подходящим ключом видит стандартный H1. Вариант («kw:python» или «base:python»)
 *  уходит с заявкой в приёмщик полем h1 (lead.js). Пока в <html> есть класс h1-wait, заголовок скрыт (index.html). */

// Порядок важен: срабатывает первое совпадение. В «3D‑», «IT‑» неразрывный дефис (U+2011): на телефоне не рвёт строку. Ключ приведён к нижнему регистру, «ё» → «е».
export const HEADLINES = [
 {id: 'robotics-courses', test: /(курс|кружок|кружк|секци).*робот|робот.*(курс|кружок|кружк|секци)/, html: 'Курсы робототехники <span>для детей</span>'},
 {id: 'robotics', test: /робот|lego|лего|mindstorms/, html: 'Робототехника <span>для детей</span>'},
 {id: '3d-courses', test: /(курс|обучен).*(3d|3д)/, html: 'Курсы 3D‑моделирования <span>для детей</span>'},
 {id: '3d', test: /3d|3д|моделир/, html: '3D‑моделирование <span>для детей</span>'},
 {id: 'games', test: /игр/, html: 'Создание игр <span>для детей</span>'},
 {id: 'python', test: /python|питон|пайтон/, html: 'Python <span>для детей 9–14 лет</span>'},
 {id: 'scratch', test: /scratch|скретч/, html: 'Scratch <span>для детей 7–8 лет</span>'},
 {id: 'teens', test: /подрост/, html: 'IT‑курсы <span>для подростков</span>'},
 {id: 'programming-courses', test: /курс.*программ/, html: 'Курсы программирования <span>для детей</span>'},
 {id: 'programming', test: /программир/, html: 'Программирование <span>для детей</span>'},
 {id: 'it', test: /(^|\s)(it|ит)(\s|$)|айти|it-|ит-/, html: 'IT‑курсы <span>для детей 7–14 лет</span>'},
 {id: 'clubs', test: /кружок|кружк/, html: 'IT‑кружки <span>для детей 7–14 лет</span>'},
];

// Бренды конкурентов и наш: такие ключи всегда ведут на стандартный H1.
const BRANDS = /kodland|кодленд|algoritmika|алгоритмик|robotek|роботек|kiber|кибер|jascode|жаскод|kursor|курсор|impact|импакт|techspace|техспейс|шаг|step/;
const COMPETITOR_CAMPAIGN = /(^|_)comp(_|$)/;
export const STORAGE_KEY = 'h1_ab';

export function normalize(term) {
 return String(term || '').toLowerCase().replace(/ё/g, 'е').replace(/[+"'[\]]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Правило заголовка для адреса страницы или null, если H1 остаётся стандартным. */
export function pickHeadline(search) {
 const params = new URLSearchParams(search);
 const term = normalize(params.get('utm_term'));
 if (!term || BRANDS.test(term) || COMPETITOR_CAMPAIGN.test(params.get('utm_campaign') || '')) return null;
 return HEADLINES.find(h => h.test.test(term)) || null;
}

/** Вариант теста: один раз на посетителя (localStorage), без хранилища — случайно на каждую загрузку. */
export function abVariant(storage = globalThis.localStorage, random = Math.random) {
 try {
  const saved = storage.getItem(STORAGE_KEY);
  if (saved === 'kw' || saved === 'base') return saved;
  const variant = random() < 0.5 ? 'kw' : 'base';
  storage.setItem(STORAGE_KEY, variant);
  return variant;
 } catch {
  return random() < 0.5 ? 'kw' : 'base';
 }
}

/** Подменяет H1 и title; возвращает метку для заявки («kw:python», «base:python») или ''. */
export function applyHeadline(doc, search, variant) {
 const rule = pickHeadline(search);
 if (!rule) return '';
 if (variant === 'kw') {
  const h1 = doc.getElementById('hero-title');
  if (h1) h1.innerHTML = rule.html;
  doc.title = rule.html.replace(/<[^>]+>/g, '') + ' — Академия ШАГ в Астане';
 }
 return `${variant}:${rule.id}`;
}

if (typeof document !== 'undefined') {
 try {
  const label = applyHeadline(document, globalThis.location.search, abVariant());
  if (label) document.documentElement.dataset.h1 = label;
 } finally {
  document.documentElement.classList.remove('h1-wait');
 }
}
