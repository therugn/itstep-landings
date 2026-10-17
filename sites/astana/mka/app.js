import {ages,skills,benefits,reviews,faqs,SOURCE} from './content.js';
import {getAge,headerDecision} from './ui-state.js';
import {validateLead,submitLead,LEAD_ENDPOINT} from './lead.js';
const $ = selector=>document.querySelector(selector);
const icon = name=>`<img src="assets/icons/${name}.svg" alt="" loading="lazy">`;
const motion = ()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const escape = value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let selectedAge='7-8';
const programDocuments={'7-8':{url:'assets/program-pdfs/program-1.pdf',name:'№1 МА 9-11 Кз.pdf'},'9-11':{url:'assets/program-pdfs/program-1.pdf',name:'№1 МА 9-11 Кз.pdf'},'12-14':{url:'assets/program-pdfs/program-2.pdf',name:'№2 МА 12-14 лет Кз.pdf'}};
$('#age-grid').innerHTML=ages.map(age=>`<article class="age-card age-visual-card"><figure class="age-cover"><img src="assets/age-${age.id}.png" width="353" height="${age.id==='12-14'?206:200}" alt="Иллюстрация программы для детей ${age.label}" loading="lazy"></figure><div class="age-content"><div class="age-title-row"><h3 class="age-title">${age.label}</h3><span class="age-kicker ${age.color}">${age.kicker}</span></div><p class="age-description">${age.description}</p><a class="age-link" href="#programs" data-age="${age.id}">Посмотреть программу${icon('arrow-up-right')}</a></div></article>`).join('');
$('#skills-grid').innerHTML=skills.map(skill=>`<article class="skill-card"><div class="skill-top"><img class="skill-icon" src="assets/skills-${skill.icon}.png" width="200" height="200" alt="" loading="lazy"></div><h3>${skill.title}</h3><p>${skill.icon==='cube'?`<span class="skill-copy-mobile">${skill.description}</span><span class="skill-copy-desktop"><span>Принципы 3D-печати</span><span>и подготовка моделей для 3D-принтера</span></span>`:skill.description}</p></article>`).join('');
const ageTrack=$('#age-grid');
const ageCards=[...ageTrack.querySelectorAll('.age-card')];
function moveAge(direction){const step=ageCards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(ageTrack).gap);ageTrack.scrollBy({left:direction*step,behavior:motion()})}
function updateAges(){const carousel=ageTrack.scrollWidth>ageTrack.clientWidth+2;ageTrack.tabIndex=carousel?0:-1;if(carousel)ageTrack.setAttribute('aria-roledescription','карусель');else ageTrack.removeAttribute('aria-roledescription')}
window.addEventListener('resize',updateAges);
ageTrack.addEventListener('keydown',event=>{if(event.target!==ageTrack)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveAge(event.key==='ArrowLeft'?-1:1)}});updateAges();
$('#benefits-grid').innerHTML=benefits.map(item=>`<article class="benefit-story"><figure class="benefit-photo"><img src="${escape(item.photo)}" alt="${escape(item.photoAlt)}" loading="lazy" width="900" height="600"></figure><div class="benefit-copy"><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></div></article>`).join('');
const benefitTrack=$('#benefits-grid');
const benefitCards=[...benefitTrack.querySelectorAll('.benefit-story')];
function updateBenefitCarousel(){const carousel=benefitTrack.scrollWidth>benefitTrack.clientWidth+2;benefitTrack.tabIndex=carousel?0:-1;if(carousel)benefitTrack.setAttribute('aria-roledescription','карусель');else benefitTrack.removeAttribute('aria-roledescription')}
benefitTrack.addEventListener('keydown',event=>{if(event.target!==benefitTrack)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const step=benefitCards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(benefitTrack).gap);benefitTrack.scrollBy({left:step*(event.key==='ArrowLeft'?-1:1),behavior:motion()})}});
window.addEventListener('resize',updateBenefitCarousel);updateBenefitCarousel();
const tabList=$('#program-tabs');
tabList.innerHTML=ages.map((age,i)=>`<button type="button" id="tab-${age.id}" role="tab" aria-selected="${i===0}" aria-controls="program-panel" tabindex="${i===0?'0':'-1'}" data-age="${age.id}">${age.label}</button>`).join('');
function selectAge(id){
 const age=getAge(id);selectedAge=age.id;
 tabList.querySelectorAll('button').forEach(tab=>{const active=tab.dataset.age===age.id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
 const panel=$('#program-panel');panel.setAttribute('aria-labelledby',`tab-${age.id}`);
 panel.innerHTML=`<div class="program-summary"><div><h3>${age.title.replace('\n',' ')}</h3></div></div><ol class="course-list">${age.courses.map(course=>`<li>${escape(course)}</li>`).join('')}</ol>`;
 panel.classList.remove('panel-enter');void panel.offsetWidth;panel.classList.add('panel-enter');
 $('#dialog-age').textContent=age.label;
 const download=$('#enroll');download.dataset.age=age.id;
 const pdf=programDocuments[age.id];const downloadStatus=$('#program-download-status');
 if(pdf){download.href=pdf.url;download.download=pdf.name;download.removeAttribute('aria-disabled');download.removeAttribute('aria-describedby');downloadStatus.hidden=true;downloadStatus.textContent=''}
 else{download.removeAttribute('href');download.removeAttribute('download');download.setAttribute('aria-disabled','true');download.setAttribute('aria-describedby','program-download-status');downloadStatus.hidden=false;downloadStatus.textContent='PDF для 12–14 лет пока недоступен.'}
 const modalAge=$('#form-modal-age');if(modalAge)modalAge.value=age.id;
}
selectAge(selectedAge);
tabList.addEventListener('click',event=>{const tab=event.target.closest('[role=tab]');if(tab)selectAge(tab.dataset.age)});
tabList.addEventListener('keydown',event=>{const tabs=[...tabList.querySelectorAll('button')];const index=tabs.indexOf(event.target);let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectAge(tabs[next].dataset.age);tabs[next].focus()});
$('#reviews-track').innerHTML=reviews.map(review=>`<article class="review-card"><img class="review-mark" src="${escape(review.photo)}" alt="" width="201" height="201" loading="lazy"><p>${escape(review.full)}</p><div class="review-author"><strong>${escape(review.name)}</strong></div></article>`).join('');
$('#faq-list').innerHTML=faqs.map(([question,answer])=>`<details class="faq-item"><summary>${question}${icon('plus')}</summary><p>${answer}</p></details>`).join('');
function formHTML(id){
 const base=`form-${id}`;
 const compact=id==='hero'||id==='first'||id==='final';
 const field=(name,label,type,placeholder,required=false)=>`<div class="form-field"><label class="field-label" for="${base}-${name}">${label}${required?' *':''}</label><input id="${base}-${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${name==='name'?'given-name':name==='phone'?'tel':'email'}" ${name==='phone'?'inputmode="tel" maxlength="24"':name==='name'?'maxlength="100"':'maxlength="150"'} ${required?'required':''} aria-describedby="${base}-${name}-error"><span class="field-error" id="${base}-${name}-error"></span></div>`;
 return `<form class="lead-form" id="${base}" novalidate data-form-id="${id}">${field('name','Ваше имя','text','Как к вам обращаться?',true)}${field('phone',compact?'Номер телефона':'Телефон','tel','+7 (___) ___-__-__',true)}${compact?'':`${field('email','Email · необязательно','email','name@example.com')}<div class="form-field age-field"><label class="field-label" for="${base}-age">Возраст ребёнка</label><select id="${base}-age" name="age">${ages.map(age=>`<option value="${age.id}">${age.label}</option>`).join('')}</select></div>`}<label class="consent" for="${base}-consent"><input type="checkbox" id="${base}-consent" name="consent" checked required aria-describedby="${base}-consent-error"><span>Согласен(на) на обработку персональных данных согласно <a href="https://astana.itstep.org/privacy.pdf" target="_blank" rel="noopener">политике конфиденциальности</a>.</span></label><span class="field-error consent-error" id="${base}-consent-error"></span><button class="button ${id==='first'?'':'button-lime'}" type="submit">${id==='hero'||id==='first'?'Записаться':'Отправить заявку'}${compact?'':icon('arrow-up-right')}</button><input type="text" name="website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">${compact?'':`<p class="form-demo"><span class="demo-badge">ДЕМО</span><span>Приём заявок пока не подключён. Для записи позвоните в академию. Поля формы требуют сверки с оригиналом.</span></p>`}<p class="form-status" role="status" aria-live="polite" tabindex="-1"></p></form>`;
}
document.querySelectorAll('.form-host').forEach(host=>host.innerHTML=formHTML(host.dataset.form));
if(LEAD_ENDPOINT)document.querySelectorAll('.form-demo').forEach(note=>note.hidden=true);
document.querySelectorAll('.lead-form').forEach(form=>{
 form.addEventListener('submit',async event=>{
  event.preventDefault();const submit=form.querySelector('[type=submit]');if(submit.disabled)return;
  const data={name:form.elements.name.value.trim(),phone:form.elements.phone.value.trim(),email:form.elements.email?.value.trim()||'',age:form.elements.age?.value,ageLabel:form.elements.age?.selectedOptions?.[0]?.textContent?.trim()||'',website:form.elements.website?.value||'',consent:form.elements.consent.checked,source:SOURCE,form:form.dataset.formId};
  const errors=validateLead(data);
  for(const name of ['name','phone','email','consent'].filter(name=>form.elements[name])){const field=form.elements[name];const output=$(`#${form.id}-${name}-error`);output.textContent=errors[name]||'';field.setAttribute('aria-invalid',String(Boolean(errors[name])))}
  const status=form.querySelector('.form-status');status.classList.remove('success');status.textContent='';
  const first=Object.keys(errors)[0];if(first){form.elements[first].focus();return}
  submit.disabled=true;submit.setAttribute('aria-busy','true');const original=submit.innerHTML;submit.textContent=LEAD_ENDPOINT?'Отправляем…':'Проверяем…';
  const result=await submitLead(data);submit.disabled=false;submit.removeAttribute('aria-busy');submit.innerHTML=original;
  status.textContent=result.message;if(result.ok)status.classList.add('success');if(result.ok&&result.thanks){location.assign(new URL('spasibo/?t='+encodeURIComponent(result.thanks),document.baseURI));return}status.focus({preventScroll:true});status.scrollIntoView({block:'nearest',behavior:motion()});
 });
 form.addEventListener('input',event=>{const name=event.target.name;const error=$(`#${form.id}-${name}-error`);if(error){error.textContent='';event.target.removeAttribute('aria-invalid')}});
});
// Native dialog manages focus trapping and Escape. Keep the same form node to retain drafts.
let modalTrigger=null;
function openDialog(dialog,trigger){modalTrigger=trigger;dialog.showModal();document.body.classList.add('locked')}
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('locked');modalTrigger?.focus({preventScroll:true});modalTrigger=null});
 // Deliberately no backdrop-to-close: avoid accidental dismissal while typing.
});
$('#enroll').addEventListener('click',event=>{if(!programDocuments[selectedAge])event.preventDefault()});

