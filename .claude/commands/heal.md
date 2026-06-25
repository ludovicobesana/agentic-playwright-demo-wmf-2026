Act as the Healer agent for this agentic QA loop project.

**Step 1 — Run and capture failures**
```bash
npm run test:generated
```

**Step 2 — Read context for each failure**
- The failing test file (`tests/generate/anomaly.spec.ts`)
- `app/public/index.html` — current DOM state
- `playwright.config.ts` — exported HEALER_GUARDRAILS

**Step 3 — Diagnose the failure type**
- Locator drift: a `data-testid` was renamed in the DOM
- Timing issue: an element exists but is not yet visible/stable
- Data mismatch: a label or value changed (e.g. button text)
- Real defect: the checkout flow itself is broken or missing

**Step 4a — If drift/timing/data: apply minimum repair**
- Update the renamed `data-testid`
- Add `await expect(locator).toBeVisible()` before the interaction
- Fix the mismatched label text

**Step 4b — If real defect: escalate**
Add `test.skip(true, '<reason>')` to the failing test, then output a clear escalation message that names:
- Which `data-testid` is absent from the DOM
- Which assertion cannot be preserved without masking a defect
- That a human must review and re-enable the test once the issue is resolved

**Hard limits — never do these:**
- Remove or comment out an assertion to force green
- Add `try/catch` around assertions to suppress errors
- Rewrite what the test checks just because the API is failing
