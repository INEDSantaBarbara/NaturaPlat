/**
 * Video del producto: se reproduce solo cuando su diapositiva está activa,
 * se pausa al salir y respeta prefers-reduced-motion. El botón permite
 * pausar o reanudar en cualquier momento.
 */

export function initProductVideo() {
  const video = document.getElementById('productVideo');
  const toggle = document.getElementById('videoToggle');
  if (!video || !toggle) return;

  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let manuallyPaused = reduced;

  function update() {
    const playing = !video.paused;
    toggle.textContent = playing ? '❚❚' : '▶';
    toggle.setAttribute('aria-label', playing ? 'Pausar video' : 'Reproducir video');
  }

  function play() {
    video
      .play()
      .then(() => {
        manuallyPaused = false;
        update();
      })
      .catch(() => update());
  }

  function pause() {
    video.pause();
    manuallyPaused = true;
    update();
  }

  toggle.addEventListener('click', () => {
    if (video.paused) play();
    else pause();
  });

  video.addEventListener('play', update);
  video.addEventListener('pause', update);

  document.addEventListener('slidechange', (event) => {
    if (event.detail?.id === 's-producto-detalle') {
      if (!manuallyPaused && !reduced) play();
    } else {
      video.pause();
    }
  });

  const active = document.querySelector('.slide.is-active');
  if (active?.id === 's-producto-detalle' && !reduced) play();
  else video.pause();
  update();
}
