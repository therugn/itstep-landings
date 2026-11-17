/**
 * Маска телефона для всех форм лендинга. Файл одинаков на всех лендингах (tests/phone.test.mjs).
 * Страна — по плейсхолдеру поля: «+998…» — Узбекистан, иначе Казахстан.
 * Понимает любое начало: +7 / 7 / 8 / сразу 705 (КЗ), +998 / 998 / 8 / сразу 90 (УЗ); вставку и автозаполнение.
 * Приводит к виду +7 (705) 123-45-67 / +998 (90) 123-45-67 — так номер и уходит в приёмщик.
 */
export const COUNTRIES = {
 KZ: {code: '7', len: 10, groups: [3, 3, 2, 2]},
 UZ: {code: '998', len: 9, groups: [2, 3, 2, 2]},
};

export const countryOf = input => /^\s*\+?998/.test(input?.placeholder || '') ? 'UZ' : 'KZ';

/**
 * Цифры номера без кода страны, не больше положенного. Неоднозначное начало решается, когда цифр стало больше нормы:
 * поле показывает номер полностью, поэтому лишняя цифра всегда видна в сыром значении в момент ввода.
 */
export function nationalDigits(raw, cc) {
 const c = COUNTRIES[cc];
 const s = String(raw || '').trim();
 let d = s.replace(/\D/g, '');
 if (s.startsWith('+') ? d.startsWith(c.code) : d.length > c.len && d.startsWith(c.code)) d = d.slice(c.code.length);
 if (cc === 'KZ') {
  // Номера Казахстана начинаются с 7, поэтому 8 в начале — всегда лишняя «восьмёрка».
  if (d[0] === '8') d = d.slice(1);
  // 11 цифр: «77…» — код 7 набран ещё раз (7 705…, 7 777…), иначе лишняя цифра в конце.
  if (d.length > c.len && d.startsWith('77')) d = d.slice(1);
 } else {
  if (d.length > c.len && d.startsWith(c.code)) d = d.slice(c.code.length);          // 998 набран ещё раз
  // Есть код оператора 88: «88…» из 9 цифр — номер, «8 88…» из 10 — лишняя 8; «8 9…», «8 33…» — лишняя сразу.
  if (d[0] === '8' && ((d.length > 1 && d[1] !== '8') || d.length > c.len)) d = d.slice(1);
 }
 return d.slice(0, c.len);
}

/** +7 (705) 123-45-67 — по мере набора; пустой номер — только префикс. */
export function formatPhone(national, cc) {
 const c = COUNTRIES[cc];
 const [a, b, e, f] = c.groups;
 const d = national.slice(0, c.len);
 let s = `+${c.code} `;
 if (!d) return s;
 s += `(${d.slice(0, a)}`;
 if (d.length > a) s += `) ${d.slice(a, a + b)}`;
 if (d.length > a + b) s += `-${d.slice(a + b, a + b + e)}`;
 if (d.length > a + b + e) s += `-${d.slice(a + b + e, a + b + e + f)}`;
 return s;
}

const SELECTOR = 'input[name="phone"]';
const prev = new WeakMap();

function apply(input, final) {
 const cc = countryOf(input);
 const nat = nationalDigits(input.value, cc);
 const value = final && !nat ? '' : formatPhone(nat, cc);
 if (input.value !== value) input.value = value;
 prev.set(input, value);
}

function onInput(event) {
 const input = event.target;
 if (!input.matches?.(SELECTOR)) return;
 const atEnd = input.selectionStart === input.value.length;
 if (!atEnd && event.inputType && event.inputType !== 'insertFromPaste') return;      // правка в середине — разберём при уходе с поля
 const old = prev.get(input) || '';
 // Стёрли скобку, пробел или дефис — стираем и цифру перед ним, иначе маска вернёт знак и Backspace «застрянет».
 if (event.inputType === 'deleteContentBackward' && input.value.replace(/\D/g, '') === old.replace(/\D/g, '') && input.value.length < old.length) {
  input.value = input.value.replace(/\d(\D*)$/, '$1');
 }
 apply(input, false);
}

export function attachPhoneMask(doc = globalThis.document) {
 if (!doc?.addEventListener) return;
 doc.addEventListener('focusin', event => {
  const input = event.target;
  if (!input.matches?.(SELECTOR) || input.value) return;
  apply(input, false);
  try { input.setSelectionRange(input.value.length, input.value.length); } catch {}
 });
 doc.addEventListener('input', onInput);
 doc.addEventListener('focusout', event => { if (event.target.matches?.(SELECTOR)) apply(event.target, true); });
 // Отправка по Enter не снимает фокус — приводим номер к итоговому виду до проверки формы.
 doc.addEventListener('submit', event => event.target.querySelectorAll?.(SELECTOR).forEach(input => apply(input, true)), true);
}

attachPhoneMask();
