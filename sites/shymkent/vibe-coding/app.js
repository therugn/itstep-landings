import {submitLead, validateLead} from './lead.js';

/** Bind the two approved trial forms to the shared lead receiver. */
export function bindForms(doc = globalThis.document, loc = globalThis.location) {
 for (const form of doc.querySelectorAll('.trial-fields')) {
  let submitting = false;
  const fields = form.elements;
  const feedback = form.querySelector('.form-feedback');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('input', event => {
   event.target.setCustomValidity?.('');
   feedback.hidden = true;
  });
  form.addEventListener('change', event => {
   event.target.setCustomValidity?.('');
   feedback.hidden = true;
  });
  form.addEventListener('submit', async event => {
   event.preventDefault();
   if (submitting) return;
   feedback.hidden = true;
   for (const field of ['name', 'phone', 'consent']) fields[field].setCustomValidity('');
   const data = {name: fields.name.value, phone: fields.phone.value,
    consent: fields.consent.checked, website: fields.website.value};
   const errors = validateLead(data);
   for (const [name, message] of Object.entries(errors)) fields[name].setCustomValidity(message);
   if (!form.reportValidity()) return;
   submitting = true;
   const label = button.textContent;
   button.disabled = true;
   button.setAttribute('aria-busy', 'true');
   button.textContent = 'Отправляем…';
   try {
    const result = await submitLead(data);
    if (result.ok && result.thanks) {
     loc.assign(new URL('spasibo/?t=' + encodeURIComponent(result.thanks), doc.baseURI));
     return;
    }
    feedback.textContent = result.ok ? 'Сервис не подтвердил заявку. Попробуйте ещё раз или позвоните в Академию.' : result.message;
    feedback.hidden = false;
   } finally {
    submitting = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = label;
   }
  });
 }
}

if (typeof document !== 'undefined') bindForms();
