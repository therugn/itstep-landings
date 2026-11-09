const classNames = ['1 класс', '2–4 класс', '5–6 класс'];
const afternoonTimes = ['13:00–13:40','13:40–14:20','14:20–15:00','15:10–15:50','15:50–16:10','16:10–16:50','16:50–17:30','17:30'];
const morningTimes = ['8:30–9:00','9:00–9:40','9:40–9:50','9:50–10:30','10:30–10:50','10:50–11:30','11:30–12:10','12:10–12:50','12:50'];
const reading = 'Чтение, письмо, счёт';
const homework = 'Домашка';
const rest = 'Свободное время, игры';
const afternoonActivities = [
 ['Приход, сбалансированный горячий обед','Прогулка, отдых',`${reading} (куратор + AI)`,'Спецпредмет','Полезный полдник',reading,rest,'Уход домой'],
 ['Приход, сбалансированный горячий обед','Прогулка, отдых',`${homework} (куратор + AI)`,homework,'Полезный полдник','Спецпредмет',rest,'Уход домой'],
 ['Приход, сбалансированный горячий обед','Прогулка, отдых',`${homework} (куратор + AI)`,homework,'Полезный полдник',rest,'Спецпредмет','Уход домой']
];
const morningActivities = [
 ['Приход',`${reading} (куратор + AI)`,'Прогулка, отдых','Спецпредмет','Полезный полдник',reading,rest,'Сбалансированный горячий обед','Уход в школу'],
 ['Приход',`${homework} (куратор + AI)`,'Прогулка, отдых',homework,'Полезный полдник','Спецпредмет',rest,'Сбалансированный горячий обед','Уход в школу'],
 ['Приход',`${homework} (куратор + AI)`,'Прогулка, отдых',homework,'Полезный полдник',rest,'Спецпредмет','Сбалансированный горячий обед','Уход в школу']
];
export function getSchedule(shift = 'afternoon', group = 1) {
 if (!['morning','afternoon'].includes(shift) || !Number.isInteger(group) || group < 0 || group > 2) throw new RangeError('Unknown shift or group');
 const morning = shift === 'morning';
 const times = morning ? morningTimes : afternoonTimes;
 const activities = (morning ? morningActivities : afternoonActivities)[group];
 return {className:classNames[group],hours:morning?'8:30–12:50':'13:00–17:30',items:times.map((time,i)=>({time,activity:activities[i]}))};
}
