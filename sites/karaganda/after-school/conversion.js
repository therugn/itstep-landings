/** Конверсии рекламных кабинетов. Запускаются ТОЛЬКО со страницы «Спасибо» после подтверждения метки приёмщиком.
 *  Тег Google (gtag.js) стоит в <head> страницы продукта и её страницы «Спасибо», см. README.
 *  ID конверсии один для всех городов: действие «Заявка с лендинга» создано в управляющем аккаунте IT STEP KZ,
 *  а кабинет города Google определяет сам по gclid. Новый пиксель (Meta, TikTok и т. п.) добавляется сюда одной
 *  строкой, его загрузчик — в <head>.
 *  Пиксель Meta: код загрузчика с ID страны — в <head> страницы продукта и «Спасибо» (КЗ 1116204957997416,
 *  УЗ 1115445171398466, см. README); Lead — строкой fbq('track', 'Lead') в коде пикселя страницы «Спасибо» (решение Ильи 17.11.2026), здесь только Contact — клик по мессенджеру. */
export const CONVERSIONS = {
 googleAdsSendTo: 'AW-18503263063/UEWhCISjr6IdENfGhfdE',   // «Заявка с лендинга», MCC IT STEP KZ 963-955-5901
 whatsappSendTo: 'AW-18503263063/25MWCKSrq64dENfGhfdE',    // «Клик WhatsApp», MCC IT STEP KZ, вторичная (создана 29.10.2026)
 yandexCounter: 0,                                        // номер счётчика Метрики, когда появится
 yandexGoal: 'lead',
 metaPixel: true                                          // событие пикселя Meta Contact (клик по мессенджеру); Lead — в коде пикселя «Спасибо»
};

/** Клик по кнопке WhatsApp (whatsapp.js): вторичная конверсия, не для ставок — подтвердить диалог, как заявку, нельзя. */
export function fireWhatsAppClick(win = globalThis.window, config = CONVERSIONS) {
 const fired = [];
 if (config.whatsappSendTo && typeof win?.gtag === 'function') {
  win.gtag('event', 'conversion', {send_to: config.whatsappSendTo});
  fired.push('google-ads');
 }
 if (config.metaPixel && typeof win?.fbq === 'function') {
  win.fbq('track', 'Contact');
  fired.push('meta');
 }
 return fired;
}

export function fireConversions(win = globalThis.window, config = CONVERSIONS) {
 const fired = [];
 if (config.googleAdsSendTo && typeof win?.gtag === 'function') {
  win.gtag('event', 'conversion', {send_to: config.googleAdsSendTo});
  fired.push('google-ads');
 }
 if (config.yandexCounter && typeof win?.ym === 'function') {
  win.ym(config.yandexCounter, 'reachGoal', config.yandexGoal);
  fired.push('yandex-metrika');
 }
 return fired;
}
