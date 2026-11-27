import process from 'node:process';
import { defineConfig } from '@playwright/test';

const webPort = process.env.E2E_WEB_PORT || '18080';
const mailpitPort = process.env.E2E_MAILPIT_PORT || '18025';
const baseURL = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    browserName: 'chromium',
    locale: 'en-US',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'docker compose -p catalogue-e2e -f docker-compose.yml -f e2e/compose.yml up --build',
    env: { E2E_WEB_PORT: webPort, E2E_MAILPIT_PORT: mailpitPort },
    url: `${baseURL}/api/health`,
    timeout: 5 * 60 * 1000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 30_000 },
  },
});
