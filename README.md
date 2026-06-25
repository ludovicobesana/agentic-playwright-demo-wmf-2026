# Agentic QA Loop Proof of Concept

This repository demonstrates an agentic QA loop where production-style telemetry drives Playwright planning, generation, and healing. The demo uses a local checkout app, mocked observability data, and Markdown as Code so the conference walkthrough stays deterministic.

## What Ships

- `app/` contains a local Express checkout app with stable `data-testid` hooks.
- `observability/` contains a Grafana Compose stack plus mock telemetry JSON.
- `specs/` is the human-readable source of truth for QA intent.
- `tests/` contains the grounded seed test and generated executable Playwright specs.
- `.github/` contains agent instructions and CI wiring for the demo flow.

## Requirements

- Node.js 18+
- VS Code 1.105+ for native MCP agent support
- Docker if you want to launch the mock Grafana stack

## Install

```bash
npm install
```

## Run The App

```bash
npm run start
```

The checkout app runs on `http://127.0.0.1:3000`.

## Run The Observability Demo

```bash
docker compose -f observability/docker-compose.yml up
```

Grafana is exposed on `http://127.0.0.1:3001` with a provisioned dashboard that visualizes the mock checkout spike.

## Run The Docs Site

```bash
npm run docs:start
```

The Docusaurus website runs on `http://127.0.0.1:3002` and includes a guided tutorial that walks through the project step by step.

## Playwright Grounding

The repository uses `tests/seed.spec.ts` as the grounding file. It establishes the authenticated baseline, confirms the checkout shell renders, and anchors the planner and generator to the same app state.

## Agent Bootstrap

Initialize the VS Code agent definitions with:

```bash
npx playwright init-agents --loop=vscode
```

That command is expected to populate the `.github/` agent definitions used by the Planner, Generator, and Healer.

## Demo Flow

1. The Incident: open Grafana and show the checkout error spike from the mocked telemetry dashboard.
2. The Trigger (Planner): pass `observability/mock_telemetry_data/checkout_error.json` and `tests/seed.spec.ts` to the Planner in VS Code MCP so it writes `specs/anomaly-repro.md`.
3. Live Generation (Generator): ask the Generator to map the Markdown plan into `tests/generate/anomaly.spec.ts` and validate selectors against the live browser DOM.
4. Self-Healing (Healer): run the generated test, intentionally alter a `data-testid` in the local checkout DOM to simulate UI drift, and let the Healer repair only locator/timing drift.

## Guardrails

- The Healer may update locators, waits, and minor data mismatches.
- The Healer must not bypass assertions to force a green build.
- If the checkout flow is missing or a real business defect is exposed, the loop must stop and the test must be marked skipped for human review.
- Deep structural changes require human approval.

These rules are reflected in `playwright.config.ts` and the agent instructions under `.github/agents/`.

## Useful Commands

```bash
npm run test:seed
npm run test:generated
npm run show-report
```

## Notes On The Mock Setup

The telemetry layer is intentionally fake. The repository does not require a live tracing cluster, and the Grafana dashboard is backed by provisioned demo data rather than a fragile production integration.