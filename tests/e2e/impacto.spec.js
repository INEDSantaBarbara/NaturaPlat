import { test, expect } from '@playwright/test';

const setRange = async (page, selector, value) => {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};

test('el plato por defecto compara duroport y NaturaPlát', async ({ page }) => {
  await page.goto('/#s-impacto-plato');

  await expect(page.locator('#imp-eps-total')).toHaveText('37.4');
  await expect(page.locator('#imp-eps-prod')).toHaveText('28.7 g');
  await expect(page.locator('#imp-eps-burn')).toHaveText('8.7 g');
  await expect(page.locator('#imp-leaf-total')).toHaveText('5.0');
  await expect(page.locator('#imp-save')).toHaveText('32.4 g CO₂e');
  await expect(page.locator('#imp-save-pct')).toContainText('87');
  await expect(page.locator('#imp-bar-leaf')).toHaveAttribute('style', /width/);
});

test('los supuestos recalculan el plato y el escenario', async ({ page }) => {
  await page.goto('/#s-impacto-supuestos');

  await setRange(page, '#imp-burn', 0);
  await expect(page.locator('#imp-o-burn')).toHaveText('0.0 %');
  await expect(page.locator('#imp-eps-total')).toHaveText('28.7');
  await expect(page.locator('#imp-eps-burn')).toHaveText('0.0 g');

  await page.selectOption('#imp-leaf', 'artesanal');
  await expect(page.locator('#imp-leaf-total')).toHaveText('1.0');
  await expect(page.locator('#imp-save')).toHaveText('27.7 g CO₂e');
  await expect(page.locator('#imp-leaf-hint')).toContainText('prensa manual');

  await setRange(page, '#imp-mass', 12);
  await expect(page.locator('#imp-o-mass')).toHaveText('12 g');
  await expect(page.locator('#imp-eps-total')).toHaveText('57.4');
});

test('la persona se simula y el gráfico tiene dos series', async ({ page }) => {
  await page.goto('/#s-impacto-persona');

  await expect(page.locator('#imp-person-chart path')).toHaveCount(2);
  await expect(page.locator('#imp-person-eps')).toContainText('kg');

  await page.locator('#imp-play').click();
  await expect(page.locator('#imp-person-flag')).toContainText('Simulando');
  await expect(page.locator('#imp-person-flag')).toContainText('Resultado', { timeout: 3000 });

  await page.locator('#imp-end').click();
  await expect(page.locator('#imp-person-flag')).toHaveText('Resultado a diciembre de 2032.');
});

test('el territorio cambia de población y actualiza la tabla', async ({ page }) => {
  await page.goto('/#s-impacto-territorio');

  await expect(page.locator('#imp-table-body tr')).toHaveCount(6);
  await expect(page.locator('#imp-k-pop')).not.toHaveText('—');

  await page.locator('.segment button[data-terr="gt"]').click();
  await expect(page.locator('.segment button[data-terr="gt"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.locator('#imp-k-pop')).toContainText('M');
  await expect(page.locator('#imp-pop-note')).toContainText('Guatemala');

  await setRange(page, '#imp-adopt', 30);
  await expect(page.locator('#imp-table-body tr').last().locator('td').nth(2)).toHaveText('30.0 %');
});

test('las fuentes conservan diez referencias enlazadas', async ({ page }) => {
  await page.goto('/#s-impacto-fuentes');
  const sources = page.locator('.sources li');
  await expect(sources).toHaveCount(10);
  for (let index = 0; index < 10; index += 1) {
    await expect(sources.nth(index).locator('a').first()).toHaveAttribute('href', /^https?:\/\//);
  }
});
