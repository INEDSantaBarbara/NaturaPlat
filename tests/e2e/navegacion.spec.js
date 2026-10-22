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
  await expect(page.locator('.slide')).toHaveCount(17);
  await expect(page.locator('.chap')).toHaveCount(7);
  expect(errors).toEqual([]);
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
