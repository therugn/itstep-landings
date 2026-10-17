/** Конверсии рекламных кабинетов. Вызываются ТОЛЬКО со страницы «Спасибо» после подтверждения метки приёмщиком.
 *  Пока ID пустые, ничего не отправляется. Заполнить после создания конверсий в Google Ads и цели в Яндекс Метрике. */
export const CONVERSIONS = {
 googleAdsSendTo: '',      // например 'AW-123456789/AbC-D_efG-h12_34-567'
 yandexCounter: 0,         // номер счётчика Метрики, например 97914101
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
