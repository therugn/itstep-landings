// Маска телефона на лендингах: node --test tests/ (из корня репозитория, Node 20+).
// Правило (Илья, 17.11.2026): на каждом лендинге с формой — phone.js, плейсхолдер страны и проверка, согласованная с приёмщиком.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SITES = fileURLToPath(new URL('../sites/', import.meta.url));
const read = f => readFileSync(f, 'utf8');
const UZ_CITIES = new Set(['tashkent', 'samarkand']);   // *.stepacademy.uz — новый город Узбекистана добавить сюда

/** Лендинги sites/<город>/<продукт> с формой заявки. */
function landings() {
 const out = [];
 for (const city of readdirSync(SITES)) {
  if (city === 'test' || !statSync(SITES + city).isDirectory()) continue;
  for (const product of readdirSync(SITES + city)) {
   const dir = `${SITES}${city}/${product}`;
   if (statSync(dir).isDirectory() && existsSync(`${dir}/index.html`) && existsSync(`${dir}/lead.js`)) out.push({city, product, dir});
  }
 }
 return out;
}
const LANDINGS = landings();
const {nationalDigits, formatPhone, countryOf} = await import(pathToFileURL(`${LANDINGS[0].dir}/phone.js`));
const mask = (raw, cc) => formatPhone(nationalDigits(raw, cc), cc);

// Как люди вводят номер: с нуля в пустое поле, поверх префикса «+7 » (поле ставит его при фокусе), вставкой и автозаполнением.
const KZ_OK = '+7 (705) 123-45-67';
const KZ_INPUTS = ['+7 (705) 123-45-67', '+77051234567', '87051234567', '8 705 123 45 67', '7051234567', '705 123 45 67',
 '77051234567', '+7 705 1234567', '+7(705)123-45-67', '+7 7051234567', '+7 87051234567', '+7 +7 705 123 45 67', '+7 77051234567'];
const UZ_OK = '+998 (90) 123-45-67';
const UZ_INPUTS = ['+998 90 123 45 67', '998901234567', '901234567', '90 123 45 67', '+998 (90) 123-45-67', '8 90 123 45 67',
 '+998 901234567', '+998 8901234567', '+998 998901234567', '+998 +998 90 123 45 67'];

test('Казахстан: любой привычный ввод даёт +7 (705) 123-45-67', () => {
 for (const v of KZ_INPUTS) assert.equal(mask(v, 'KZ'), KZ_OK, v);
});

test('Казахстан: лишняя цифра в конце не сдвигает номер; код 777 не теряется', () => {
 assert.equal(mask('+7 (705) 123-45-678', 'KZ'), KZ_OK);
 assert.equal(mask('+7 7771234567', 'KZ'), '+7 (777) 123-45-67');
 assert.equal(mask('+7 77771234567', 'KZ'), '+7 (777) 123-45-67');
 assert.equal(mask('87771234567', 'KZ'), '+7 (777) 123-45-67');
});

test('Казахстан: набор по одной цифре поверх «+7 » — 8 в начале съедается, номер собирается по маске', () => {
 let v = '+7 ';
 for (const ch of '87051234567') v = mask(v + ch, 'KZ');
 assert.equal(v, KZ_OK);
 v = '+7 ';
 for (const ch of '77051234567') v = mask(v + ch, 'KZ');    // повторный код 7
 assert.equal(v, KZ_OK);
 assert.equal(mask('+7 70', 'KZ'), '+7 (70');
 assert.equal(mask('+7 7051', 'KZ'), '+7 (705) 1');
});

test('Узбекистан: любой привычный ввод даёт +998 (90) 123-45-67', () => {
 for (const v of UZ_INPUTS) assert.equal(mask(v, 'UZ'), UZ_OK, v);
});

test('Узбекистан: код оператора 88 не путается с лишней 8', () => {
 assert.equal(mask('88 123 45 67', 'UZ'), '+998 (88) 123-45-67');
 assert.equal(mask('+998 881234567', 'UZ'), '+998 (88) 123-45-67');
 assert.equal(mask('8 88 123 45 67', 'UZ'), '+998 (88) 123-45-67');
 assert.equal(mask('+998 8', 'UZ'), '+998 (8');             // ещё неясно: ждём следующую цифру
 assert.equal(mask('+998 89', 'UZ'), '+998 (9');            // 8 9… — восьмёрка лишняя
 let v = '+998 ';
 for (const ch of '8881234567') v = mask(v + ch, 'UZ');
 assert.equal(v, '+998 (88) 123-45-67');
 v = '+998 ';
 for (const ch of '998901234567') v = mask(v + ch, 'UZ');   // повторный код 998
 assert.equal(v, UZ_OK);
});

test('страна поля — по плейсхолдеру', () => {
 assert.equal(countryOf({placeholder: '+998 (__) ___-__-__'}), 'UZ');
 assert.equal(countryOf({placeholder: '+7 (___) ___-__-__'}), 'KZ');
 assert.equal(countryOf({placeholder: ''}), 'KZ');
});

test('phone.js на каждом лендинге с формой, копии одинаковы, подключён на странице', () => {
 const ref = read(`${LANDINGS[0].dir}/phone.js`);
 for (const {city, product, dir} of LANDINGS) {
  const where = `${city}/${product}`;
  assert.ok(existsSync(`${dir}/phone.js`), `${where}: нет phone.js`);
  assert.equal(read(`${dir}/phone.js`), ref, `${where}: phone.js отличается — копировать из другого лендинга без правок`);
  assert.match(read(`${dir}/index.html`), /<script type="module" src="phone\.js"><\/script>/, `${where}: phone.js не подключён`);
 }
});

test('плейсхолдер телефона своей страны на каждом лендинге', () => {
 for (const {city, product, dir} of LANDINGS) {
  const src = ['index.html', 'app.js'].filter(f => existsSync(`${dir}/${f}`)).map(f => read(`${dir}/${f}`)).join('\n');
  const want = UZ_CITIES.has(city) ? '+998 (__) ___-__-__' : '+7 (___) ___-__-__';
  const inputs = src.match(/<input[^>]*name="phone"[^>]*>/g) || [];
  for (const i of inputs) assert.ok(i.includes(`placeholder="${want}"`), `${city}/${product}: ${i}`);
  if (!inputs.length) assert.ok(src.includes(`'${want}'`), `${city}/${product}: плейсхолдер ${want} не найден`);
 }
});

test('проверка формы принимает всё, что даёт маска и что принимает приёмщик', async () => {
 for (const {city, product, dir} of LANDINGS) {
  const {validateLead} = await import(pathToFileURL(`${dir}/lead.js`));
  const uz = UZ_CITIES.has(city);
  const cc = uz ? 'UZ' : 'KZ';
  const ok = uz ? [UZ_OK, '998901234567', '901234567'] : [KZ_OK, '87051234567', '7051234567', '705 123 45 67'];
  for (const v of [...ok, ...(uz ? UZ_INPUTS : KZ_INPUTS).map(x => mask(x, cc))])
   assert.equal(validateLead({name: 'Тест', phone: v, consent: true}).phone, undefined, `${city}/${product}: ${v}`);
  for (const v of uz ? ['+998 (90) 123', '12345'] : ['+7 (705) 123', '12345'])
   assert.ok(validateLead({name: 'Тест', phone: v, consent: true}).phone, `${city}/${product}: пропустил ${v}`);
 }
});
