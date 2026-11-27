const form = document.querySelector('#course-form');
const nameField = document.querySelector('#name');
const phone = document.querySelector('#phone');
const status = document.querySelector('#form-status');

form.addEventListener('input', (event) => {
  if (event.target === nameField || event.target === phone) {
    event.target.setCustomValidity('');
  }
  status.textContent = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const digits = phone.value.replace(/\D/g, '');
  const hasLocalNumber = digits.length === 9 && !phone.value.trimStart().startsWith('+');
  const hasCountryCode = /^998\d{9}$/.test(digits);
  const validPhone = /^[+\d\s().-]+$/.test(phone.value) && (hasLocalNumber || hasCountryCode);

  nameField.setCustomValidity(nameField.value.trim() ? '' : 'Введите ваше имя.');
  phone.setCustomValidity(validPhone ? '' : 'Введите номер в формате +998 XX XXX-XX-XX.');

  if (form.reportValidity()) {
    status.textContent = 'Данные проверены. В режиме предпросмотра отправка заявки недоступна.';
  }
});

form.querySelector('button').disabled = false;
