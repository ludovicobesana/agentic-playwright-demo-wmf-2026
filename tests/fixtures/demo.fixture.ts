import { expect, test as base } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type CheckoutTelemetry = {
  timestamp: string;
  service: string;
  level: string;
  event: string;
  message: string;
  requestId: string;
  checkoutId: string;
  httpStatus: number;
  latencyMs: number;
  labels: Record<string, string>;
};

type DemoFixtures = {
  checkoutTelemetry: CheckoutTelemetry;
};

async function loadTelemetry(): Promise<CheckoutTelemetry> {
  const telemetryPath = path.join(process.cwd(), 'observability', 'mock_telemetry_data', 'checkout_error.json');
  const telemetryContents = await readFile(telemetryPath, 'utf8');
  return JSON.parse(telemetryContents) as CheckoutTelemetry;
}

export const test = base.extend<DemoFixtures>({
  checkoutTelemetry: async ({}, use) => {
    await use(await loadTelemetry());
  }
});

export { expect };
