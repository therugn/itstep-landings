/** Плавающая кнопка Telegram (Узбекистан: филиал ведёт клиентов в Telegram, решение Ильи 04.11.2026).
 *  Ссылка `a[data-telegram]` открывает чат Ташкента t.me/<username> с готовым текстом; в конце текста адрес страницы
 *  с кодом клика: tashkent.stepacademy.uz/mka/k7f3. Тот же код вместе с метками рекламы уходит в приёмщик заявок
 *  (тот же /wa/click, что у WhatsApp), и по коду из первого сообщения находится кампания.
 *  Меняется только строка TELEGRAM (tests/telegram.test.mjs). */
import {fireWhatsAppClick} from './conversion.js';

export const TELEGRAM = {username: 'itstep_tg_manager', text: 'Здравствуйте! Хочу узнать о курсе «Вайбкодинг».'};
export const CLICK_ENDPOINT = 'https://api.it-step.kz/wa/click';   // приёмщик заявок: запись клика (код, страница, метки)
const TRACKING = /^(utm_[a-z_]+|gclid|yclid|fbclid)$/;
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';               // без 0/1/i/l/o: код читают глазами

/** Код клика: 4 знака, новый на каждую загрузку страницы. */
export function newCode() {
 const bytes = new Uint8Array(4);
 crypto.getRandomValues(bytes);
 return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}

/** Адрес страницы продукта для сообщения: хост и путь без «Спасибо», схемы, меток и слэша на конце. */
export function landingPage(loc = globalThis.location) {
 return loc.host + loc.pathname.replace(/\/spasibo\/?$/, '/').replace(/\/+$/, '');
}

export function buildTelegramUrl(loc = globalThis.location, config = TELEGRAM, code = '') {
 const page = landingPage(loc) + (code ? '/' + code : '');
 return `https://t.me/${config.username}?text=${encodeURIComponent(`${config.text} Пишу с сайта ${page}`)}`;
}

/** Запись о клике для приёмщика: код, страница без меток, метки рекламы из адреса. Без персональных данных. */
export function clickPayload(loc = globalThis.location, code) {
 const payload = {code, page: loc.origin + loc.pathname};
 new URLSearchParams(loc.search).forEach((value, key) => { if (TRACKING.test(key)) payload[key] = value; });
 return payload;
}

/** keepalive и text/plain: запрос уходит без preflight и доживает переход в Telegram; сбой сети не мешает клику. */
export async function reportClick(payload, transport = fetch, endpoint = CLICK_ENDPOINT) {
 try {
  const response = await transport(endpoint, {method: 'POST', keepalive: true, headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(payload)});
  return Boolean(response && response.ok);
 } catch {
  return false;
 }
}

if (typeof document !== 'undefined') {
 const code = newCode();
 document.querySelectorAll('a[data-telegram]').forEach(link => {
  link.href = buildTelegramUrl(globalThis.location, TELEGRAM, code);
  link.target = '_blank';
  link.rel = 'noopener';
  link.addEventListener('click', () => { reportClick(clickPayload(globalThis.location, code)); fireWhatsAppClick(); });
 });
}
