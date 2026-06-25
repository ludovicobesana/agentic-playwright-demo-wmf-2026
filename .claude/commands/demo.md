Run the full agentic QA demo loop. This is the WMF 2026 conference walkthrough.

---

**Step 1 — The Incident**

Read `observability/mock_telemetry_data/checkout_error.json` and present a concise incident summary:
- What service and event
- HTTP status and latency
- What the k6 checks revealed (which passed, which failed)
- Why this matters for QA

---

**Step 2 — The Plan (Planner agent)**

Act as the Planner:
1. Read `observability/mock_telemetry_data/checkout_error.json`, `tests/seed.spec.ts`, and `app/public/index.html`
2. Write or refresh `specs/anomaly-repro.md`
3. Confirm the plan is complete before moving on

---

**Step 3 — The Generation (Generator agent)**

Act as the Generator:
1. Read `specs/anomaly-repro.md` and validate selectors against `app/public/index.html`
2. Write or refresh `tests/generate/anomaly.spec.ts`
3. Run `npm run test:generated` and confirm it passes

---

**Step 4 — Simulate UI Drift (explain to audience, then demo)**

Explain what is about to happen, then:
1. In `app/public/index.html`, rename `data-testid="payment-button"` to `data-testid="pay-now-button"`
2. Run `npm run test:generated` — show it failing
3. Act as the Healer: inspect the DOM, update the selector in the test
4. Run `npm run test:generated` again — show it passing
5. Restore `data-testid="payment-button"` to leave the app in its original state

---

Keep each step concise and suitable for a live audience. Pause between steps to allow questions.
