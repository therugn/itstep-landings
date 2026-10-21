export const careerIndex=(index,delta,count)=>((index+delta)%count+count)%count;
export function initCareerCarousel(root=document){
 const carousel=root.querySelector('.fire-carousel');
 if(!carousel||carousel.dataset.initialized==='true')return;
 carousel.dataset.initialized='true';
 const cards=[...carousel.querySelectorAll('[data-career-card]')];
 const status=carousel.querySelector('.career-status');
 const dots=[...carousel.querySelectorAll('[data-career-dot]')];
 let active=0,start=null,suppressUntil=0;
 const select=(index,announce=true)=>{
  const next=careerIndex(index,0,cards.length);
  const view=carousel.ownerDocument.defaultView;
  const animate=announce&&next!==active&&view?.getComputedStyle&&!view.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const before=animate?cards.map(card=>({position:card.dataset.position,transform:view.getComputedStyle(card).transform,filter:view.getComputedStyle(card).filter})):[];
  cards.forEach(card=>card.getAnimations?.().forEach(animation=>animation.cancel()));
  active=next;carousel.dataset.active=String(active);
  cards.forEach((card,i)=>{card.dataset.position=i===active?'active':careerIndex(active,1,cards.length)===i?'next':'previous';card.querySelector('button').setAttribute('aria-pressed',String(i===active));});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));
  if(animate)cards.forEach((card,i)=>{
   const from=before[i],to=view.getComputedStyle(card);
   if(from.position===card.dataset.position)return;
   const recycled=from.position!=='active'&&card.dataset.position!=='active';
   const frames=recycled
    ?[{transform:to.transform,filter:to.filter,opacity:0},{transform:to.transform,filter:to.filter,opacity:1}]
    :[{transform:from.transform,filter:from.filter},{transform:to.transform,filter:to.filter}];
   card.animate(frames,{duration:recycled?320:550,delay:recycled?180:0,easing:'cubic-bezier(.22,.75,.2,1)',fill:'backwards'});
  });
  if(announce)status.textContent=`${cards[active].querySelector('h3').textContent}. ${active+1} из ${cards.length}.`;
 };
 carousel.addEventListener('click',event=>{
  if(Date.now()<suppressUntil){event.preventDefault();return;}
  const dot=event.target.closest('[data-career-dot]');
  if(dot){select(Number(dot.dataset.careerDot));return;}
  const trigger=event.target.closest('[data-career-select]');
  if(trigger)select(Number(trigger.dataset.careerSelect));
 });
 carousel.addEventListener('keydown',event=>{
  const steps={ArrowRight:1,ArrowLeft:-1};
  if(event.key in steps){event.preventDefault();select(careerIndex(active,steps[event.key],cards.length));}
  else if(event.key==='Home'||event.key==='End'){event.preventDefault();select(event.key==='Home'?0:cards.length-1);}
 });
 carousel.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;start={x:event.clientX,y:event.clientY};});
 carousel.addEventListener('pointerup',event=>{
  if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){suppressUntil=Date.now()+350;select(careerIndex(active,dx<0?1:-1,cards.length));}
 });
 carousel.addEventListener('pointercancel',()=>{start=null;});
 carousel.classList.add('is-enhanced');select(0,false);
}
