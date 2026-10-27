/**
 * Galería del producto: un solo cuadro que alterna el video y tres fotos de
 * estudio. Avanza sola cuando su diapositiva está activa, se puede recorrer con
 * flechas o puntos, y se detiene con `prefers-reduced-motion`.
 */

const PHOTO_DELAY = 5000;
const VIDEO_DELAY = 8000;

export function initProductGallery() {
  const root = document.getElementById('productGallery');
  if (!root) return;

  const section = document.getElementById('s-producto-detalle');
  const slides = Array.from(root.querySelectorAll('.gallery-slide'));
  const video = root.querySelector('video');
  const dots = document.getElementById('productDots');
  const caption = document.getElementById('productCaption');
  const index = document.getElementById('productIndex');
  const previous = document.getElementById('productPrev');
  const next = document.getElementById('productNext');
  const toggle = document.getElementById('productToggle');
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let timer = null;
  let paused = reduced;
  let active = Boolean(section?.classList.contains('is-active'));

  const pad = (value) => String(value).padStart(2, '0');

  for (const [position, slide] of slides.entries()) {
    const dot = document.createElement('button');
    dot.type = 'button';
    const kind = slide.dataset.kind === 'video' ? 'video' : 'foto';
    const title = slide.dataset.title.replace(/^Video · /, '');
    dot.setAttribute('aria-label', `Ver ${kind} ${position + 1}: ${title}`);
    dot.addEventListener('click', () => {
      show(position);
      restart();
    });
    dots.appendChild(dot);
  }

  function syncVideo() {
    if (!video) return;
    const visible = slides[current].contains(video);
    if (visible && active && !paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function show(position) {
    current = (position + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === current;
      slide.classList.toggle('is-active', isCurrent);
      slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
    });
    caption.textContent = slides[current].dataset.title;
    index.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    Array.from(dots.children).forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
    syncVideo();
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule() {
    stop();
    if (paused || !active) return;
    const delay = slides[current].dataset.kind === 'video' ? VIDEO_DELAY : PHOTO_DELAY;
    timer = window.setTimeout(() => {
      show(current + 1);
      schedule();
    }, delay);
  }

  function restart() {
    schedule();
  }

  function play() {
    paused = false;
    toggle.textContent = '❚❚';
    toggle.setAttribute('aria-label', 'Pausar galería');
    syncVideo();
    schedule();
  }

  function pause() {
    paused = true;
    toggle.textContent = '▶';
    toggle.setAttribute('aria-label', 'Reproducir galería');
    stop();
    video?.pause();
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
  root.addEventListener('mouseleave', restart);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) restart();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      video?.pause();
    } else if (active) {
      syncVideo();
      schedule();
    }
  });

  document.addEventListener('slidechange', (event) => {
    active = event.detail?.id === 's-producto-detalle';
    if (active) {
      syncVideo();
      schedule();
    } else {
      stop();
      video?.pause();
    }
  });

  show(0);
  if (reduced) pause();
  else if (active) play();
  else video?.pause();
}
