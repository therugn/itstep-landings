export function initBenefitDeck(root=document){
 const deck=root.querySelector('.benefit-deck');
 if(!deck||deck.dataset.initialized==='true')return;
 deck.dataset.initialized='true';
 const track=deck.querySelector('.benefit-stack');
 const cards=[...deck.querySelectorAll('[data-benefit-card]')];
 const dots=[...deck.querySelectorAll('[data-benefit-dot]')];
 const view=deck.ownerDocument.defaultView;
 let active=0,drag=null;
 const position=index=>cards[index].offsetLeft-cards[0].offsetLeft;
 const update=(index,announce=true)=>{
  active=Math.max(0,Math.min(cards.length-1,index));
  deck.dataset.active=String(active);
  cards.forEach((card,i)=>{card.hidden=false;card.dataset.state=i===active?'active':'inactive';});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));
  if(announce)deck.querySelector('.benefit-status').textContent=`Преимущество ${active+1} из ${cards.length}: ${cards[active].querySelector('h3').textContent}`;
 };
 const select=index=>{
  update(index);
  const left=position(active)||0;
  if(track.scrollTo)track.scrollTo({left,behavior:view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  else track.scrollLeft=left;
 };
 track.querySelectorAll('img').forEach(image=>image.draggable=false);
 deck.addEventListener('click',event=>{
  const dot=event.target.closest('[data-benefit-dot]');
  if(dot)select(Number(dot.dataset.benefitDot));
 });
 deck.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(active+(event.key==='ArrowRight'?1:-1));}
  else if(event.key==='Home'||event.key==='End'){event.preventDefault();select(event.key==='Home'?0:cards.length-1);}
 });
 track.addEventListener('scroll',()=>{
  if(drag)return;
  const nearest=cards.reduce((best,card,i)=>Math.abs(position(i)-track.scrollLeft)<Math.abs(position(best)-track.scrollLeft)?i:best,0);
  if(nearest!==active)update(nearest);
 },{passive:true});
 track.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  event.preventDefault();drag={x:event.clientX,left:track.scrollLeft,index:active};
  track.classList.add('is-dragging');track.setPointerCapture?.(event.pointerId);
 });
 track.addEventListener('pointermove',event=>{if(drag)track.scrollLeft=drag.left+drag.x-event.clientX;});
 const finish=event=>{
  if(!drag)return;
  const current=drag,dx=current.x-event.clientX;drag=null;
  track.classList.remove('is-dragging');
  select(Math.abs(dx)>40?current.index+(dx>0?1:-1):current.index);
 };
 track.addEventListener('pointerup',finish);
 track.addEventListener('pointercancel',()=>{if(drag){const i=drag.index;drag=null;track.classList.remove('is-dragging');select(i);}});
 deck.classList.add('is-enhanced');update(0,false);
}
