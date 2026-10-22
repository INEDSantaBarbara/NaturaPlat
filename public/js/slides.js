/**
 * Motor del recorrido: capítulos, diapositivas, foco, teclado y gesto.
 *
 * Reglas MILAB: sin scroll de página, ubicación visible y el usuario controla.
 * Las diapositivas inactivas quedan con `inert` y `aria-hidden`.
 */

const CHAPTERS = {
  inicio: 'Inicio',
  problema: 'Problema',
  producto: 'Producto',
  proceso: 'Proceso',
  impacto: 'Impacto',
  equipo: 'Equipo',
  cierre: 'Cierre',
};

export function initSlides() {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const chapters = Array.from(document.querySelectorAll('.chap'));
  const stage = document.getElementById('stage');
  const whereText = document.getElementById('whereText');
  const dots = document.getElementById('dots');
  const previousButton = document.getElementById('btnPrev');
  const nextButton = document.getElementById('btnNext');
  const progress = document.getElementById('progress');
  const live = document.getElementById('live');

  if (!slides.length || !stage) return;

  let current = -1;

  const chapterOf = (slide) => slide.dataset.chapter;
  const chapterName = (slide) => CHAPTERS[chapterOf(slide)] ?? '';
  const slidesOf = (chapter) =>
    slides
      .map((slide, index) => ({ slide, index }))
      .filter(({ slide }) => chapterOf(slide) === chapter);

  function target(hash) {
    if (!hash) return 0;
    const byId = slides.findIndex((slide) => slide.id === hash);
    if (byId >= 0) return byId;
    const byChapter = slides.findIndex((slide) => chapterOf(slide) === hash);
    if (byChapter >= 0) return byChapter;
    const element = document.getElementById(hash);
    const section = element?.closest?.('.slide');
    return section ? slides.indexOf(section) : -1;
  }

  function renderDots(chapter, activeIndex) {
    const list = slidesOf(chapter);
    dots.replaceChildren();
    list.forEach(({ slide, index }, position) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute(
        'aria-label',
        `Ir a la diapositiva ${position + 1}: ${slide.getAttribute('aria-label')}`
      );
      button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
      button.addEventListener('click', () => go(index));
      dots.appendChild(button);
    });
  }

  function renderWhere(slide) {
    const list = slidesOf(chapterOf(slide));
    const position = list.findIndex(({ slide: item }) => item === slide);
    whereText.replaceChildren();
    const chapter = document.createElement('b');
    chapter.textContent = chapterName(slide);
    whereText.append(chapter, ` · ${position + 1} de ${list.length}`);
  }

  function activateTab(slide) {
    for (const tab of chapters) {
      const active = tab.dataset.chapter === chapterOf(slide);
      tab.setAttribute('aria-current', active ? 'true' : 'false');
      if (active) {
        const container = tab.parentElement;
        const left = tab.offsetLeft - container.offsetLeft;
        if (
          left < container.scrollLeft ||
          left + tab.offsetWidth > container.scrollLeft + container.clientWidth
        ) {
          container.scrollLeft = left - (container.clientWidth - tab.offsetWidth) / 2;
        }
      }
    }
  }

  function go(index, options = {}) {
    const { noHash = false, focus = true } = options;
    if (index < 0 || index >= slides.length || index === current) return;

    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('is-before', position < index);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) slide.removeAttribute('inert');
      else slide.setAttribute('inert', '');
    });

    current = index;
    const slide = slides[index];
    stage.dataset.tone = slide.dataset.tone ?? 'dark';
    activateTab(slide);
    renderWhere(slide);
    renderDots(chapterOf(slide), index);
    previousButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1;
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    slide.scrollTop = 0;

    if (!noHash) history.replaceState(null, '', `#${slide.id}`);

    if (live) {
      live.textContent = `${chapterName(slide)}, diapositiva ${index + 1} de ${slides.length}: ${slide.getAttribute('aria-label')}`;
    }

    document.dispatchEvent(
      new CustomEvent('slidechange', {
        detail: { id: slide.id, chapter: chapterOf(slide) },
      })
    );

    if (focus) {
      const heading = slide.querySelector('h1, h2');
      heading?.focus({ preventScroll: true });
    }
  }

  const next = () => go(current + 1);
  const previousSlide = () => go(current - 1);

  previousButton.addEventListener('click', previousSlide);
  nextButton.addEventListener('click', next);

  for (const tab of chapters) {
    tab.addEventListener('click', () => {
      const first = slidesOf(tab.dataset.chapter)[0];
      if (first) go(first.index);
    });
  }

  document.addEventListener('click', (event) => {
    const goButton = event.target.closest('[data-go]');
    if (goButton) {
      event.preventDefault();
      if (goButton.dataset.go === 'next') next();
      else if (goButton.dataset.go === 'prev') previousSlide();
      return;
    }

    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const index = target(decodeURIComponent(anchor.getAttribute('href').slice(1)));
    if (index >= 0) {
      event.preventDefault();
      go(index);
    }
  });

  document.addEventListener('keydown', (event) => {
    const tag = (event.target.tagName || '').toLowerCase();
    if (['input', 'select', 'textarea', 'summary'].includes(tag)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      previousSlide();
    } else if (event.key === 'Home') {
      event.preventDefault();
      go(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      go(slides.length - 1);
    }
  });

  let startX = null;
  let startY = null;
  stage.addEventListener(
    'touchstart',
    (event) => {
      if (event.target.closest('input, select, textarea, canvas, .chart, .table-wrap, .formula')) {
        startX = null;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );
  stage.addEventListener(
    'touchend',
    (event) => {
      if (startX === null) return;
      const deltaX = event.changedTouches[0].clientX - startX;
      const deltaY = event.changedTouches[0].clientY - startY;
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) next();
        else previousSlide();
      }
      startX = null;
    },
    { passive: true }
  );

  window.addEventListener('hashchange', () => {
    const index = target(decodeURIComponent(window.location.hash.slice(1)));
    if (index >= 0) go(index, { noHash: true });
  });

  const initial = target(decodeURIComponent(window.location.hash.slice(1)));
  go(initial >= 0 ? initial : 0, { noHash: true });

  return { go, next, previous: previousSlide };
}
