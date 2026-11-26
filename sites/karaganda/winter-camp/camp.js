const ageButtons = document.querySelectorAll('[data-group]');

for (const button of ageButtons) {
  button.addEventListener('click', () => {
    for (const option of ageButtons) {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      document.getElementById(option.dataset.group).hidden = !selected;
    }
  });
}

const programDownload = document.querySelector('.program-download');
const downloadStatus = document.querySelector('.download-status');

programDownload.addEventListener('click', async (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (programDownload.hasAttribute('aria-busy')) return;

  programDownload.setAttribute('aria-busy', 'true');
  downloadStatus.textContent = 'Загружаем PDF…';
  downloadStatus.hidden = false;

  try {
    const response = await fetch(programDownload.href);
    if (!response.ok) throw new Error('PDF download failed');

    const pdf = await response.blob();
    if (await pdf.slice(0, 5).text() !== '%PDF-') {
      throw new Error('Invalid PDF response');
    }

    const objectUrl = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = programDownload.download;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    downloadStatus.hidden = true;
  } catch {
    downloadStatus.textContent = 'Не удалось скачать PDF. Попробуйте ещё раз.';
  } finally {
    programDownload.removeAttribute('aria-busy');
  }
});

const mobileLayout = window.matchMedia('(max-width: 849.98px)');

for (const [index, course] of document.querySelectorAll('.course').entries()) {
  const heading = course.querySelector('h3');
  const days = course.querySelector('.days');
  const title = heading.textContent;
  const toggle = document.createElement('button');

  days.id = `course-days-${index + 1}`;
  toggle.type = 'button';
  toggle.className = 'course-toggle';
  toggle.textContent = title;
  toggle.setAttribute('aria-controls', days.id);
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    days.hidden = expanded;
  });

  const syncCourseLayout = () => {
    heading.replaceChildren(mobileLayout.matches ? toggle : title);
    days.hidden = mobileLayout.matches && toggle.getAttribute('aria-expanded') === 'false';
  };

  mobileLayout.addEventListener('change', syncCourseLayout);
  syncCourseLayout();
}

const siteHeader = document.querySelector('.site-header');
const navToggle = siteHeader.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

function setNavigation(expanded) {
  navToggle.setAttribute('aria-expanded', String(expanded));
  siteNav.hidden = mobileLayout.matches && !expanded;
}

function syncNavigation() {
  navToggle.hidden = !mobileLayout.matches;
  setNavigation(false);
}

navToggle.addEventListener('click', () => {
  setNavigation(siteNav.hidden);
});

siteNav.addEventListener('click', (event) => {
  if (mobileLayout.matches && event.target.closest('a')) setNavigation(false);
});

document.addEventListener('click', (event) => {
  if (!siteHeader.contains(event.target)) setNavigation(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileLayout.matches && !siteNav.hidden) {
    setNavigation(false);
    navToggle.focus();
  }
});

mobileLayout.addEventListener('change', syncNavigation);
syncNavigation();
