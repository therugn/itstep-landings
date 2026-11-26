import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initCourseNavigation} from '../sites/almaty/ai-course/navigation.js';

function element() {
 return {hidden:false,attrs:{},handlers:{},dataset:{},addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},emit(type,event={}){for(const fn of this.handlers[type]??[])fn(event)},setAttribute(k,v){this.attrs[k]=v},focus(){this.focused=true},scrollIntoView(opts){this.scrolled=opts},closest(){return null}};
}
function fixture() {
 const header=element(),toggle=element(),nav=element(),target=element(),root=element();
 toggle.hidden=true;
 const media={matches:true,addEventListener(t,fn){this.change=fn}};
 const win={location:{pathname:'/ai-course/',search:'?utm_source=test'},history:{replaceState(...args){win.url=args[2]}},matchMedia(query){return query.includes('max-width')?media:{matches:false}}};
 header.contains=node=>[header,toggle,nav].includes(node);
 root.querySelector=s=>({'.course-header':header,'.menu-toggle':toggle,'#course-navigation':nav}[s]);
 root.querySelectorAll=()=>[];
 root.getElementById=id=>id==='program'?target:null;
 root.defaultView=win;
 return {root,header,toggle,nav,target,media,win};
}


const setup = () => { const f = fixture(); initCourseNavigation(f.root); return f; };

test('mobile navigation: toggle and Escape return focus', () => {
 const f = setup();
 assert.equal(f.toggle.hidden, false);
 assert.equal(f.nav.hidden, true);
 f.toggle.emit('click');
 assert.equal(f.nav.hidden, false);
 assert.equal(f.toggle.attrs['aria-expanded'], 'true');
 f.root.emit('keydown', {key: 'Escape'});
 assert.equal(f.nav.hidden, true);
 assert.equal(f.toggle.focused, true);
});
test('section navigation closes menu, focuses destination and preserves campaign parameters', () => {
 const f = setup(); f.toggle.emit('click');
 let prevented = false;
 f.nav.emit('click', {target: {closest: () => ({hash: '#program'})}, preventDefault() {prevented = true}});
 assert.equal(prevented, true);
 assert.equal(f.nav.hidden, true);
 assert.equal(f.target.focused, true);
 assert.equal(f.target.scrolled.block, 'start');
 assert.equal(f.win.url, '/ai-course/?utm_source=test#program');
});
test('outside click and switching between mobile and desktop reset navigation', () => {
 const f = setup(); f.toggle.emit('click');
 f.root.emit('click', {target: {}});
 assert.equal(f.nav.hidden, true);
 f.toggle.emit('click');
 f.media.matches = false; f.media.change();
 assert.equal(f.toggle.hidden, true);
 assert.equal(f.nav.hidden, false);
 f.media.matches = true; f.media.change();
 assert.equal(f.nav.hidden, true);
});
test('all three city pages wire the same navigation to existing section destinations', () => {
 const source = readFileSync(new URL('../sites/almaty/ai-course/navigation.js', import.meta.url), 'utf8');
 for (const city of ['almaty', 'astana', 'tashkent']) {
  const page = readFileSync(new URL('../sites/' + city + '/ai-course/index.html', import.meta.url), 'utf8');
  assert.equal(readFileSync(new URL('../sites/' + city + '/ai-course/navigation.js', import.meta.url), 'utf8'), source);
  assert.match(page, /<script type="module" src="navigation.js"><\/script>/);
  assert.match(page, /aria-controls="course-navigation"/);
  for (const id of ['about', 'program', 'contacts']) {
   assert.ok(page.includes('href="#' + id + '"'));
   assert.ok(page.includes('id="' + id + '"'));
  }
  const heading = page.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)[0];
  assert.ok(heading.includes('с 0'));
  assert.ok(!heading.includes('с нуля'));
 }
});
