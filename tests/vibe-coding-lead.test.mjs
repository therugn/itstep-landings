import test from 'node:test';
import assert from 'node:assert/strict';
import {bindForms} from '../sites/almaty/vibe-coding/app.js';

function form() {
 const field = value => ({value, error: '', setCustomValidity(message) {this.error = message;}});
 const elements = {name: field('Анна'), phone: field('+7 (705) 123-45-67'),
  consent: {...field('on'), checked: true}, website: field('')};
 const feedback = {hidden: true, textContent: ''};
 const button = {textContent: 'Записаться', disabled: false, setAttribute() {}, removeAttribute() {}};
 const handlers = {};
 return {elements, feedback, button, handlers,
  querySelector: selector => selector === '.form-feedback' ? feedback : button,
  addEventListener(type, handler) {handlers[type] = handler;},
  reportValidity: () => !Object.values(elements).some(x => x.error)};
}

async function scenario(run) {
 const previous = {fetch: globalThis.fetch, location: globalThis.location, document: globalThis.document};
 const forms = [form(), form()], navigations = [], requests = [];
 const loc = {href: 'https://almaty.it-step.kz/vibe-coding/?utm_source=google&gclid=abc#hero', search: '?utm_source=google&gclid=abc'};
 const doc = {baseURI: 'https://almaty.it-step.kz/vibe-coding/', querySelectorAll: () => forms};
 globalThis.location = loc;
 globalThis.document = doc;
 globalThis.fetch = async (url, init) => {
  requests.push({url, payload: JSON.parse(init.body)});
  return {ok: true, json: async () => ({ok: true, thanks: 'signed-token'})};
 };
 bindForms(doc, {assign: url => navigations.push(String(url))});
 try {await run({forms, navigations, requests});}
 finally {Object.assign(globalThis, previous);}
}

const submit = form => form.handlers.submit({preventDefault() {}});

test('оба расположения формы отправляют Вайбкодинг и метки рекламы, затем открывают подтверждение', async () => {
 await scenario(async ({forms, navigations, requests}) => {
  for (const f of forms) await submit(f);
  assert.equal(requests.length, 2);
  for (const {url, payload} of requests) {
   assert.equal(url, 'https://api.it-step.kz/lead');
   assert.equal(payload.product, 'Вайбкодинг');
   assert.equal(payload.utm_source, 'google');
   assert.equal(payload.gclid, 'abc');
   assert.equal(payload.website, '');
   assert.equal(payload.page_url, 'https://almaty.it-step.kz/vibe-coding/?utm_source=google&gclid=abc');
  }
  assert.deepEqual(navigations, Array(2).fill('https://almaty.it-step.kz/vibe-coding/spasibo/?t=signed-token'));
 });
});

test('невалидный телефон или снятое согласие блокируют отправку', async () => {
 await scenario(async ({forms, requests, navigations}) => {
  forms[0].elements.phone.value = '123';
  forms[1].elements.consent.checked = false;
  for (const f of forms) await submit(f);
  assert.equal(requests.length, 0);
  assert.equal(navigations.length, 0);
  assert.ok(forms[0].elements.phone.error);
  assert.ok(forms[1].elements.consent.error);
 });
});

test('сбой приёмщика сохраняет введённые данные, показывает ошибку и позволяет повторить отправку', async () => {
 await scenario(async ({forms, navigations}) => {
  globalThis.fetch = async () => {throw new Error('offline');};
  await submit(forms[0]);
  assert.equal(navigations.length, 0);
  assert.equal(forms[0].elements.name.value, 'Анна');
  assert.equal(forms[0].button.disabled, false);
  assert.equal(forms[0].feedback.hidden, false);
  assert.match(forms[0].feedback.textContent, /Не удалось/);
 });
});
