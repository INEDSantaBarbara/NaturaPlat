/**
 * Galería incrustada del héroe: una foto a la vez, con transición automática,
 * flechas, puntos y pausa. Se detiene con `prefers-reduced-motion`.
 */

export function initGallery() {
  const root = document.getElementById('heroGallery');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.gallery-slide'));
  const dots = document.getElementById('galleryDots');
  const caption = document.getElementById('galleryCaption');
  const index = document.getElementById('galleryIndex');
  const previous = document.getElementById('galleryPrev');
  const next = document.getElementById('galleryNext');
  const toggle = document.getElementById('galleryToggle');
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let timer = null;
  let paused = reduced;

  const pad = (value) => String(value).padStart(2, '0');

  for (const [position, slide] of slides.entries()) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver foto ${position + 1}: ${slide.dataset.title}`);
    dot.addEventListener('click', () => {
      show(position);
      restart();
    });
    dots.appendChild(dot);
  }

  function show(position) {
    current = (position + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    caption.textContent = slides[current].dataset.title;
    index.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    Array.from(dots.children).forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    if (!paused) timer = window.setInterval(() => show(current + 1), 4500);
  }

  function restart() {
    if (!paused) start();
  }

  function play() {
    paused = false;
    toggle.textContent = '❚❚';
    toggle.setAttribute('aria-label', 'Pausar galería');
    start();
  }

  function pause() {
    paused = true;
    toggle.textContent = '▶';
    toggle.setAttribute('aria-label', 'Reproducir galería');
    stop();
  }

  previous.addEventListener('click', () => {
    show(current - 1);
    restart();
  });

  next.addEventListener('click', () => {
    show(current + 1);
    restart();
  });

  toggle.addEventListener('click', () => {
    if (paused) play();
    else pause();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', () => {
    if (!paused) start();
  });
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget) && !paused) start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!paused) start();
  });

  document.addEventListener('slidechange', (event) => {
    if (event.detail?.chapter === 'inicio') {
      if (!paused) start();
    } else {
      stop();
    }
  });

  show(0);
  if (reduced) pause();
  else play();
}
