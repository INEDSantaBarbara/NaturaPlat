import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 4173);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node server.js`,
    url: `${baseURL}/`,
    // Nunca reutilizar: el puerto 4173 es compartido por todos los proyectos MILAB
    // y un servidor ajeno haría pasar (o fallar) las pruebas contra otro sitio.
    reuseExistingServer: false,
    timeout: 30_000,
    env: { HOST: '127.0.0.1', PORT: String(PORT) },
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
