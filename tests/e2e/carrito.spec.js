import { test, expect } from '@playwright/test';

const product = (page) => page.locator('article.producto[data-product="1"]');

test('agregar al carrito abre el panel, suma y enfoca el cierre', async ({ page }) => {
  await page.goto('/');

  await product(page).getByRole('button', { name: 'Añadir al carrito' }).click();

  const drawer = page.locator('#cartDrawer');
  await expect(drawer).toBeVisible();
  await expect(page.locator('#cartCount')).toHaveText('1');
  await expect(page.locator('#cartSubtotal')).toHaveText('Q119');
  await expect(page.locator('#cartClose')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('cantidad y eliminación actualizan el subtotal', async ({ page }) => {
  await page.goto('/');
  await product(page).getByRole('button', { name: 'Añadir al carrito' }).click();

  await page.getByRole('button', { name: 'Aumentar cantidad' }).click();
  await expect(page.locator('#cartCount')).toHaveText('2');
  await expect(page.locator('#cartSubtotal')).toHaveText('Q238');

  await page.getByRole('button', { name: 'Quitar' }).click();
  await expect(page.locator('#cartEmpty')).toBeVisible();
  await expect(page.locator('#cartFoot')).toBeHidden();
  await expect(page.locator('#cartCount')).toBeHidden();
});

test('el carrito persiste al recargar', async ({ page }) => {
  await page.goto('/');
  await product(page).getByRole('button', { name: 'Añadir al carrito' }).click();
  await page.keyboard.press('Escape');

  await page.reload();
  await expect(page.locator('#cartCount')).toHaveText('1');
});

test('el checkout valida y confirma un pedido de demostración', async ({ page }) => {
  await page.goto('/');
  await product(page).getByRole('button', { name: 'Añadir al carrito' }).click();

  await page.locator('#cartCheckout').click();
  const modal = page.locator('#checkoutModal');
  await expect(modal).toBeVisible();

  await page.locator('#checkoutForm button[type="submit"]').click();
  await expect(page.locator('#checkoutError')).toHaveAttribute('role', 'alert');
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

test('el formulario de contacto avisa que es una demostración', async ({ page }) => {
  await page.goto('/');

  await page.locator('#contactForm button[type="submit"]').click();
  await expect(page.locator('#contactError')).toBeVisible();
  await expect(page.locator('#contactForm input[name="nombre"]')).toHaveAttribute(
    'aria-invalid',
    'true'
  );

  await page.locator('#contactForm input[name="nombre"]').fill('Estudiante de ejemplo');
  await page.locator('#contactForm input[name="correo"]').fill('ejemplo@milab.gt');
  await page.locator('#contactForm textarea[name="mensaje"]').fill('Cotización de ejemplo');
  await page.locator('#contactForm button[type="submit"]').click();

  await expect(page.locator('#toast')).toContainText(/demostración/i);
});
