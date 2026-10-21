import { submitLead } from './lead.js';

(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  const closeMenu = () => {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.querySelectorAll('a[href="#signup"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      closeMenu();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector('#signup').scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
      document.querySelector('#hero-name').focus({ preventScroll: true });
    });
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const move = (direction, edge) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const card = track.firstElementChild;
      const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      const target = edge === 'start' ? 0 : edge === 'end' ? track.scrollWidth - track.clientWidth : track.scrollLeft + direction * step;
      track.scrollTo({ left: target, behavior: reduced ? 'instant' : 'smooth' });
    };
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1, event.key === 'Home' ? 'start' : event.key === 'End' ? 'end' : undefined);
      }
    });
    let drag;
    track.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button, input')) return;
      drag = { x: event.clientX, left: track.scrollLeft, pointer: event.pointerId, active: false };
    });
    track.addEventListener('pointermove', event => {
      if (!drag || drag.pointer !== event.pointerId) return;
      const delta = event.clientX - drag.x;
      if (!drag.active && Math.abs(delta) < 6) return;
      if (!drag.active) {
        drag.active = true;
        track.classList.add('is-dragging');
        track.setPointerCapture(event.pointerId);
        window.getSelection()?.removeAllRanges();
      }
      event.preventDefault();
      track.scrollLeft = drag.left - delta;
    });
    const endDrag = () => {
      drag = null;
      track.classList.remove('is-dragging');
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);
    track.addEventListener('pointerleave', () => { if (drag && !drag.active) endDrag(); });
  });

  const audienceSwitcher = document.querySelector('[data-audience-switcher]');
  if (audienceSwitcher) {
    const cards = [...audienceSwitcher.querySelectorAll('.audience-picture')];
    const next = audienceSwitcher.querySelector('.audience-next');
    const pagination = audienceSwitcher.querySelector('.audience-pagination');
    const dots = [...pagination.children];
    const status = audienceSwitcher.querySelector('#audience-status');
    const mobile = window.matchMedia('(max-width: 680px)');
    let current = 0;
    const renderAudience = () => {
      cards.forEach((card, index) => {
        const inactive = mobile.matches && index !== current;
        card.classList.toggle('is-inactive', inactive);
        card.inert = inactive;
        if (inactive) card.setAttribute('aria-hidden', 'true');
        else card.removeAttribute('aria-hidden');
      });
      next.hidden = !mobile.matches;
      pagination.hidden = !mobile.matches;
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
      status.textContent = mobile.matches
        ? `Карточка ${current + 1} из ${cards.length}: ${cards[current].querySelector('h3').textContent}`
        : '';
    };
    next.addEventListener('click', () => {
      current = (current + 1) % cards.length;
      renderAudience();
    });
    mobile.addEventListener('change', () => { current = 0; renderAudience(); });
    renderAudience();
  }

  document.querySelectorAll('[data-exclusive-accordion]').forEach(accordion => {
    const cards = [...accordion.querySelectorAll('details')];
    cards.forEach(card => {
      card.addEventListener('toggle', () => {
        if (card.open) cards.forEach(other => { if (other !== card) other.open = false; });
      });
      card.querySelector('.curriculum-content').addEventListener('click', event => {
        if (!event.target.closest('a, button, input')) card.open = false;
      });
    });
  });

  document.querySelectorAll('.signup-form').forEach(form => {
    const feedback = form.querySelector('.form-feedback');
    const setError = (input, message) => {
      const error = document.getElementById(input.getAttribute('aria-describedby'));
      error.textContent = message;
      input.setAttribute('aria-invalid', String(Boolean(message)));
    };
    const validate = () => {
      const { name, phone, consent } = form.elements;
      const digits = phone.value.replace(/\D/g, '');
      setError(name, name.value.trim().length < 2 ? 'Введите имя — не менее двух символов.' : '');
      setError(phone, !/^\+?[\d\s()\-]+$/.test(phone.value.trim()) || !/^[78]\d{10}$/.test(digits) ? 'Введите номер: +7 и 10 цифр, например +7 (705) 123-45-67.' : '');
      setError(consent, !consent.checked ? 'Подтвердите согласие на обработку данных.' : '');
      return form.querySelector('[aria-invalid="true"]');
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      feedback.hidden = true;
      const invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }
      // Отправка в приёмщик заявок (lead.js); при успехе — страница «Спасибо» с меткой, конверсии считаются там.
      const submit = form.querySelector('button[type="submit"]');
      const label = submit.textContent;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Отправляем…';
      const { name, phone, website } = form.elements;
      const result = await submitLead({ name: name.value, phone: phone.value, consent: true, website: website ? website.value : '' });
      if (result.ok && result.thanks) {
        location.assign(new URL('spasibo/?t=' + encodeURIComponent(result.thanks), document.baseURI));
        return;
      }
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      submit.textContent = label;
      feedback.textContent = result.message;
      feedback.hidden = false;
    });
    form.addEventListener('input', event => {
      feedback.hidden = true;
      if (event.target.getAttribute('aria-invalid') === 'true') setError(event.target, '');
    });
    form.addEventListener('change', () => { feedback.hidden = true; });
  });
})();
