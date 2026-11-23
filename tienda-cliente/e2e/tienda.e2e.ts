import { test, expect, Page } from '@playwright/test';
 
const API = 'http://localhost:8080/api/productos';
 
// Ayudante: la tarjeta del producto que tiene exactamente ese nombre
function tarjeta(page: Page, nombre: string) {
  return page.locator('app-producto-card')
    .filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });
}
 
test('E2E-01 la tienda carga el catálogo desde el backend', async ({ page }) => {
  await page.goto('/');
 
  await expect(page.getByRole('heading', { name: 'Tienda de productos' })).toBeVisible();
  for (const nombre of ['Manzana', 'Piña', 'Pera', 'Papaya']) {
    await expect(tarjeta(page, nombre)).toBeVisible();
  }
  await expect(tarjeta(page, 'Papaya')).toContainText('Agotado');
  await expect(tarjeta(page, 'Papaya').getByRole('button', { name: 'Comprar' }))
    .toBeDisabled();
});
 
// Los recorridos se agregan aquí, en los pasos siguientes
test('E2E-02 comprar descuenta el stock y el cambio sobrevive a la recarga',
  async ({ page }) => {
  await page.goto('/');
  const manzana = tarjeta(page, 'Manzana');
  await expect(manzana).toContainText('Stock: 3');
 
  await manzana.getByRole('button', { name: 'Comprar' }).click();
 
  await expect(manzana).toContainText('Stock: 2');
  await expect(page.locator('aside li')).toHaveText(['Manzana - $20.5']);
  await expect(page.getByText('Total a pagar: $20.5')).toBeVisible();
  await expect(page.locator('.aviso')).toHaveText('Manzana agregado al carrito');
 
  // La prueba de fuego: recargar la página
  await page.reload();
 
  await expect(tarjeta(page, 'Manzana')).toContainText('Stock: 2');
  await expect(page.getByText('El carrito está vacío.')).toBeVisible();
});
test('E2E-03 comprar la pera hasta agotarla bloquea el botón', async ({ page }) => {
  await page.goto('/');
  const pera = tarjeta(page, 'Pera');
  const comprar = pera.getByRole('button', { name: 'Comprar' });
 
  await comprar.click();
  await expect(pera).toContainText('Stock: 1');
 
  await comprar.click();
  await expect(pera).toContainText('Agotado');
  await expect(comprar).toBeDisabled();
});
test('E2E-04 el formulario crea un producto que queda guardado', async ({ page }) => {
  await page.goto('/');
 
  await page.getByLabel('Nombre').fill('Mango');
  await page.getByLabel('Precio').fill('8.9');
  await page.getByLabel('Stock').fill('10');
  await page.getByLabel('Imagen').fill('/imagenes/mango.jpg');
  await page.getByRole('button', { name: 'Guardar' }).click();
 
  await expect(tarjeta(page, 'Mango')).toContainText('Stock: 10');
  await expect(page.locator('.aviso')).toHaveText('Mango creado');
 
  await page.reload();
  await expect(tarjeta(page, 'Mango')).toBeVisible();
});
 
test('E2E-05 el formulario muestra los errores de validación del backend',
  async ({ page }) => {
  await page.goto('/');
 
  await page.getByLabel('Precio').fill('-3');
  await page.getByRole('button', { name: 'Guardar' }).click();
 
  const aviso = page.locator('.aviso-error');
  await expect(aviso).toContainText('El nombre es obligatorio');
  await expect(aviso).toContainText('El precio no puede ser negativo');
});
test('E2E-06 una pestaña desactualizada recibe el 409 del servidor',
  async ({ page, context, request }) => {
  // Preparar: un producto con una sola unidad, creado directamente en la API
  const respuesta = await request.post(API, {
    data: { nombre: 'Kiwi', precio: 4, stock: 1, imagen: '/imagenes/kiwi.jpg' }
  });
  expect(respuesta.status()).toBe(201);
 
  // Dos pestañas abiertas con la tienda
  const pestanaB = await context.newPage();
  await page.goto('/');
  await pestanaB.goto('/');
 
  // En la primera pestaña se compra el único kiwi
  await tarjeta(page, 'Kiwi').getByRole('button', { name: 'Comprar' }).click();
  await expect(tarjeta(page, 'Kiwi')).toContainText('Agotado');
 
  // La segunda pestaña no se ha recargado: todavía cree que hay stock
  await expect(tarjeta(pestanaB, 'Kiwi')).toContainText('Stock: 1');
  await tarjeta(pestanaB, 'Kiwi').getByRole('button', { name: 'Comprar' }).click();
 
  await expect(pestanaB.locator('.aviso-error')).toHaveText('Lo sentimos, ya no hay stock');
  await expect(pestanaB.locator('aside li')).toHaveCount(0);
});
test('E2E-07 eliminar un producto con confirmación lo borra del backend',
  async ({ page, request }) => {
  await request.post(API, { data: { nombre: 'Uva', precio: 3, stock: 4, imagen: '' } });
  await page.goto('/');
 
  // Cuando aparezca la ventana de confirmación, se acepta
  page.once('dialog', dialogo => dialogo.accept());
  await tarjeta(page, 'Uva').getByRole('button', { name: 'Eliminar' }).click();
 
  await expect(tarjeta(page, 'Uva')).toHaveCount(0);
  await expect(page.locator('.aviso')).toHaveText('Producto eliminado');
 
  await page.reload();
  await expect(tarjeta(page, 'Uva')).toHaveCount(0);
});
 
test('E2E-08 reponer stock habilita de nuevo la compra', async ({ page, request }) => {
  await request.post(API, { data: { nombre: 'Limón', precio: 1.5, stock: 0, imagen: '' } });
  await page.goto('/');
  const limon = tarjeta(page, 'Limón');
  await expect(limon).toContainText('Agotado');
 
  await limon.getByRole('button', { name: '+5 stock' }).click();
 
  await expect(limon).toContainText('Stock: 5');
  await expect(limon.getByRole('button', { name: 'Comprar' })).toBeEnabled();
});
