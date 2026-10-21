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

  const formatSwitcher = document.querySelector('[data-format-switcher]');
  if (formatSwitcher) {
    const track = formatSwitcher.querySelector('#format-track');
    const cards = [...track.querySelectorAll('.format-folder')];
    const pagination = formatSwitcher.querySelector('.format-pagination');
    const dots = [...pagination.querySelectorAll('[data-format-index]')];
    const status = formatSwitcher.querySelector('#format-status');
    const mobile = window.matchMedia('(max-width: 680px)');
    const before = cards[cards.length - 1].cloneNode(true);
    const after = cards[0].cloneNode(true);
    [before, after].forEach(clone => {
      clone.dataset.formatClone = '';
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
    });
    track.prepend(before);
    track.append(after);
    let current = 0;
    let settleTimer;
    let frame;
    let dragging;
    const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const render = index => {
      if (!Number.isFinite(index)) return;
      current = (index + cards.length) % cards.length;
      dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
      const text = mobile.matches ? `Формат ${current + 1} из ${cards.length}: ${cards[current].querySelector('h3').textContent}` : '';
      if (status.textContent !== text) status.textContent = text;
    };
    const jump = slot => track.scrollTo({ left: slot * step(), behavior: 'instant' });
    const settle = () => {
      if (!track.isConnected || !mobile.matches || dragging || step() <= 0) return;
      const slot = Math.round(track.scrollLeft / step());
      if (slot === 0) jump(cards.length);
      else if (slot === cards.length + 1) jump(1);
      render(slot - 1);
    };
    const go = index => {
      if (!mobile.matches) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: (index + 1) * step(), behavior: reduced ? 'instant' : 'smooth' });
    };
    const layout = () => {
      if (!track.isConnected) return;
      clearTimeout(settleTimer);
      before.hidden = after.hidden = !mobile.matches;
      pagination.hidden = !mobile.matches;
      track.tabIndex = mobile.matches ? 0 : -1;
      if (mobile.matches) jump(current + 1);
      else track.scrollLeft = 0;
      render(current);
    };
    track.addEventListener('scroll', () => {
      if (!track.isConnected || !mobile.matches || step() <= 0) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => render(Math.round(track.scrollLeft / step()) - 1));
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
    }, { passive: true });
    track.addEventListener('scrollend', settle);
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    track.addEventListener('keydown', event => {
      if (!mobile.matches || event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : current + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    track.addEventListener('pointerdown', event => {
      if (!mobile.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = { x: event.clientX, left: track.scrollLeft, id: event.pointerId };
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    });
    track.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== dragging.id) return;
      event.preventDefault();
      track.scrollLeft = dragging.left + dragging.x - event.clientX;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = null;
      track.classList.remove('is-dragging');
      go(current);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);
    mobile.addEventListener('change', layout);
    window.addEventListener('resize', layout);
    layout();
  }

  const audienceSwitcher = document.querySelector('[data-audience-switcher]');
  if (audienceSwitcher) {
    const track = audienceSwitcher.querySelector('#audience-track');
    const cards = [...track.querySelectorAll('.audience-picture')];
    const pagination = audienceSwitcher.querySelector('.audience-pagination');
    const dots = [...pagination.children];
    const status = audienceSwitcher.querySelector('#audience-status');
    const mobile = window.matchMedia('(max-width: 680px)');
    const update = () => {
      const bounds = track.getBoundingClientRect();
      let current = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const offset = Math.abs(card.getBoundingClientRect().left - bounds.left);
        if (offset < distance) { distance = offset; current = index; }
      });
      pagination.hidden = !mobile.matches;
      track.tabIndex = mobile.matches ? 0 : -1;
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
      const text = mobile.matches ? `Карточка ${current + 1} из ${cards.length}: ${cards[current].querySelector('h3').textContent}` : '';
      if (status.textContent !== text) status.textContent = text;
    };
    let frame;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    mobile.addEventListener('change', () => { track.scrollLeft = 0; update(); });
    window.addEventListener('resize', update);
    update();
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

