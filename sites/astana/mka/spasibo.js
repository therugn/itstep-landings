import {fireConversions} from './conversion.js';

const CONFIRM_URL = 'https://api.it-step.kz/lead/confirm?t=';
const TEXTS = {
 ok: ['Заявка принята', 'Академия свяжется с вами в ближайшее время.'],
 used: ['Заявка уже принята', 'Эта страница уже открывалась. Мы получили вашу заявку и свяжемся с вами.'],
 none: ['Заявка не найдена', 'Откройте сайт и отправьте заявку заново или позвоните в академию: +7 (705) 957-51-50.'],
 error: ['Не удалось проверить заявку', 'Если вы только что отправили форму, мы её получили. Для уверенности позвоните: +7 (705) 957-51-50.']
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

if (typeof document !== 'undefined' && document.getElementById('title')) {
 const token = new URLSearchParams(location.search).get('t') || '';
 confirmThanks(token).then(state => {
  const [title, text] = TEXTS[state];
  document.getElementById('title').textContent = title;
  document.getElementById('text').textContent = text;
 });
}
