import {getSchedule} from './schedule.mjs?v=20261103';
import {validateLead,submitLead} from './lead.js';

let shift = 'afternoon';
let group = 1;
const list = document.querySelector('#schedule-list');
const panel = document.querySelector('#schedule-panel');
const announcement = document.querySelector('#schedule-announcement');

function updateSchedule(announce = true) {
 const schedule = getSchedule(shift,group);
 list.replaceChildren(...schedule.items.map(({time,activity})=>{
  const row = document.createElement('li');
  const clock = document.createElement('span');
  clock.className = 'time';
  clock.textContent = time;
  const text = document.createElement('span');
  text.textContent = activity;
  row.append(clock,text);
  return row;
 }));
 list.classList.toggle('morning',shift==='morning');
 panel.setAttribute('aria-labelledby',`shift-${shift} group-${group}`);
 document.querySelectorAll('[data-shift]').forEach(button=>{
  const selected = button.dataset.shift === shift;
  button.setAttribute('aria-selected',String(selected));
  button.tabIndex = selected ? 0 : -1;
 });
 document.querySelectorAll('[data-group]').forEach(button=>{
  const selected = Number(button.dataset.group) === group;
  button.setAttribute('aria-selected',String(selected));
  button.tabIndex = selected ? 0 : -1;
 });
 if(announce) announcement.textContent = `${schedule.className}, ${schedule.hours}`;
}

for(const tablist of document.querySelectorAll('.schedule-controls [role=tablist]')) {
 const buttons = [...tablist.querySelectorAll('[role=tab]')];
 function select(button) {
  if(button.dataset.shift) shift = button.dataset.shift;
  else group = Number(button.dataset.group);
  updateSchedule();
 }
 tablist.addEventListener('click',event=>{
  const button = event.target.closest('[role=tab]');
  if(button) select(button);
 });
 tablist.addEventListener('keydown',event=>{
  const index = buttons.indexOf(document.activeElement);
  if(index<0) return;
  let next;
  if(event.key==='ArrowRight') next = (index+1)%buttons.length;
  if(event.key==='ArrowLeft') next = (index-1+buttons.length)%buttons.length;
  if(event.key==='Home') next = 0;
  if(event.key==='End') next = buttons.length-1;
  if(next===undefined) return;
  event.preventDefault();
  buttons[next].focus();select(buttons[next]);
 });
}
updateSchedule(false);

const dialog = document.querySelector('#info-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogBody = document.querySelector('#dialog-body');
let returnFocus;
function showInfo(title,paragraphs) {
 returnFocus = document.activeElement;
 dialogTitle.textContent = title;
 dialogBody.replaceChildren(...paragraphs.map(text=>{
  const p = document.createElement('p');p.textContent = text;return p;
 }));
 if(!dialog.open) dialog.showModal();
 document.body.classList.add('modal-open');
}
function showContacts() {
 showInfo('Контакты',["г. Караганда, ул. Ержанова, 18/5", "+7 (777) 555-59-95", "Приёмная комиссия: Пн–Сб 09:30–19:00; Вс 10:00–18:00", "welcome@itstep.org"]);
}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',showContacts));
dialog.addEventListener('close',()=>{
 document.body.classList.remove('modal-open');
 if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
});
dialog.addEventListener('click',event=>{
 if(event.target!==dialog) return;
 const bounds=dialog.getBoundingClientRect();
 if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) dialog.close();
});

// Заявка уходит в приёмщик (lead.js): CRM филиала + журнал + Telegram; после подтверждения — страница «Спасибо».
document.querySelectorAll('.consultation-form').forEach(form=>{
const phone = form.querySelector('[name=phone]');
const parentName = form.querySelector('[name=parentName]');
const consent = form.querySelector('[name=consent]');
const status = form.querySelector('.form-status');
const submit = form.querySelector('[type=submit]');
phone.addEventListener('input',()=>phone.setCustomValidity(''));
parentName.addEventListener('input',()=>parentName.setCustomValidity(''));
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const data = {name:parentName.value, phone:phone.value, consent:consent.checked, website:form.elements.website?.value||''};
 const errors = validateLead(data);
 parentName.setCustomValidity(errors.name||'');
 phone.setCustomValidity(errors.phone||'');
 consent.setCustomValidity(errors.consent||'');
 if(!form.reportValidity()) return;
 submit.disabled = true;
 status.className = 'form-status';
 status.textContent = 'Отправляем заявку…';
 const result = await submitLead(data);
 submit.disabled = false;
 status.textContent = result.message;
 if(result.ok) status.classList.add('success');
 if(result.ok && result.thanks){location.assign(new URL('spasibo/?t='+encodeURIComponent(result.thanks),document.baseURI));return;}
 status.focus({preventScroll:true});
});
});

// Keep transport controls in the visible card and move focus to the equivalent control.
const transportDeck = document.querySelector('.transport-deck');
if (transportDeck) {
 const cards = [...transportDeck.querySelectorAll('[data-transport-card]')];
 let activeTransport = 0;
 let pointerStart = null;
 function moveTransport(step, focusControl = false) {
  const next = Math.max(0,Math.min(cards.length-1,activeTransport+step));
  if (next === activeTransport) return;
  activeTransport = next;
  cards.forEach((card,index)=>{card.hidden=index!==next;});
  const current = cards[next];
  document.querySelector('#transport-announcement').textContent = current.querySelector('h3').textContent;
  if (focusControl) current.querySelector(`[data-transport-step="${-step}"]`).focus({preventScroll:true});
 }
 transportDeck.addEventListener('click',event=>{
  const control = event.target.closest('[data-transport-step]');
  if (control && !control.disabled) moveTransport(Number(control.dataset.transportStep),true);
 });
 transportDeck.addEventListener('pointerdown',event=>{
  pointerStart = null;
  if (event.isPrimary === false || event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
  pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId};
 });
 transportDeck.addEventListener('pointerup',event=>{
  if (!pointerStart || event.pointerId !== pointerStart.id) return;
  const dx = event.clientX-pointerStart.x;
  const dy = event.clientY-pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)*1.5) moveTransport(dx < 0 ? 1 : -1);
 });
 transportDeck.addEventListener('pointercancel',()=>{pointerStart=null;});
}
