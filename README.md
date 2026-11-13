# Лендинги it-step.kz

Лендинги «Академии ШАГ» (Казахстан) под контекстную рекламу. Каждый лендинг — папка в `sites/` и свой поддомен:

| Папка | Адрес |
|---|---|
| `sites/test` | https://test.it-step.kz |
| `sites/almaty/ai-course` | https://almaty.it-step.kz/ai-course |
| `sites/almaty/vibe-coding` | https://almaty.it-step.kz/vibe-coding/ |
| `sites/astana/vibe-coding` | https://astana.it-step.kz/vibe-coding/ |
| `sites/karaganda/vibe-coding` | https://karaganda.it-step.kz/vibe-coding/ |
| `sites/shymkent/vibe-coding` | https://shymkent.it-step.kz/vibe-coding/ |
| `sites/uralsk/vibe-coding` | https://uralsk.it-step.kz/vibe-coding/ |
| `sites/temirtau/vibe-coding` | https://temirtau.it-step.kz/vibe-coding/ |
| `sites/tashkent/vibe-coding` | https://tashkent.stepacademy.uz/vibe-coding/ |
| `sites/samarkand/vibe-coding` | https://samarkand.stepacademy.uz/vibe-coding/ |
| `sites/astana/ai-course` | https://astana.it-step.kz/ai-course |
| `sites/tashkent/ai-course` | https://tashkent.stepacademy.uz/ai-course |
| `sites/astana/mka` | https://astana.it-step.kz/mka |
| `sites/almaty/rpo-ai` | https://almaty.it-step.kz/rpo-ai |
| `sites/almaty/mka` | https://almaty.it-step.kz/mka |
| `sites/shymkent/mka` | https://shymkent.it-step.kz/mka |
| `sites/shymkent/rpo-ai` | https://shymkent.it-step.kz/rpo-ai |
| `sites/shymkent/design-ai` | https://shymkent.it-step.kz/design-ai |
| `sites/karaganda/mka` | https://karaganda.it-step.kz/mka |
| `sites/karaganda/rpo-ai` | https://karaganda.it-step.kz/rpo-ai |
| `sites/karaganda/design-ai` | https://karaganda.it-step.kz/design-ai |

