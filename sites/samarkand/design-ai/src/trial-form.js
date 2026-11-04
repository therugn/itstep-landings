import {submitLead, validateLead} from '../lead.js';
export const validateTrialLead = validateLead;
export function initTrialForms(root=document){
 for(const form of root.querySelectorAll('.trial-form')){
  if(form.dataset.initialized==='true')continue;
  form.dataset.initialized='true';
  const submit=form.querySelector('[type="submit"]');submit.disabled=false;
  let pending=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(pending)return;
   const fields=Object.fromEntries(['name','phone','consent'].map(name=>[name,form.querySelector(`[name="${name}"]`)]));
   const data={name:fields.name.value,phone:fields.phone.value,consent:fields.consent.checked,website:form.elements.website?.value||''};
   const errors=validateLead(data),status=form.querySelector('.form-status');status.textContent='';
   for(const[name,field]of Object.entries(fields)){form.querySelector(`[data-error="${name}"]`).textContent=errors[name]||'';field.setAttribute('aria-invalid',String(Boolean(errors[name])));}
   const first=Object.keys(errors)[0];if(first){fields[first].focus();return;}
   pending=true;const label=submit.textContent;submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='Отправляем…';
   const result=await submitLead(data);
   if(result.ok&&result.thanks){location.assign(new URL('spasibo/?t='+encodeURIComponent(result.thanks),document.baseURI));return;}
   pending=false;submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent=label;
   status.textContent=result.message||'Не удалось подтвердить заявку. Попробуйте ещё раз.';status.focus({preventScroll:true});
  });
  form.addEventListener('input',event=>{const error=form.querySelector(`[data-error="${event.target.name}"]`);if(error){error.textContent='';event.target.removeAttribute('aria-invalid');}form.querySelector('.form-status').textContent='';});
 }
}
