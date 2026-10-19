/** Конверсии рекламных кабинетов. Запускаются ТОЛЬКО со страницы «Спасибо» после подтверждения метки приёмщиком.
 *  Тег Google (gtag.js) стоит в <head> страницы продукта и её страницы «Спасибо», см. README.
 *  ID конверсии один для всех городов: действие «Заявка с лендинга» создано в управляющем аккаунте IT STEP KZ,
 *  а кабинет города Google определяет сам по gclid. Новый пиксель (Meta, TikTok и т. п.) добавляется сюда одной
 *  строкой, его загрузчик — в <head>. */
export const CONVERSIONS = {
 googleAdsSendTo: 'AW-18503263063/UEWhCISjr6IdENfGhfdE',   // «Заявка с лендинга», MCC IT STEP KZ 963-955-5901
 yandexCounter: 0,                                        // номер счётчика Метрики, когда появится
 yandexGoal: 'lead'
};

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
