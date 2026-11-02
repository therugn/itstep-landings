import {fireConversions} from './conversion.js';
import {startConfetti} from './confetti.js';

const CONFIRM_URL = 'https://api.it-step.kz/lead/confirm?t=';
const PHONE = '+7 (771) 083‑33‑83';   // неразрывно, чтобы номер не рвался при переносе строки
export const TEXTS = {
 ok: ['Малая компьютерная академия · Шымкент', 'Ура, <mark>заявка принята</mark>!', 'Мы уже получили вашу заявку и скоро свяжемся, чтобы записать на пробный урок.'],
 used: ['Всё в порядке', 'Заявка <mark>уже у нас</mark>', 'Эта страница уже открывалась, повторно отправлять заявку не нужно. Мы свяжемся с вами.'],
 none: ['Что-то пошло не так', 'Не нашли <mark>вашу заявку</mark>', 'Откройте сайт и отправьте форму ещё раз или позвоните в академию: ' + PHONE + '.'],
 error: ['Проверка не удалась', 'Не удалось <mark>проверить заявку</mark>', 'Если вы только что отправили форму, мы её получили. Для уверенности позвоните: ' + PHONE + '.']
};

/** Возвращает 'ok' | 'used' | 'none' | 'error'; конверсии запускаются только при 'ok'. */
export async function confirmThanks(token, {transport = fetch, win = globalThis.window} = {}) {
 if (!token) return 'none';
 try {
  const response = await transport(CONFIRM_URL + encodeURIComponent(token));
  const result = await response.json();
  if (result.ok === true) { fireConversions(win); return 'ok'; }
  return result.reason === 'used' ? 'used' : 'none';
 } catch { return 'error'; }
}

export function render(state, doc = globalThis.document) {
 const [eyebrow, title, text] = TEXTS[state];
 doc.body.dataset.state = state;
 doc.getElementById('eyebrow').textContent = eyebrow;
 doc.getElementById('title').innerHTML = title;            // разметка только из констант выше
 doc.getElementById('text').textContent = text;
 doc.title = state === 'ok' ? 'Заявка принята — Малая компьютерная академия | Академия ШАГ, Шымкент' : 'Малая компьютерная академия | Академия ШАГ, Шымкент';
}

if (typeof document !== 'undefined' && document.getElementById('title')) {
 const token = new URLSearchParams(location.search).get('t') || '';
 confirmThanks(token).then(state => {
  render(state);
  if (state === 'ok') startConfetti(document.getElementById('confetti'));
 });
}
