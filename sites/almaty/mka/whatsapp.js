/** Плавающая кнопка WhatsApp: ссылка `a[data-whatsapp]` ведёт в чат с номером города в Wazzup (первым отвечает ЕЦПЗ).
 *  В конец первого сообщения дописывается адрес страницы (хост и путь, без меток): по нему сквозная аналитика
 *  (конекторы/analytics, wazzup_parse.LANDING) относит диалог к лендингу. Адрес не в начале текста — иначе Wazzup его не разберёт.
 *  Номер — канал Wazzup города, не телефон филиала. Меняется только строка WHATSAPP; остальное одинаково на всех лендингах
 *  (проверяет tests/whatsapp.test.mjs). */
import {fireWhatsAppClick} from './conversion.js';

export const WHATSAPP = {phone: '77059921014', text: 'Здравствуйте! Хочу узнать о Малой компьютерной академии ШАГ.'};

/** Адрес страницы продукта для сообщения: хост и путь без «Спасибо», схемы, меток и слэша на конце. */
export function landingPage(loc = globalThis.location) {
 return loc.host + loc.pathname.replace(/\/spasibo\/?$/, '/').replace(/\/+$/, '');
}

export function buildWhatsAppUrl(loc = globalThis.location, config = WHATSAPP) {
 return `https://wa.me/${config.phone}?text=${encodeURIComponent(`${config.text} Пишу с сайта ${landingPage(loc)}`)}`;
}

if (typeof document !== 'undefined') {
 document.querySelectorAll('a[data-whatsapp]').forEach(link => {
  link.href = buildWhatsAppUrl();
  link.target = '_blank';
  link.rel = 'noopener';
  link.addEventListener('click', () => fireWhatsAppClick());
 });
}
