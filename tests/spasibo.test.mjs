// Страницы «Спасибо» под направление и город: node --test tests/ (из корня репозитория, Node 20+).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
// Новый город или продукт — строка здесь; без неё тест упадёт и напомнит.
const CITY = {astana: 'Астана', almaty: 'Алматы', shymkent: 'Шымкент', karaganda: 'Караганда', uralsk: 'Уральск', temirtau: 'Темиртау', tashkent: 'Ташкент', samarkand: 'Самарканд'};
// Бренд по стране: Узбекистан — IT STEP Academy, Казахстан — Академия ШАГ.
const UZ = new Set(['tashkent', 'samarkand']);
const PRODUCT = {'ai-course': 'Искусственный интеллект с нуля до профи', mka: 'Малая компьютерная академия', 'rpo-ai': 'РПО + AI', 'design-ai': 'Дизайн + AI', 'after-school': 'IT-продлёнка'};

const digits = s => s.replace(/\D/g, '');
const pages = readdirSync(SITES).flatMap(c => readdirSync(join(SITES, c), {withFileTypes: true})
 .filter(d => d.isDirectory() && existsSync(join(SITES, c, d.name, 'spasibo', 'index.html')))
 .map(d => ({city: c, product: d.name, dir: join(SITES, c, d.name)})));

test('страницы «Спасибо» найдены', () => assert.ok(pages.length >= 12, `найдено ${pages.length}`));

for (const {city, product, dir} of pages) {
 test(`${city}/${product}: направление, город и телефон города на странице «Спасибо»`, () => {
  const name = CITY[city], prod = PRODUCT[product];
  assert.ok(name, `нет города ${city} в CITY`);
  assert.ok(prod, `нет продукта ${product} в PRODUCT`);
  const html = readFileSync(join(dir, 'spasibo', 'index.html'), 'utf8');
  const js = readFileSync(join(dir, 'spasibo.js'), 'utf8');
  const page = readFileSync(join(dir, 'index.html'), 'utf8');
  const title = `Заявка принята — ${prod} | ${UZ.has(city) ? 'IT STEP Academy' : 'Академия ШАГ'}, ${name}`;
  assert.ok(html.includes(`<title>${title}</title>`), 'заголовок вкладки в spasibo/index.html');
  assert.ok(html.includes(`id="eyebrow">${prod} · ${name}</p>`), 'подпись над заголовком в spasibo/index.html');
  assert.ok(js.includes(`ok: ['${prod} · ${name}'`), 'подпись в TEXTS.ok');
  assert.ok(js.includes(`'${title}'`), 'doc.title после проверки заявки');
  const tel = html.match(/class="phone-link" href="tel:\+(\d{11,12})"/)?.[1];
  assert.ok(tel, 'ссылка на телефон на странице «Спасибо»');
  assert.equal(digits(js.match(/const PHONE = '([^']*)'/)[1]), tel, 'PHONE в spasibo.js = ссылке на странице');
  assert.ok(page.includes(`tel:+${tel}`), 'телефон «Спасибо» есть на странице продукта');
 });
}
