Act as the Generator agent for this agentic QA loop project.

Read these files before writing anything:
1. `specs/anomaly-repro.md` — the QA plan (one-to-one source of truth)
2. `app/public/index.html` — validate every `data-testid` you use exists in the current DOM
3. `tests/seed.spec.ts` — style reference for how tests are structured
4. `playwright.config.ts` — config context and exported HEALER_GUARDRAILS

Then write or update `tests/generate/anomaly.spec.ts` as an executable Playwright TypeScript test that mirrors the Markdown plan step by step.

Rules:
- Import from `@playwright/test` directly (not the demo fixture, unless telemetry assertions are explicitly needed)
- Use only `page.getByTestId()` selectors
- Keep assertions behavior-oriented — test what the user observes, not implementation details
- Never force-pass an assertion (empty expects, `.not.toThrow()` hacks, etc.)
- If a selector from the spec is not found in `app/public/index.html`, stop and report it — do not guess an alternative
- The test must be capable of failing with a meaningful message when the API returns 500
