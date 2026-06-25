import { defineConfig, devices } from '@playwright/test';

const HEALER_GUARDRAILS = {
  allowedRepairs: [
    'Update dynamic locators when the underlying user intent still exists.',
    'Adjust waits or assertions for minor timing drift.',
    'Fix small data mismatches that do not change the business flow.'
  ],
  forbiddenRepairs: [
    'Bypass core assertions to force a green build.',
    'Patch around a missing required flow.',
    'Rewrite the product behavior or acceptance criteria without human approval.'
  ],
  escalationRule:
    'If the checkout contract changes, the required flow is missing, or the DOM drift hides a real defect, stop the healer loop and mark the test skipped for human review.'
} as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  timeout: 60_000,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    storageState: '.auth/storage-state.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  metadata: {
    healerGuardrails: HEALER_GUARDRAILS
  }
});

export { HEALER_GUARDRAILS };
