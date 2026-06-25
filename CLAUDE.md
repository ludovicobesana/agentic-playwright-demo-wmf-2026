# Playwright Agentic QA Loop

Conference demo (WMF 2026). Three specialized agents convert production observability telemetry into Playwright tests that self-repair when the UI drifts.

## Project Map

| Path | Role |
|------|------|
| `app/server.mjs` | Express checkout app — port 3000 |
| `app/public/index.html` | Checkout UI — all interactive elements have `data-testid` hooks |
| `observability/mock_telemetry_data/checkout_error.json` | Mocked HTTP 500 error event — Planner input |
| `tests/seed.spec.ts` | Grounding baseline — must always pass, never modify to force green |
| `tests/fixtures/demo.fixture.ts` | Injects telemetry into the seed test |
| `tests/global-setup.ts` | Writes `.auth/storage-state.json` for the demo session |
| `tests/generate/anomaly.spec.ts` | Generated test — written by the Generator agent |
| `specs/anomaly-repro.md` | QA plan — written by the Planner, single source of truth for QA intent |
| `playwright.config.ts` | Playwright config — also exports `HEALER_GUARDRAILS` |
| `.github/agents/` | VS Code MCP agent definitions (Planner, Generator, Healer) |
| `.claude/agents/` | Claude Code subagent definitions |
| `.claude/commands/` | Slash commands: `/plan`, `/generate`, `/heal`, `/demo` |

## Agent Loop

```
Telemetry JSON ──► Planner ──► specs/anomaly-repro.md ──► Generator ──► tests/generate/anomaly.spec.ts
                                                                                    │
                                                                              [npm run test:generated]
                                                                                    │
                                                                          failing ──► Healer ──► repaired or .skip + escalate
```

### Agent Roles

| Agent | Slash command | Input | Output |
|-------|---------------|-------|--------|
| **Planner** | `/plan` | `checkout_error.json` + `seed.spec.ts` | `specs/anomaly-repro.md` |
| **Generator** | `/generate` | `specs/anomaly-repro.md` | `tests/generate/anomaly.spec.ts` |
| **Healer** | `/heal` | failing test + current DOM | repaired test or `.skip` + escalation |

Use `/demo` to walk through all four conference steps in one shot.

## Data-TestID Map

All selectors in generated tests must use these stable hooks from `app/public/index.html`:

```
checkout-shell          root <main>
session-banner          auth status pill
cart-summary            subtotal section
cart-items              item list
cart-item-{n}           individual cart row (0-indexed)
cart-item-name-{n}      item name within row
cart-item-quantity-{n}  item quantity within row
cart-item-price-{n}     item price within row
shipping-form           <form> element
shipping-name-input     full name input
shipping-email-input    email input
shipping-address-input  street address input
shipping-postal-input   postal code input
shipping-method-select  shipping dropdown
payment-method-select   payment dropdown
payment-button          submit button
checkout-message        result banner (hidden until submit)
edit-cart-button        secondary CTA
```

## Healer Guardrails

Defined in `playwright.config.ts` as `HEALER_GUARDRAILS`. Always read before starting a repair session.

**Allowed repairs:**
- Update a renamed `data-testid` selector
- Adjust waits/timeouts for timing drift
- Fix small data mismatches (e.g. label text changed)

**Forbidden:**
- Bypass or remove assertions to force a green build
- Patch around a missing required flow
- Rewrite acceptance criteria without human approval

**Escalation rule:** If the checkout contract is broken, the payment form is absent, or a core assertion would need to be removed, mark the test `test.skip()` with a reason comment and stop. Output a clear escalation message naming what is missing.

## Key Commands

```bash
# App
npm run start                                   # checkout app on :3000
npm run dev                                     # alias for start

# Tests
npm run test:seed                               # grounding test only
npm run test:generated                          # generated tests only
npm run test                                    # all tests
npm run show-report                             # open last HTML report
CHECKOUT_FORCE_500=1 npm run test:generated     # replay the 500-error scenario

# Observability
docker compose -f observability/docker-compose.yml up  # Grafana on :3001

# Docs
npm run docs:start                              # Docusaurus tutorial on :3002
```

## Test Data

Fixed values used across seed and generated tests:

| Field | Value |
|-------|-------|
| Name | Ada Lovelace |
| Email | ada@example.com |
| Address | 12 Analytical Engine Way |
| Postal code | 94107 |
| Shipping method | standard |
| Payment method | Credit Card |
| Auth token | `demo_auth_token` = `demo-token-adalovelace-2026` in localStorage |

## Demo Flow (4 steps for conference)

1. **Incident** — Grafana `:3001` shows the checkout spike from `checkout_error.json`
2. **Plan** — `/plan` → Planner writes `specs/anomaly-repro.md`
3. **Generate** — `/generate` → Generator writes `tests/generate/anomaly.spec.ts`
4. **Heal** — rename a `data-testid` in `app/public/index.html`, run tests, `/heal` repairs it

## Constraints

- `tests/seed.spec.ts` is the immutable grounding baseline — never edit it to force a pass
- All selectors must use `data-testid`; no CSS class paths or text-based selectors in generated tests
- `specs/` is the single source of truth; every test must trace back to a spec entry
- The telemetry layer is intentionally fake — do not add live tracing dependencies
- The app has no real auth — `demo_auth_token` in localStorage is sufficient for grounding
- The Healer must not mask real defects; a skipped test is better than a lying green test
