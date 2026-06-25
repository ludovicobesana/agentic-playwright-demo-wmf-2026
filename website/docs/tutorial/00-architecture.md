---
title: Architecture Overview
sidebar_position: 2
---

# Architecture Overview

The agentic QA loop consists of three specialized agents, a mocked observability layer, and a grounded seed test. Each agent has a single responsibility and strict boundaries that prevent it from drifting into adjacent concerns.

## The Three Agents

### Planner

**Reads:** `observability/mock_telemetry_data/checkout_error.json` and `tests/seed.spec.ts`  
**Writes:** `specs/anomaly-repro.md`  
**Job:** Convert an observability signal into a structured, human-readable QA plan. Does not produce code. Does not invent selectors. If a required flow is missing from the app, it escalates instead of hallucinating a plan.

### Generator

**Reads:** `specs/anomaly-repro.md` and the live DOM in `app/public/index.html`  
**Writes:** `tests/generate/anomaly.spec.ts`  
**Job:** Map each step in the Markdown plan to executable Playwright TypeScript, one-to-one. Validates every `data-testid` against the live DOM before writing. Never forces a pass.

### Healer

**Reads:** the failing test output and the current DOM  
**Writes:** repaired test (locator/timing fixes only) or a `.skip` annotation with an escalation message  
**Job:** Distinguish test instability (fixable) from real product defects (escalate). A skipped test with an honest reason is always better than a green test that lies.

## File Map

```
playwright-agentic-testing-wmf-2026/
├── app/
│   ├── server.mjs              Express checkout app (port 3000)
│   └── public/index.html       Single-page UI — every element has data-testid
│
├── observability/
│   ├── docker-compose.yml      Grafana stack (port 3001)
│   └── mock_telemetry_data/
│       └── checkout_error.json Mocked HTTP 500 error event (Planner input)
│
├── specs/
│   └── anomaly-repro.md        Planner output — single source of truth for QA intent
│
├── tests/
│   ├── seed.spec.ts            Immutable grounding baseline — never touch this
│   ├── fixtures/demo.fixture.ts Telemetry fixture
│   ├── global-setup.ts         Writes .auth/storage-state.json
│   └── generate/
│       └── anomaly.spec.ts     Generator output — executable Playwright test
│
├── .claude/
│   ├── agents/                 Claude Code subagent definitions
│   │   ├── planner.md
│   │   ├── generator.md
│   │   └── healer.md
│   ├── commands/               Slash commands for Claude Code
│   │   ├── plan.md    → /plan
│   │   ├── generate.md → /generate
│   │   ├── heal.md    → /heal
│   │   └── demo.md    → /demo
│   └── settings.json           Pre-authorized safe commands
│
├── CLAUDE.md                   Project orientation (auto-loaded by Claude Code)
└── playwright.config.ts        Config + exported HEALER_GUARDRAILS
```

## Data Contracts

### Telemetry event

The Planner reads `checkout_error.json`. The fields it uses to write the plan:

| Field | Value | Used for |
|-------|-------|---------|
| `event` | `checkout_submit_failed` | Names the anomaly |
| `message` | `User clicked 'Submit' but API returned 500 on /checkout` | Problem statement |
| `httpStatus` | `500` | Expected failure condition |
| `latencyMs` | `1428` | Context for timing assertions |
| `labels.flow` | `checkout` | Scopes the test suite |
| `k6.checks["checkout endpoint returned 2xx"]` | `false` | The failing check to reproduce |

### Selector contract

All agents interact with the UI **only** through `data-testid` attributes. This is the interface contract between agents and the DOM:

```
checkout-shell          root wrapper
session-banner          auth status pill
cart-summary            subtotal display
cart-items              item list
shipping-form           the checkout <form>
shipping-name-input     name field
shipping-email-input    email field
shipping-address-input  address field
shipping-postal-input   postal code field
shipping-method-select  shipping dropdown
payment-method-select   payment dropdown
payment-button          submit CTA
checkout-message        result banner (hidden until submit)
```

:::warning Never use CSS class selectors
The healer cannot distinguish between "selector broke because the class was refactored" and "selector broke because the feature was removed." `data-testid` makes every locator change auditable and intentional.
:::

### Healer guardrails

Defined in `playwright.config.ts` as `HEALER_GUARDRAILS` and embedded in `.claude/agents/healer.md`:

| Category | Examples |
|----------|---------|
| ✅ Allowed | Rename a `data-testid` that changed in the DOM, adjust wait timeout, fix changed button label |
| ❌ Forbidden | Remove assertions, skip required flow steps, add try/catch to swallow failures |
| 🔴 Escalate | `shipping-form` absent from DOM, unexpected 500 from API, core assertion must be removed to pass |

## The Grounding Baseline

`tests/seed.spec.ts` is the immutable grounding file. It establishes that:

1. The app renders with the authenticated session (`Ada Lovelace`)
2. The cart, shipping form, and payment button are all present
3. The telemetry event matches the expected anomaly shape

The Planner reads the seed test to understand what the app _does_, not just what the telemetry _says_. The Generator inherits the same baseline assumptions. The Healer uses it as the reference for what "correct" looks like.

**Never modify the seed test to force a pass.** If it breaks, that is a real signal.
