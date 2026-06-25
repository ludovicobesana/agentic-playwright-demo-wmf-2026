---
title: 5. Run And Heal
sidebar_position: 7
---

# 5. Run And Heal

## Goal

Simulate UI drift by renaming a `data-testid` in the live app, observe the test failure, and let the Healer decide whether to repair or escalate.

This step demonstrates the most important guardrail: **the Healer must distinguish locator drift from real defects**.

---

## Part A — The Happy Path

First, confirm everything is green:

```bash
npm run test:generated
```

```
✓  generated anomaly reproduction › submits checkout successfully (2.8s)
1 passed (4.2s)
```

---

## Part B — Simulate UI Drift

This is the live demo moment. Edit `app/public/index.html` and rename one `data-testid`:

**Before:**
```html
<button type="submit" data-testid="payment-button" id="payment-button">
  Submit payment
</button>
```

**After:**
```html
<button type="submit" data-testid="pay-now-button" id="payment-button">
  Submit payment
</button>
```

This simulates a frontend refactor where a developer renamed the selector without updating tests.

Re-run the test:

```bash
npm run test:generated
```

```
✗  generated anomaly reproduction › submits checkout successfully on the grounded baseline (5.1s)

Error: Timed out 5000ms waiting for expect(locator).toBeEnabled()

Call log:
  - waiting for getByTestId('payment-button')
  - locator resolved to hidden

  at tests/generate/anomaly.spec.ts:15
```

The test fails because `[data-testid="payment-button"]` no longer exists. The business flow is intact — the button is there, it just has a different `data-testid`. This is exactly the drift the Healer is designed to fix.

---

## Part C — Run the Healer

Type in Claude Code:

```
/heal
```

Claude Code loads the Healer agent from `.claude/agents/healer.md`. It will:

1. Run `npm run test:generated` and capture the failure
2. Read `tests/generate/anomaly.spec.ts`
3. Read `app/public/index.html` to inspect the current DOM
4. Diagnose: `payment-button` → `pay-now-button` (locator drift, not a defect)
5. Apply the minimum repair: update the selector in the test

**Repaired test (diff):**
```diff
- await page.getByTestId('payment-button').click();
+ await page.getByTestId('pay-now-button').click();
```

Re-run after repair:

```bash
npm run test:generated
```

```
✓  generated anomaly reproduction › submits checkout successfully (2.9s)
1 passed (4.1s)
```

:::tip Restore the DOM after the demo
Change `data-testid="pay-now-button"` back to `data-testid="payment-button"` in `app/public/index.html` after demonstrating the Healer. The rest of the loop depends on the original selector names.
:::

---

## Part D — Escalation (Real Defect)

Now simulate a real defect: remove the entire shipping form from the DOM.

In `app/public/index.html`, comment out the `<form>` element:

```html
<!-- <form id="checkout-form" data-testid="shipping-form"> -->
<!--   ... -->
<!-- </form> -->
```

Run `/heal` again. The Healer should **not** repair this:

```
🔴 ESCALATION REQUIRED

data-testid="shipping-form" is absent from the current DOM.
This is not locator drift — the checkout form itself is missing.

Repairing this test would require removing the assertion that the
form is visible, which would mask a real product defect.

Action taken: test.skip(true, 'shipping-form absent from DOM — human review required')

The test has been marked skipped. DO NOT re-enable it without
verifying that the checkout form has been restored.
```

The test is now marked:

```typescript
test.skip(true, 'shipping-form absent from DOM — human review required');
```

:::danger This is the critical guardrail
A Healer that repairs the missing form assertion by removing it would mask a broken feature and produce a green CI build with a broken product. The `.skip` + escalation is the only safe outcome here.
:::

---

## Restore the App

After the demo, restore `app/public/index.html` to its original state (uncomment the form, restore `payment-button`).

Verify:

```bash
npm run test:seed && npm run test:generated
```

Both suites should pass.

---

## What the Healer Decision Tree Looks Like

```
Test fails
    │
    ├── data-testid exists but was renamed?
    │       └── ✅ Update the selector → re-run → pass
    │
    ├── Element exists but interaction is flaky (timing)?
    │       └── ✅ Add await expect(locator).toBeVisible() before action
    │
    ├── Label text changed (e.g. "Submit" → "Pay now")?
    │       └── ✅ Update the text in the assertion
    │
    └── Required element is absent from the DOM?
    OR  API returning 500 unexpectedly?
    OR  Core assertion must be removed to pass?
            └── 🔴 test.skip() + escalation message → STOP
```

---

## Next

Continue to [next steps](./next-steps) to learn how this loop fits into CI and how to extend it.
