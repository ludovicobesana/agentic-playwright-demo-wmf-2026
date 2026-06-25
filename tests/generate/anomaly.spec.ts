// Generated from specs/anomaly-repro.md
// Telemetry source: observability/mock_telemetry_data/checkout_error.json
// Healer repair: replaced CHECKOUT_FORCE_500 env-var dependency with page.route()
// interception so the test is self-contained regardless of how the server was started.

import { expect, test } from '@playwright/test';

test.describe('checkout_submit_failed anomaly reproduction', () => {
  test('surfaces an error banner when the checkout API returns 500', async ({ page }) => {
    // Step 1: Navigate to checkout root
    await page.goto('/');

    // Step 2 — Assertion A: authenticated session is established
    await expect(page.getByTestId('session-banner')).toHaveText(/Signed in as Ada Lovelace/);

    // Step 3 — Assertions B + C: cart is populated
    await expect(page.getByTestId('cart-summary')).toContainText('Subtotal');
    await expect(page.getByTestId('cart-items')).toContainText('Trailhead Hoodie');

    // Step 4 — Assertions D + E: checkout form is ready
    await expect(page.getByTestId('shipping-form')).toBeVisible();
    await expect(page.getByTestId('payment-button')).toHaveText('Submit payment');

    // Step 5 — Assertion F: no result banner shown before submission
    await expect(page.getByTestId('checkout-message')).toBeHidden();

    // Intercept the checkout POST to deterministically return 500,
    // reproducing the anomaly regardless of server startup environment.
    await page.route('**/api/checkout', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Upstream payment authorization failed.' }),
      })
    );

    // Steps 6–9: fill shipping details
    await page.getByTestId('shipping-name-input').fill('Ada Lovelace');
    await page.getByTestId('shipping-email-input').fill('ada@example.com');
    await page.getByTestId('shipping-address-input').fill('12 Analytical Engine Way');
    await page.getByTestId('shipping-postal-input').fill('94107');

    // Steps 10–11: select shipping and payment methods
    await page.getByTestId('shipping-method-select').selectOption('standard');
    await page.getByTestId('payment-method-select').selectOption('Credit Card');

    // Step 12: submit the form
    await page.getByTestId('payment-button').click();

    // Step 13 — Assertion G: error banner becomes visible after the 500 response
    await expect(page.getByTestId('checkout-message')).toBeVisible();

    // Step 14 — Assertion H: banner signals an error state, not a success
    await expect(page.getByTestId('checkout-message')).toHaveAttribute('data-state', 'error');

    // Step 15 — Assertions I + J: button recovers — not stuck in a disabled/loading state
    await expect(page.getByTestId('payment-button')).toBeEnabled();
    await expect(page.getByTestId('payment-button')).toHaveText('Submit payment');
  });
});
