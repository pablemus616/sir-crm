import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke e2e contra el backend real. NO-MUTANTE a propósito (la DB es sir_prod):
 * solo valida auth/BFF/proxy, rutas protegidas, gate de admin y render con datos
 * reales — sin crear/editar/borrar entidades de negocio.
 */

const USER = process.env.E2E_USERNAME ?? 'admin';
const PASS = process.env.E2E_PASSWORD ?? '';

async function login(page: Page) {
  // En `next dev` la ruta compila y el JS puede no haber hidratado todavía; si se
  // hace click antes, el <form> hace un submit nativo GET (.../login?username=...)
  // en vez de que RHF intercepte. Reintentamos: en el 2º intento el bundle ya está
  // cacheado y la hidratación es inmediata.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // margen de hidratación
    await page.locator('input[name="username"]').fill(USER);
    await page.locator('input[name="password"]').fill(PASS);
    await page.locator('button[type="submit"]').click();
    try {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
      return;
    } catch {
      if (attempt === 3) throw new Error('Login no redirigió a /dashboard tras 3 intentos');
    }
  }
}

test('sin sesión, una ruta protegida redirige a /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test.describe('autenticado como admin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('el login lleva al dashboard con el layout autenticado', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    // El sidebar autenticado (landmark complementary) renderiza el enlace Dashboard.
    await expect(
      page.getByRole('complementary').getByRole('link', { name: 'Dashboard' }),
    ).toBeVisible();
  });

  test('navega a los módulos protegidos sin perder la sesión', async ({ page }) => {
    for (const path of ['/opportunities', '/clients', '/candidates', '/applications', '/placements']) {
      await page.goto(path);
      await expect(page, `${path} debe cargar autenticado`).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  test('un admin puede entrar a las rutas (admin)', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/users/);
    await expect(page).not.toHaveURL(/\/dashboard/); // no fue expulsado por el gate
    await page.goto('/sectors');
    await expect(page).toHaveURL(/\/sectors/);
  });
});