Сервер — VPS PS.kz в Алматы, выкладка — Coolify (https://coolify.it-step.kz).

## Как внести правку

1. Создайте ветку от `main` (например, `rinata/python-banner`) и внесите изменения.
2. Откройте Pull Request в `main`. Coolify соберёт превью — ссылка появится в PR.
3. Правка попадёт на сайт только после одобрения владельца (CODEOWNERS). Напрямую в `main` писать нельзя.

## Правила

- Только статические файлы: HTML, CSS, JS, картинки. Картинки — сжатые (WebP/JPG до ~300 КБ).
- Никаких паролей, токенов и ключей в репозитории — он публичный. Секреты — в переменных окружения Coolify.
- Персональные данные клиентов сюда не попадают.
- Новый лендинг — новая папка `sites/<город>/<продукт>/` с `index.html`; город подключает владелец в Coolify.
- В `<head>` каждой страницы продукта сразу после `<meta charset>` — `<base href="/<продукт>/">` (например, `<base href="/mka/">`). Без него адрес без слэша (`/mka`) откроется без стилей и картинок. Пути к файлам — относительные (`assets/...`, `styles.css`).

## Формы и страница «Спасибо»

- Формы шлют заявку на `https://api.it-step.kz/lead` (приёмщик заявок, репозиторий `itstep-leads`): имя, телефон, `product`, `page_url`, метки `utm_*`, `gclid`, `yclid`, `fbclid`, скрытое поле-ловушка `website` (оно должно оставаться пустым).
- После успешной отправки форма ведёт на `<продукт>/spasibo/?t=<метка>`. Страница «Спасибо» закрыта от индексации, проверяет метку через `/lead/confirm` и только при ответе `ok` запускает конверсии (`conversion.js`). Прямой заход или обновление страницы конверсию не засчитывают.
- Страница «Спасибо» называет направление и город: вкладка «Заявка принята — <направление> | Академия ШАГ, <город>», подпись «<направление> · <город>»; телефон в `spasibo.js` (`PHONE`) — тот же, что в ссылке на странице, и он есть на странице продукта. Проверяет `tests/spasibo.test.mjs`; новый город или продукт — строка в его `CITY` / `PRODUCT`.
- Конверсии Google Ads: в `<head>` страницы продукта и её страницы «Спасибо» сразу после строки с `<base>` стоит тег Google (сниппет gtag.js с `AW-18503263063`), а ярлык действия «Заявка с лендинга» — в `conversion.js` (`CONVERSIONS.googleAdsSendTo`). ID один для всех городов и продуктов: конверсии ведутся в управляющем аккаунте Google Ads IT STEP KZ, кабинет города Google определяет по `gclid`. Новый лендинг копирует сниппет и `conversion.js` как есть. Счётчик Яндекс Метрики — там же, пока не задан.
- Пиксель Meta (с 06.11.2026): в `<head>` страницы продукта и её страницы «Спасибо» сразу после тега Google — код пикселя страны как есть от Meta. **Казахстан** (`*.it-step.kz`) — `1116204957997416` («Meta Pixel it-step.kz», бизнес It STEP Казахстан + ОАЭ, открыт во всех кабинетах КЗ), **Узбекистан** (`*.stepacademy.uz`) — `1115445171398466`. На всех страницах `PageView`; `Lead` — на «Спасибо» после `ok` от приёмщика (`fireConversions`), `Contact` — клик по кнопке WhatsApp / Telegram (`fireWhatsAppClick`). Корневые `sites/<город>/index.html` (переадресации) без пикселя — иначе двойной `PageView`. Новый лендинг копирует код пикселя своей страны; новый город Узбекистана — добавить в `UZ_CITIES` в `tests/meta-pixel.test.mjs`. Проверка — `node --test`.
- Новый домен лендинга нужно добавить в `SITE_ORIGINS` приёмщика (переменная в Coolify), иначе браузер заблокирует отправку формы.

## Кнопка WhatsApp

- **Обязательна на каждом лендинге** (решение Ильи 22.10.2026). PR нового лендинга без кнопки не сливается. Новый лендинг копирует `whatsapp.js` из `sites/<город>/mka/` и меняет только строку `WHATSAPP` (текст про свой продукт, номер своего города); в `index.html` — скрипт после `app.js`, символ иконки `wa-icon` после `<body>`, ссылка `<a class="wa-float" data-whatsapp>` перед `<noscript>`, стили `.wa-float` из конца `styles.css` МКА; в `conversion.js` — `fireWhatsAppClick` и `whatsappSendTo`. `node --test` проверяет кнопку на всех лендингах, где есть `whatsapp.js`.
- `whatsapp.js` подключён на странице продукта: плавающая кнопка `<a class="wa-float" data-whatsapp>` ведёт на `https://wa.me/<номер>?text=…`. В конец текста дописывается адрес страницы с кодом клика (`astana.it-step.kz/mka/k7f3`, без схемы и меток). При клике тот же код, страница и метки рекламы (`utm_*`, `gclid`) уходят в приёмщик `POST https://api.it-step.kz/wa/click` (keepalive, без ожидания ответа); сквозная аналитика по коду из первого сообщения находит лендинг и кампанию. Адрес должен оставаться не в начале сообщения. На странице «Спасибо» кнопки нет.
- Номер — канал Wazzup города (диалоги ведёт филиал: ЕЦПЗ расформирован 22.10.2026), не телефон филиала из подвала: Астана `77055353553`, Алматы `77059921014`, Шымкент `77067083383` («Шымкент альт»; номер 77710833383 с сайта филиала в Wazzup заблокирован), Караганда `77066834567` (с 12.11.2026, до этого 77775555995; он же телефон филиала на лендингах; WhatsApp филиала без Wazzup: клик пишется в журнал, но диалог с кампанией не связывается), Уральск `77775225372`, Темиртау `77086514762`. Номер и текст — строка `WHATSAPP` в начале `whatsapp.js`; остальной код файла одинаков на всех лендингах. Запасной `href` в разметке — тот же номер без текста (без JavaScript).
- Конверсия Google Ads «Клик WhatsApp» — ярлык `whatsappSendTo` в `conversion.js`; пока пустой, клики в Google Ads не уходят. Это вторичная конверсия: подтвердить диалог, как заявку, нельзя.
- Проверка: `node --test` из корня репозитория (Node 20+, без установки пакетов) — `tests/whatsapp.test.mjs`.
- **Узбекистан — Telegram вместо WhatsApp** (решение Ильи 04.11.2026): лендинги на `*.stepacademy.uz` подключают `telegram.js` и кнопку `<a class="wa-float tg-float" data-telegram>` → `https://t.me/<username>?text=…` (Ташкент — `itstep_tg_manager`); код клика и запись в приёмщик те же. Самарканд — без кнопки мессенджера (решение Ильи 04.11.2026). Бренд — IT STEP Academy. Проверка — `tests/telegram.test.mjs`.

## Заголовок под ключевое слово (пилот: МКА Астана)

- `sites/astana/mka/headline.js` меняет H1 первого экрана и `<title>` под ключ из поиска: Google и Яндекс передают его в `utm_term` (`{keyword}` в суффиксе кампании). Ключ сам на страницу не попадает: по нему выбирается заранее написанный заголовок из `HEADLINES` (первое совпавшее правило).
- Стандартный H1 остаётся: в кампании конкурентов (`utm_campaign` с `_comp`), у ключа с брендом конкурента или нашим (`BRANDS`), у ключа без правила, без `utm_term`.
- Тест 50/50: половина посетителей с подходящим ключом видит стандартный H1, вариант закреплён за посетителем (`localStorage`, `h1_ab`). Метка `kw:<правило>` или `base:<правило>` уходит с заявкой полем `h1` (`lead.js`). Приёмщик пока его не сохраняет — нужна правка `ATTR_KEYS` в `itstep-leads`.
- Пока скрипт не отработал, H1 скрыт классом `h1-wait` (не дольше 1,5 с, только при `utm_term` в адресе) — без мигания старого заголовка.
- Новое правило или новый ключ кампании — строка в `HEADLINES` и пример в `tests/headline.test.mjs`. Заголовок до ~40 знаков, акцент в `<span>`, в «3D‑», «IT‑» неразрывный дефис.

## Вайбкодинг (6 городов Казахстана)

`sites/almaty/vibe-coding/` — утверждённый светлый макет, подпись «Г.Алматы», ШАГ + Astana Hub, официальный PDF «Вайб кодинг KZ.pdf». Изображения преобразованы в WebP, каждый файл до 300 КБ. PDF сохранён без изменений. По уточнённому запросу пользователя подключены обе формы к общему приёмщику (product: «Вайбкодинг»), скрытое поле-ловушка, рекламные метки, подтверждённая страница «Спасибо» и WhatsApp Алматы 77059921014 с кодом клика. Сниппеты Google Ads и Meta Казахстана, конверсии и проверка метки заявки используют стандартные модули репозитория.

Копии в Астане, Караганде, Шымкенте, Уральске и Темиртау (12.11.2026) отличаются от Алматы только данными города: адреса пробного урока и подвала, телефоны, часы работы, политика конфиденциальности `<город>.itstep.org/privacy.pdf`, страница «Спасибо» (`spasibo.js` `PHONE`) и номер Wazzup в `whatsapp.js`. PDF программы (14 МБ) лежит только в Алматы, остальные города открывают его по ссылке `https://almaty.it-step.kz/vibe-coding/assets/vibe-coding-program.pdf` — чтобы не раздувать репозиторий и сборку. Правка текста лендинга — во всех восьми копиях.

Ташкент и Самарканд (13.11.2026) — бренд IT STEP Academy, логотипы IT STEP и IT Park (материалы Ринаты), телефон +998, пиксель Meta Узбекистана, программа — свой PDF из картинки «Вайб-кодинг IT STEP». Блока зарплат в тенге с вакансиями hh.kz нет. Ташкент — кнопка Telegram `telegram.js`, Самарканд — без кнопки мессенджера.
