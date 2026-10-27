import { test, expect } from '@playwright/test';

test('la página carga sin errores y con un solo h1', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/NaturaPlát/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.slide')).toHaveCount(18);
  await expect(page.locator('.chap')).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('la galería del inicio cambia de foto y se puede pausar', async ({ page }) => {
  await page.goto('/');
  await page.locator('#galleryToggle').click();
  await expect(page.locator('#galleryToggle')).toHaveAttribute('aria-label', 'Reproducir galería');
  await expect(page.locator('#heroGallery .gallery-slide')).toHaveCount(4);
  await expect(page.locator('#heroGallery .gallery-slide.is-active')).toHaveCount(1);

  await page.locator('#galleryDots button').first().click();
  await expect(page.locator('#galleryCaption')).toHaveText('Sesión de producto');
  await expect(page.locator('#galleryIndex')).toHaveText('01 / 04');

  await page.locator('#galleryNext').click();
  await expect(page.locator('#galleryCaption')).toHaveText('Plato terminado · 14 × 20 cm');
  await expect(page.locator('#galleryIndex')).toHaveText('02 / 04');

  await page.locator('#galleryDots button').nth(3).click();
  await expect(page.locator('#galleryCaption')).toHaveText('Equipo MILAB');
  await expect(page.locator('#galleryIndex')).toHaveText('04 / 04');
});

test('la galería del producto alterna el video y las fotos', async ({ page }) => {
  await page.goto('/#s-producto-detalle');

  const video = page.locator('#productVideo');
  await expect(video).toBeVisible();
  await expect(page.locator('#productCaption')).toHaveText('Video · el plato gira');
  await expect(page.locator('#productIndex')).toHaveText('01 / 04');
  await expect(video).toHaveJSProperty('paused', false);
  await expect(page.locator('#productToggle')).toHaveAttribute('aria-label', 'Pausar galería');

  await page.locator('#productNext').click();
  await expect(page.locator('#productCaption')).toHaveText('Dos piezas, una misma hoja');
  await expect(video).toHaveJSProperty('paused', true);

  await page.locator('#productPrev').click();
  await expect(page.locator('#productCaption')).toHaveText('Video · el plato gira');
  await expect(video).toHaveJSProperty('paused', false);

  await page.locator('#btnNext').click();
  await page.locator('#btnPrev').click();
  await expect(video).toHaveJSProperty('paused', false);

  await page.locator('#productToggle').click();
  await expect(page.locator('#productToggle')).toHaveAttribute('aria-label', 'Reproducir galería');
  await expect(video).toHaveJSProperty('paused', true);

  await page.locator('#productNext').click();
  await page.locator('#productPrev').click();
  await expect(video).toHaveJSProperty('paused', true);
});

test('la galería del producto cabe en las cinco medidas sin scroll interno', async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/#s-producto-detalle');
    const metrics = await page.evaluate(() => {
      const slide = document.getElementById('s-producto-detalle');
      const stage = document.querySelector('#productGallery .gallery-stage');
      const media = stage.querySelector(
        '.gallery-slide.is-active img, .gallery-slide.is-active video'
      );
      const box = media.getBoundingClientRect();
      return {
        overflow: slide.scrollHeight - slide.clientHeight,
        stageWidth: stage.getBoundingClientRect().width,
        slideWidth: slide.clientWidth,
        fitX: Math.abs(box.width - stage.clientWidth),
        fitY: Math.abs(box.height - stage.clientHeight),
      };
    });
    expect(metrics.overflow, `${size.width}x${size.height}`).toBeLessThanOrEqual(1);
    expect(metrics.stageWidth, `${size.width}x${size.height}`).toBeLessThanOrEqual(
      metrics.slideWidth
    );
    expect(metrics.fitX, `${size.width}x${size.height}`).toBeLessThanOrEqual(1);
    expect(metrics.fitY, `${size.width}x${size.height}`).toBeLessThanOrEqual(1);
  }
});

test('las pestañas cambian de capítulo y actualizan la ubicación', async ({ page }) => {
  await page.goto('/');
  await page.locator('.chap[data-chapter="impacto"]').click();

  await expect(page).toHaveURL(/#s-impacto-plato$/);
  await expect(page.locator('#s-impacto-plato')).toHaveClass(/is-active/);
  await expect(page.locator('.chap[data-chapter="impacto"]')).toHaveAttribute(
    'aria-current',
    'true'
  );
  await expect(page.locator('#whereText')).toContainText('Impacto');
  await expect(page.locator('#whereText')).toContainText('1 de 7');
  await expect(page.locator('#s-impacto-plato h2')).toBeFocused();
});

test('siguiente y anterior recorren las diapositivas', async ({ page }) => {
  await page.goto('/');

  await page.locator('#btnNext').click();
  await expect(page).toHaveURL(/#s-problema-cifras$/);
  await expect(page.locator('#s-problema-cifras')).toHaveClass(/is-active/);

  await page.locator('#btnPrev').click();
  await expect(page).toHaveURL(/#s-inicio-portada$/);
  await expect(page.locator('#btnPrev')).toBeDisabled();
});

test('el teclado mueve, va al final y vuelve al inicio', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#s-problema-cifras$/);

  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#s-inicio-portada$/);

  await page.keyboard.press('End');
  await expect(page).toHaveURL(/#s-cierre$/);

  await page.keyboard.press('Home');
  await expect(page).toHaveURL(/#s-inicio-portada$/);
});

test('los puntos saltan dentro del capítulo', async ({ page }) => {
  await page.goto('/#s-impacto-plato');

  await page.locator('#dots button').nth(2).click();
  await expect(page).toHaveURL(/#s-impacto-persona$/);
  await expect(page.locator('#dots button').nth(2)).toHaveAttribute('aria-current', 'true');
});

test('los enlaces directos y el hash abren la diapositiva correcta', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver impacto' }).click();
  await expect(page).toHaveURL(/#s-impacto-plato$/);

  await page.goto('/#s-impacto-fuentes');
  await expect(page.locator('#s-impacto-fuentes')).toHaveClass(/is-active/);
  await expect(page.locator('#whereText')).toContainText('7 de 7');
});

test('las diapositivas inactivas quedan inertes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#s-problema-cifras')).toHaveAttribute('inert', '');
  await expect(page.locator('#s-inicio-portada')).not.toHaveAttribute('inert', '');
  await expect(page.locator('#s-problema-cifras')).toHaveAttribute('aria-hidden', 'true');
});

test('no hay scroll de página ni desborde en las cinco medidas', async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(metrics.scrollWidth, `${size.width}x${size.height}`).toBeLessThanOrEqual(
      metrics.innerWidth + 1
    );
    expect(metrics.scrollHeight, `${size.width}x${size.height}`).toBeLessThanOrEqual(
      metrics.innerHeight + 1
    );
  }
});
