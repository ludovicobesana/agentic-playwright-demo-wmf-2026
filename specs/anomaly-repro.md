# QA Plan: Checkout Submit 500 Error Reproduction

## Intent

Reproduce the `checkout_submit_failed` anomaly from production telemetry by navigating an authenticated checkout session to form submission and asserting that a 500 response surfaces an error banner — not a silent failure.

---

## Source inputs

- `observability/mock_telemetry_data/checkout_error.json` — the anomaly event
- `tests/seed.spec.ts` — grounding baseline (defines the authenticated app contract)
- `app/public/index.html` — source of all `data-testid` selectors used below

---

## Problem statement

On 2026-06-02T09:14:27.403Z, the `checkout-web` service emitted a `checkout_submit_failed` event:

- The user clicked "Submit" on the checkout form
- The `/api/checkout` endpoint returned HTTP 500 (latency 1428 ms)
- k6 confirmed: the submit button was visible, but the checkout endpoint did **not** return 2xx
- Error rate reached 27%; p95 latency spiked to 1582 ms

The key risk: the app may silently disable the button and show no feedback, masking the failure from the user. The test must assert that the error is surfaced visibly.

---

## Preconditions

1. The checkout app is running on `http://localhost:3000` (started by Playwright's `webServer` config).
2. The `CHECKOUT_FORCE_500=1` environment variable is set so the `/api/checkout` endpoint reliably returns 500 for this test run.
3. The `demo_auth_token` localStorage key is set to `demo-token-adalovelace-2026` (injected by `tests/global-setup.ts` via the stored session state).
4. The page loads without errors — `/api/checkout-context` returns the cart and shipping options.

---

## Steps

1. Navigate to `/` (checkout root).
2. Assert the session banner shows the authenticated user.
3. Assert the cart is populated and the order summary is visible.
4. Assert the shipping form is visible and the payment button is enabled.
5. Assert the `checkout-message` banner is **hidden** at page load.
6. Fill in the shipping name field with the test value.
7. Fill in the shipping email field with the test value.
8. Fill in the shipping address field with the test value.
9. Fill in the postal code field with the test value.
10. Select the shipping method dropdown to `standard`.
11. Select the payment method dropdown to `Credit Card`.
12. Click the payment button to submit the form.
13. Wait for the `checkout-message` banner to become visible.
14. Assert the banner has `data-state="error"` (error visual state).
15. Assert the payment button is re-enabled and restored to its original label after the request completes.

---

## Expected outcomes

| # | Observable | Assertion |
|---|-----------|-----------|
| A | `session-banner` text | Matches `/Signed in as Ada Lovelace/` |
| B | `cart-summary` text | Contains `"Subtotal"` |
| C | `cart-items` text | Contains `"Trailhead Hoodie"` |
| D | `shipping-form` | Visible |
| E | `payment-button` text | Equals `"Submit payment"` before submission |
| F | `checkout-message` | Hidden before submission |
| G | `checkout-message` | Visible after submission |
| H | `checkout-message` data-state | Equals `"error"` |
| I | `payment-button` | Re-enabled (not disabled) after the request resolves |
| J | `payment-button` text | Restored to `"Submit payment"` after the request resolves |

---

## Necessary data

| Field | Value |
|-------|-------|
| Full name | `Ada Lovelace` |
| Email | `ada@example.com` |
| Street address | `12 Analytical Engine Way` |
| Postal code | `94107` |
| Shipping method | `standard` |
| Payment method | `Credit Card` |
| Auth token key | `demo_auth_token` |
| Auth token value | `demo-token-adalovelace-2026` |
| Force-500 env var | `CHECKOUT_FORCE_500=1` |

---

## Selector map

All selectors verified against `app/public/index.html`:

| Selector | `data-testid` | Element |
|---------|--------------|---------|
| Session banner | `session-banner` | `<div class="session-pill">` |
| Cart summary | `cart-summary` | `<div class="summary">` |
| Cart items container | `cart-items` | `<div class="cart-list">` |
| Shipping form | `shipping-form` | `<form id="checkout-form">` |
| Name input | `shipping-name-input` | `<input name="name">` |
| Email input | `shipping-email-input` | `<input name="email" type="email">` |
| Address input | `shipping-address-input` | `<input name="address">` |
| Postal code input | `shipping-postal-input` | `<input name="postalCode">` |
| Shipping method | `shipping-method-select` | `<select name="shippingMethodId">` |
| Payment method | `payment-method-select` | `<select name="paymentMethod">` |
| Submit button | `payment-button` | `<button type="submit">` |
| Result banner | `checkout-message` | `<div class="banner hidden">` |

---

## Acceptance criteria

The generated test is considered **correct** when:

1. All assertions A–J pass in a single test run with `CHECKOUT_FORCE_500=1`.
2. The test does **not** pass when run without `CHECKOUT_FORCE_500=1` (the success path produces `data-state="success"`, not `"error"` — so assertion H would fail, confirming the test is sensitive to the error condition).
3. Every selector used in the test exists in the selector map above and is backed by a `data-testid` in `app/public/index.html`.
4. No assertion has been weakened or removed to force a green result.
5. The test traces back to telemetry event `checkout_submit_failed` from `checkout_error.json`.
