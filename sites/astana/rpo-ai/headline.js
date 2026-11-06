/** Заголовок первого экрана под ключевое слово из поиска. Google и Яндекс передают ключ из кабинета в utm_term
 *  ({keyword}); по нему выбираем заранее написанный заголовок из HEADLINES. Сам ключ на страницу не попадает никогда.
 *  Заголовок первого экрана заменяется целиком, подзаголовок остаётся.
 *  Подмены нет: у кампании конкурентов (utm_campaign с _comp), у ключа с брендом конкурента или нашим брендом,
 *  у ключа без правила — там остаётся стандартный H1 из index.html.
 *  Подмену видят все посетители (тест 50/50 снят 06.11.2026). Метка правила («kw:python») уходит с заявкой
 *  в приёмщик полем h1 (lead.js). Пока в <html> есть класс h1-wait, заголовок скрыт (index.html).
 *  Файл одинаков для направления во всех городах, кроме TITLE_SUFFIX (tests/headline.test.mjs). */

// Порядок важен: срабатывает первое совпадение. Неразрывный дефис (U+2011) в «3D‑», «IT‑»: на телефоне не рвёт строку. Ключ приведён к нижнему регистру, «ё» → «е».
export const HEADLINES = [
 {id: 'vibe', test: /вайб|vibe/, html: 'Курсы вайб‑кодинга'},
 {id: 'python', test: /python|питон|пайтон/, html: 'Курсы Python с AI'},
 {id: 'web', test: /веб|web|frontend|backend|фронтенд|бэкенд|full ?stack|javascript|(^|\s)js(\s|$)|react/, html: 'Веб‑разработка с AI'},
 {id: 'ai', test: /(^|\s)(ии|ai)(\s|$)|искусствен|нейросет/, html: 'Программирование с AI'},
 {id: 'adults', test: /взросл/, html: 'Программирование для взрослых'},
 {id: 'zero', test: /с нуля|начинающ/, html: 'Программирование с нуля'},
 {id: 'developer', test: /программист|разработчик/, html: 'Обучение на программиста'},
 {id: 'learning', test: /(обучен|науч|учит).*программир/, html: 'Обучение программированию'},
 {id: 'courses', test: /программир/, html: 'Курсы программирования'},
 {id: 'it', test: /(^|\s)(it|ит)(\s|$)|айти|it-|ит-/, html: 'IT‑курсы с AI'},
];

export const TITLE_SUFFIX = ' — Академия ШАГ, Астана';

// Бренды конкурентов и наш: такие ключи всегда ведут на стандартный H1.
const BRANDS = /kodland|кодленд|algoritmika|алгоритмик|robotek|роботек|kiber|кибер|jascode|жаскод|kursor|курсор|impact|импакт|techspace|техспейс|skillbox|скилбокс|geekbrains|гикбрейнс|hexlet|хекслет|практикум|praktikum|яндекс|yandex|contented|контентед|bang bang|id&me|шаг|step/;
const COMPETITOR_CAMPAIGN = /(^|_)comp(_|$)/;

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

/** Подменяет H1 и title; возвращает метку для заявки («kw:python») или ''. */
export function applyHeadline(doc, search) {
 const rule = pickHeadline(search);
 if (!rule) return '';
 const h1 = doc.getElementById('hero-title');
 if (h1) {
  const lockup = h1.querySelector?.('.hero-ai-lockup');
  h1.innerHTML = rule.html + (lockup ? ' ' + lockup.outerHTML : '');
  h1.classList?.add('h1-kw');
 }
 doc.title = rule.html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/‑ /g, '‑') + TITLE_SUFFIX;
 return `kw:${rule.id}`;
}

if (typeof document !== 'undefined') {
 try {
  const label = applyHeadline(document, globalThis.location.search);
  if (label) document.documentElement.dataset.h1 = label;
 } finally {
  document.documentElement.classList.remove('h1-wait');
 }
}
