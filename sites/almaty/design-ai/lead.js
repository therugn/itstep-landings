/** Приёмщик заявок (репозиторий itstep-leads): CRM + журнал + Telegram. Пустая строка = демо-режим формы. */
export const LEAD_ENDPOINT = 'https://api.it-step.kz/lead';
export const PRODUCT = 'Дизайн + AI';
const TRACKING = /^(utm_[a-z_]+|gclid|yclid|fbclid)$/;

/** Тело запроса приёмщику: поля формы + метки рекламы из адреса страницы. */
export function buildPayload(data, loc = globalThis.location) {
 const payload = {name:data.name.trim(), phone:data.phone.trim(), email:data.email?.trim() || '', product:PRODUCT,
  page_url:loc.href.split('#')[0], website:data.website || ''};
 if (data.ageLabel) payload.answer_age = data.ageLabel;
 new URLSearchParams(loc.search).forEach((value, key) => { if (TRACKING.test(key)) payload[key] = value; });
 return payload;
}
export function validateLead(data) {
 const errors = {};
 if (!data.name?.trim() || data.name.trim().length < 2) errors.name = 'Введите имя — не менее двух букв.';
 const phone = (data.phone || '').replace(/\D/g, '');
 if (!/^[78]\d{10}$/.test(phone)) errors.phone = 'Введите телефон: +7 и ещё 10 цифр.';
 if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Проверьте адрес электронной почты.';
 if (!data.consent) errors.consent = 'Для заявки необходимо согласие на обработку данных.';
 return errors;
}
export async function submitLead(data, endpoint = LEAD_ENDPOINT, transport = fetch) {
 if (!endpoint) return {ok:false,code:'unconfigured',message:'Это демонстрационная форма. Заявка не отправлена: приём заявок пока не подключён. Позвоните в академию: +7 (705) 957-51-50.'};
 try {
  const response=await transport(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(buildPayload(data)),signal:AbortSignal.timeout(15000)});
  if (!response.ok) return {ok:false,code:'server',message:'Сервис не принял заявку. Попробуйте позже или позвоните в академию.'};
  const result=await response.json();
  if (result.ok !== true) return {ok:false,code:'rejected',message:'Приём заявки не подтверждён. Ваши данные сохранены в полях — попробуйте ещё раз.'};
  return {ok:true,thanks:result.thanks || '',message:'Заявка принята. Академия свяжется с вами.'};
 } catch {return {ok:false,code:'network',message:'Не удалось связаться с сервисом. Данные остались в форме. Проверьте соединение или позвоните в академию.'};}
}
