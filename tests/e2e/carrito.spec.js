import { test, expect } from '@playwright/test';

const addTray = async (page) => {
  await page.goto('/#s-producto-catalogo');
  await page.locator('.product-card[data-product="2"] .add').click();
};

test('agregar abre el panel, suma y enfoca el cierre', async ({ page }) => {
  await addTray(page);

  await expect(page.locator('#cartDrawer')).toBeVisible();
  await expect(page.locator('#cartCount')).toHaveText('1');
  await expect(page.locator('#cartSubtotal')).toHaveText('Q149');
  await expect(page.locator('#cartClose')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('#cartDrawer')).toBeHidden();
});

test('las variantes y cantidades actualizan el subtotal', async ({ page }) => {
  await page.goto('/#s-producto-catalogo');
  await page.locator('.product-card[data-product="1"] .variant[data-variant="pack100"]').click();
  await page.locator('.product-card[data-product="1"] .add').click();

  await expect(page.locator('#cartSubtotal')).toHaveText('Q390');
  await page.getByRole('button', { name: 'Aumentar cantidad' }).click();
  await expect(page.locator('#cartCount')).toHaveText('2');
  await expect(page.locator('#cartSubtotal')).toHaveText('Q780');

  await page.getByRole('button', { name: 'Quitar' }).click();
  await expect(page.locator('#cartEmpty')).toBeVisible();
  await expect(page.locator('#cartFoot')).toBeHidden();
  await expect(page.locator('#cartCount')).toBeHidden();
});

test('el checkout valida y confirma un pedido de demostración', async ({ page }) => {
  await addTray(page);
  await page.locator('#cartCheckout').click();

  await expect(page.locator('#checkoutModal')).toBeVisible();
  await page.locator('#checkoutForm button[type="submit"]').click();
  await expect(page.locator('#checkoutError')).toBeVisible();
  await expect(page.locator('#checkoutForm input[name="nombre"]')).toHaveAttribute(
    'aria-invalid',
    'true'
  );

  await page.locator('#checkoutForm input[name="nombre"]').fill('Estudiante de ejemplo');
  await page.locator('#checkoutForm input[name="correo"]').fill('ejemplo@milab.gt');
  await page.locator('#checkoutForm input[name="telefono"]').fill('5555 5555');
  await page.locator('#checkoutForm textarea[name="direccion"]').fill('Calle de ejemplo 1');
  await page.locator('#checkoutForm button[type="submit"]').click();

  await expect(page.locator('#confirmationPanel')).toBeVisible();
  await expect(page.locator('#confirmMessage')).toContainText('Estudiante de ejemplo');
  await expect(page.locator('#confirmMessage')).toContainText('demostración');

  await page.locator('#confirmDone').click();
  await expect(page.locator('#cartCount')).toBeHidden();
});

test('el carrito persiste al recargar', async ({ page }) => {
  await addTray(page);
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('#cartCount')).toHaveText('1');
});

test('el carrito vacío muestra su estado', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cartOpen').click();
  await expect(page.locator('#cartEmpty')).toBeVisible();
  await expect(page.locator('#cartFoot')).toBeHidden();
});
