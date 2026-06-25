import { expect, test } from './fixtures/demo.fixture.js';

test.describe('seed grounding', () => {
  test('establishes the authenticated checkout baseline', async ({ page, checkoutTelemetry }) => {
    await page.goto('/');

    await expect(page.getByTestId('session-banner')).toHaveText(/Signed in as Ada Lovelace/);
    await expect(page.getByTestId('cart-summary')).toContainText('Subtotal');
    await expect(page.getByTestId('cart-items')).toContainText('Trailhead Hoodie');
    await expect(page.getByTestId('shipping-form')).toBeVisible();
    await expect(page.getByTestId('payment-button')).toHaveText('Submit payment');
    await expect(page.getByTestId('checkout-message')).toBeHidden();

    expect(checkoutTelemetry.httpStatus).toBe(500);
    expect(checkoutTelemetry.message).toContain("User clicked 'Submit' but API returned 500 on /checkout");
    expect(checkoutTelemetry.labels.flow).toBe('checkout');
  });
});
