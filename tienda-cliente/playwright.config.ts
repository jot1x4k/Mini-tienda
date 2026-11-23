import { defineConfig, devices } from '@playwright/test';
 
// En Windows el Maven Wrapper se llama mvnw.cmd; en macOS y Linux, ./mvnw
const esWindows = process.platform === 'win32';
const comandoBackend = esWindows
  ? 'mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=e2e"'
  : './mvnw spring-boot:run -Dspring-boot.run.profiles=e2e';
 
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',          // solo estos archivos son de Playwright
  fullyParallel: false,
  workers: 1,                         // una prueba a la vez: comparten la base de datos
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',    // foto de la pantalla si una prueba falla
    trace: 'retain-on-failure',       // grabación paso a paso si una prueba falla
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Playwright enciende los dos servidores antes de las pruebas y los apaga al final
  webServer: [
    {
      command: comandoBackend,
      cwd: '../tienda-api',
      url: 'http://localhost:8080/api/productos',
      reuseExistingServer: false,     // siempre un backend nuevo, con los datos iniciales
      timeout: 180_000,
    },
    {
      command: 'npm start -- --port 4200',
      cwd: '.',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
