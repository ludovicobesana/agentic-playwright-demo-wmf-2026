---
title: 4. Generate The Test
sidebar_position: 6
---

# 4. Generate The Test

## Goal

Convert the Markdown plan into an executable Playwright TypeScript test that mirrors the spec one-to-one, with every selector validated against the live DOM.

---

## Run the Generator with Claude Code

With the app running and `specs/anomaly-repro.md` in place, type:

```
/generate
```

Claude Code loads the Generator agent from `.claude/agents/generator.md`. It will:

1. **Read** `specs/anomaly-repro.md` (the source of truth)
2. **Read** `app/public/index.html` to validate every `data-testid` from the selector map
3. **Write** `tests/generate/anomaly.spec.ts`

:::info Selector validation happens before writing
The Generator checks that each `data-testid` from the spec exists in the live DOM. If one is missing, it stops and reports the discrepancy — it does not guess or substitute.
:::

---

## What the Generator Produces

The generated test should look like this:

```typescript
import { expect, test } from '@playwright/test';

test.describe('generated anomaly reproduction', () => {
  test('submits checkout successfully on the grounded baseline', async ({ page }) => {
    await page.goto('/');

    // Precondition: authenticated baseline visible
    await expect(page.getByTestId('session-banner')).toContainText('Ada Lovelace');
    await expect(page.getByTestId('shipping-form')).toBeVisible();

    // Step 3-6: fill the form
    await page.getByTestId('shipping-name-input').fill('Ada Lovelace');
    await page.getByTestId('shipping-email-input').fill('ada@example.com');
    await page.getByTestId('shipping-address-input').fill('12 Analytical Engine Way');
    await page.getByTestId('shipping-postal-input').fill('94107');
    await page.getByTestId('shipping-method-select').selectOption('standard');
    await page.getByTestId('payment-method-select').selectOption('Credit Card');

    // Step 6: submit
    await page.getByTestId('payment-button').click();

    // Expected outcome: success banner
    await expect(page.getByTestId('checkout-message')).toContainText('Payment submitted');
    await expect(page.getByTestId('checkout-message')).toContainText('Order confirmed');
    await expect(page.getByTestId('checkout-message')).toContainText('$');
  });
});
```

### What to verify in the output

| Check | Correct | Wrong |
|-------|---------|-------|
| Selectors | `page.getByTestId('payment-button')` | `page.locator('.btn-primary')` |
| Import | `from '@playwright/test'` | `from '../fixtures/demo.fixture'` |
| Assertions | `toContainText`, `toBeVisible` | Empty `expect()`, no assertions |
| Step count | Matches the plan one-to-one | Missing or extra steps |
| Data | Exact values (`Ada Lovelace`, `94107`) | Placeholders |

---

## Run the Generated Test

```bash
npm run test:generated
```

Expected output:
```
Running 1 test using 1 worker
✓  generated anomaly reproduction › submits checkout successfully on the grounded baseline (2.8s)

1 passed (4.2s)
```

---

## Verify the Failure Mode

Replay the production incident:

```bash
CHECKOUT_FORCE_500=1 npm run test:generated
```

The test **must fail** with a meaningful message:

```
Error: Timed out 5000ms waiting for expect(locator).toContainText('Payment submitted')

Received string: "Checkout error Upstream payment authorization failed."
```

:::danger A test that passes under forced failure is broken
If `CHECKOUT_FORCE_500=1 npm run test:generated` passes, the Generator wrote incorrect assertions. The checkout-message assertion must distinguish success from failure — this is the key signal the loop was designed to detect.
:::

---

## What the Generator Must Never Do

- Use CSS class selectors (`.btn`, `#submit-form`) instead of `data-testid`
- Add empty `expect()` calls or no-op assertions
- Write `try/catch` blocks around assertions to suppress errors
- Skip assertions that check the final result
- Use a `data-testid` that was not in the spec's selector map

If any of these appear in the generated test, ask Claude Code to re-generate from the spec.

---

## Next

Continue to [run and heal](./run-and-heal) to see what happens when the UI drifts and the Healer must decide whether to repair or escalate.
