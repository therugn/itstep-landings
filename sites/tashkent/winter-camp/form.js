// Заявка уходит в приёмщик (lead.js): CRM филиала + журнал + Telegram; после подтверждения — страница «Спасибо».
import {validateLead, submitLead} from './lead.js';

for (const form of document.querySelectorAll('.booking-form')) {
  const name = form.elements.namedItem('name');
  const phone = form.elements.namedItem('phone');
  const consent = form.elements.namedItem('consent');
  const status = form.querySelector('.booking-feedback');
  const submit = form.querySelector('[type=submit]');

  form.addEventListener('input', () => {
    for (const field of [name, phone, consent]) field.setCustomValidity('');
    status.hidden = true;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = {name: name.value, phone: phone.value, consent: consent.checked, website: ''};
    const errors = validateLead(data);
    name.setCustomValidity(errors.name || '');
    phone.setCustomValidity(errors.phone || '');
    consent.setCustomValidity(errors.consent || '');
    if (!form.reportValidity()) return;
    submit.disabled = true;
    status.textContent = 'Отправляем заявку…';
    status.hidden = false;
    const result = await submitLead(data);
    submit.disabled = false;
    status.textContent = result.message;
    if (result.ok && result.thanks) {
      location.assign(new URL('spasibo/?t=' + encodeURIComponent(result.thanks), document.baseURI));
    }
  });
}
