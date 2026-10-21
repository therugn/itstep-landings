/** Кнопка WhatsApp: все ссылки `a[data-whatsapp]` ведут в чат с номером города в Wazzup (первым отвечает ЕЦПЗ).
 *  В конец первого сообщения дописывается адрес страницы с utm-метками: по нему сквозная аналитика (конекторы/analytics,
 *  wazzup_parse.LANDING) относит диалог к лендингу и кампании. Адрес не в начале текста — иначе Wazzup его не разберёт.
 *  gclid и токен страницы «Спасибо» в текст не кладём: длинно, клиент стирает. Номер — канал Wazzup города, не телефон филиала.
 *  Меняется только строка WHATSAPP; остальное одинаково на всех лендингах (проверяет tests/whatsapp.test.mjs). */
import {fireWhatsAppClick} from './conversion.js';

export const WHATSAPP = {phone: '77059921014', text: 'Здравствуйте! Хочу узнать о Малой компьютерной академии ШАГ.'};
const KEEP = /^utm_[a-z_]+$/;

/** Адрес страницы продукта для сообщения: без «Спасибо», только utm-метки, со слэшем на конце. */
export function landingPage(loc = globalThis.location) {
 let path = loc.pathname.replace(/\/spasibo\/?$/, '/');
 if (!path.endsWith('/')) path += '/';
 const params = new URLSearchParams();
 new URLSearchParams(loc.search).forEach((value, key) => { if (KEEP.test(key)) params.append(key, value); });
 const query = params.toString();
 return loc.origin + path + (query ? '?' + query : '');
}

export function buildWhatsAppUrl(loc = globalThis.location, config = WHATSAPP) {
 return `https://wa.me/${config.phone}?text=${encodeURIComponent(`${config.text} Пишу с сайта: ${landingPage(loc)}`)}`;
}

if (typeof document !== 'undefined') {
 document.querySelectorAll('a[data-whatsapp]').forEach(link => {
  link.href = buildWhatsAppUrl();
  link.target = '_blank';
  link.rel = 'noopener';
  link.addEventListener('click', () => fireWhatsAppClick());
 });
}
