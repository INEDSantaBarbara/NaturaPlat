import { test, expect } from '@playwright/test';

test('la página carga sin errores y con un solo h1', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle(/NaturaPlát/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Platos desechables');
  expect(errors).toEqual([]);
});

test('la navegación lleva a cada sección', async ({ page }) => {
  await page.goto('/');

  await page.locator('.site-nav a[href="#productos"]').click();
  await expect(page).toHaveURL(/#productos$/);
  await expect(page.locator('#productos')).toBeInViewport();
});

test('el acordeón de preguntas abre y cierra', async ({ page }) => {
  await page.goto('/');

  const button = page.locator('#acc1');
  const panel = page.locator('#accp1');

  await expect(panel).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
});

test('el menú móvil se abre, navega y se cierra', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const toggle = page.locator('#menuToggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#siteNav')).toHaveClass(/open/);

  await page.locator('#siteNav a[href="#nosotros"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#nosotros$/);
});

test('no hay desplazamiento horizontal en las cinco medidas del estándar', async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflow, `desborde horizontal en ${size.width}×${size.height}`).toBe(false);
  }
});