const track=$('#reviews-track');const cards=[...track.querySelectorAll('.review-card')];
function reviewScroll(direction){const step=cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);track.scrollBy({left:direction*step,behavior:motion()})}
$('#review-prev').addEventListener('click',()=>reviewScroll(-1));$('#review-next').addEventListener('click',()=>reviewScroll(1));
track.addEventListener('keydown',event=>{if(event.target!==track)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();reviewScroll(event.key==='ArrowLeft'?-1:1)}});
function updateReviews(){$('#review-prev').disabled=track.scrollLeft<3;$('#review-next').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3}
track.addEventListener('scroll',updateReviews,{passive:true});window.addEventListener('resize',updateReviews);updateReviews();
// Sticky header: cumulative movement threshold avoids tiny scroll jitter.
const header=$('#header');const menu=$('#mobile-menu');const toggle=$('#menu-toggle');let scrollBase=window.scrollY;let navSuppression=0;
function closeMenu(restore=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');toggle.querySelector('img').src='assets/icons/list.svg';document.body.classList.remove('locked');if(restore)toggle.focus()}
function openMenu(){menu.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Закрыть меню');toggle.querySelector('img').src='assets/icons/x.svg';header.classList.remove('is-hidden');document.body.classList.add('locked');menu.querySelector('a').focus()}
header.addEventListener('focusin',event=>{if(event.target.matches(':focus-visible')){header.classList.remove('is-hidden');scrollBase=window.scrollY}});
toggle.addEventListener('click',()=>menu.hidden?openMenu():closeMenu(true));
document.addEventListener('keydown',event=>{if(menu.hidden)return;if(event.key==='Escape'){event.preventDefault();closeMenu(true)}if(event.key==='Tab'){const focusable=[toggle,...menu.querySelectorAll('a')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
window.addEventListener('resize',()=>{if(window.innerWidth>=900&&!menu.hidden)closeMenu()});
window.addEventListener('scroll',()=>{const y=window.scrollY;header.classList.toggle('scrolled',y>20);if(Date.now()<navSuppression){scrollBase=y;return}const delta=y-scrollBase;if(Math.abs(delta)>=12||y<40){header.classList.toggle('is-hidden',headerDecision({delta,y,menuOpen:!menu.hidden,hidden:header.classList.contains('is-hidden'),focusWithin:header.contains(document.activeElement)&&document.activeElement.matches(':focus-visible')}));scrollBase=y}},{passive:true});
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const target=$(link.getAttribute('href'));if(!target)return;event.preventDefault();if(link.dataset.age)selectAge(link.dataset.age);closeMenu();const top=link.getAttribute('href')==='#top';header.classList.toggle('is-hidden',!top);navSuppression=Date.now()+900;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});history.replaceState(null,'',link.getAttribute('href'));const focusTarget=target.querySelector('h1,h2')||target;if(!focusTarget.hasAttribute('tabindex'))focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true})});
