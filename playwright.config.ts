import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra el backend desplegado (https://api.sir.com.gt vía el BFF local).
 * Usa `next dev` para que NODE_ENV=development y las cookies de sesión NO lleven
 * Secure (así se almacenan sobre http://127.0.0.1 durante las pruebas).
 * Credenciales por env: E2E_USERNAME / E2E_PASSWORD (no se commitean).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    timeout: 180_000,
    reuseExistingServer: true,
  },
});
