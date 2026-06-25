Act as the Planner agent for this agentic QA loop project.

Read these files before writing anything:
1. `observability/mock_telemetry_data/checkout_error.json` — the anomaly event to reproduce
2. `tests/seed.spec.ts` — the grounding baseline (defines what the app can do)
3. `app/public/index.html` — verify each `data-testid` you reference actually exists
4. `specs/README.md` — the expected Markdown structure

Then write or update `specs/anomaly-repro.md` with a complete QA plan containing:
- **Intent** — one sentence summary
- **Source inputs** — file paths used as input
- **Problem statement** — what the telemetry reports
- **Preconditions** — what must be true before the test runs
- **Steps** — numbered user actions
- **Expected outcomes** — what a passing test should observe
- **Necessary data** — explicit test data values
- **Selector map** — `data-testid` selectors used (verified against the live DOM)
- **Acceptance criteria** — when the test is considered correct

Rules:
- Only reference `data-testid` values that exist in `app/public/index.html`
- Do not invent steps or selectors not backed by the live DOM
- If the checkout flow is absent from the app, escalate — do not write a plan that cannot be implemented
- The plan must be detailed enough for one-to-one code generation by the Generator
