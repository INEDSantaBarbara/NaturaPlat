import { test, expect } from '@playwright/test';

const openGuide = async (page) => {
  await page.goto('/');
  await page.locator('#guideTab').click();
  await expect(page.locator('#guideDrawer')).toBeVisible();
};

test('abre el panel, responde local y cierra con Escape', async ({ page }) => {
  let apiCalls = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/chat')) apiCalls += 1;
  });

  await openGuide(page);
  await expect(page.locator('#guideInput')).toBeFocused();
  await expect(page.locator('.guide-msg--bot').first()).toContainText('Soy la guía');

  await page.getByRole('button', { name: '¿Cuánto mide?' }).click();
  await expect(page.locator('.guide-msg--bot').last()).toContainText('14 cm de ancho');
  await page.waitForTimeout(500);
  expect(apiCalls).toBe(0);

  await page.keyboard.press('Escape');
  await expect(page.locator('#guideDrawer')).toBeHidden();
  await expect(page.locator('#guideTab')).toBeFocused();
});

test('consulta al modelo solo cuando no hay respuesta local', async ({ page }) => {
  let payload = null;
  await page.route('**/api/chat', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'Respuesta de prueba' }),
    });
  });

  await openGuide(page);
  await page.locator('#guideInput').fill('¿Qué opinás del fútbol?');
  await page.locator('#guideSend').click();

  await expect(page.locator('.guide-msg--bot').last()).toHaveText('Respuesta de prueba');
  expect(payload.messages.at(-1)).toEqual({ role: 'user', content: '¿Qué opinás del fútbol?' });
});

test('muestra un respaldo si la API limita o falla', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'rate_limited' }),
    })
  );

  await openGuide(page);
  await page.locator('#guideInput').fill('¿Qué opinás del fútbol?');
  await page.locator('#guideSend').click();

  await expect(page.locator('.guide-msg--bot').last()).toContainText('muchas preguntas');
  await expect(page.locator('#guideSend')).toBeEnabled();
});

test('responde 503 como guía no configurada', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'unavailable' }),
    })
  );

  await openGuide(page);
  await page.locator('#guideInput').fill('¿Qué opinás del fútbol?');
  await page.locator('#guideSend').click();

  await expect(page.locator('.guide-msg--bot').last()).toContainText('no está configurada');
});
