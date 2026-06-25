---
title: 3. Write The Plan
sidebar_position: 5
---

# 3. Write The Plan

## Goal

Turn the telemetry signal and the grounded seed test into a human-readable Markdown spec that becomes the single source of truth for everything the Generator and Healer will do.

---

## Run the Planner with Claude Code

With the app running, open Claude Code and type:

```
/plan
```

Claude Code loads the Planner agent from `.claude/agents/planner.md` and the command definition from `.claude/commands/plan.md`. It will:

1. **Read** `observability/mock_telemetry_data/checkout_error.json`
2. **Read** `tests/seed.spec.ts`
3. **Read** `app/public/index.html` to verify each selector
4. **Write** `specs/anomaly-repro.md`

---

## What the Planner Produces

A valid `specs/anomaly-repro.md` has these sections:

### Intent
One sentence. Names the anomaly being reproduced.
```
Reproduce a production checkout anomaly where the user completes the form
and clicks Submit, but /checkout returns HTTP 500.
```

### Source Inputs
The exact files used. This makes the plan auditable.
```
- observability/mock_telemetry_data/checkout_error.json
- tests/seed.spec.ts
```

### Problem Statement
What the telemetry reports in plain language. Not a code comment.

### Preconditions
What must be true before the test can run — app running, auth seeded, etc.

### Steps
Numbered user actions from landing page to final CTA:
```
1. Open the checkout page.
2. Confirm session banner shows the authenticated user.
3. Fill shipping name, email, address, postal code.
4. Select Standard shipping.
5. Select Credit Card as payment method.
6. Click Submit payment.
```

### Expected Outcomes
What a correctly passing test observes at each key point.

### Necessary Data
Explicit values — no "some valid email":
```
Name:    Ada Lovelace
Email:   ada@example.com
Address: 12 Analytical Engine Way
Postal:  94107
Shipping: standard
Payment:  Credit Card
```

### Selector Map
Every `data-testid` used, verified against the live DOM:
```
shipping-form          [data-testid="shipping-form"]
shipping-name-input    [data-testid="shipping-name-input"]
payment-button         [data-testid="payment-button"]
checkout-message       [data-testid="checkout-message"]
```

### Acceptance Criteria
The definition of done for the Generator:
```
- The generated test must assert payment completes successfully on the happy path.
- If the API returns 500, the test must fail with a meaningful message.
- The Healer must escalate (not repair) if the checkout form is missing.
```

---

## Guardrail: No Selector Hallucination

The Planner reads `app/public/index.html` to verify every `data-testid` before adding it to the selector map. If it cannot find a required selector, it escalates:

```
⚠️ Cannot find [data-testid="checkout-shell"] in the live DOM.
The plan cannot be written without a valid root selector.
Please verify the app is running and the DOM matches the expected structure.
```

This prevents the Generator from writing a test that will fail at line 1 because of a non-existent locator.

---

## Verify the Output

After `/plan` completes, check `specs/anomaly-repro.md`:

- Does it reference the exact `data-testid` values from the [selector contract](./architecture#selector-contract)?
- Does it include both the success path and the 500-error scenario?
- Is the test data explicit (no placeholders like "your email here")?
- Is every section present?

:::tip Open the spec alongside the JSON
Read `observability/mock_telemetry_data/checkout_error.json` and `specs/anomaly-repro.md` side by side. Every field in the JSON should map to at least one element in the plan.
:::

---

## Next

Continue to [generate the test](./generate-the-test) to convert the Markdown plan into executable TypeScript.
