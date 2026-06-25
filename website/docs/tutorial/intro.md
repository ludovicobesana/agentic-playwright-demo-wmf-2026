---
title: Guided Tutorial
sidebar_position: 1
---

# From Telemetry to Tests

This tutorial walks you through the complete agentic QA loop using **Claude Code** as your development environment. In four steps you move from a production error signal to an executable, self-healing Playwright test.

## The Loop

```
observability/mock_telemetry_data/checkout_error.json
          │
          ▼
       /plan  ──────────────────► specs/anomaly-repro.md
                                           │
                                           ▼
                                      /generate  ──► tests/generate/anomaly.spec.ts
                                                               │
                                                    npm run test:generated
                                                               │
                                               failure? ──► /heal  ──► repaired ✓
                                                                    or .skip + escalate ⚠️
```

## What You Will Build

| Step | Slash command | Input | Output |
|------|---------------|-------|--------|
| [1. Workspace setup](./workspace-setup) | — | Repository + Claude Code | Known-good baseline |
| [2. Read the telemetry](./read-the-telemetry) | — | `checkout_error.json` | Incident understanding |
| [3. Write the plan](./write-the-plan) | `/plan` | Telemetry + seed test | `specs/anomaly-repro.md` |
| [4. Generate the test](./generate-the-test) | `/generate` | Markdown spec | `tests/generate/anomaly.spec.ts` |
| [5. Run and heal](./run-and-heal) | `/heal` | Failing test + DOM | Repaired test or escalation |

## Before You Start

```bash
npm install
npm run start        # starts the checkout app on http://127.0.0.1:3000
```

You also need **Claude Code** open in this directory. The project ships with a `CLAUDE.md` that automatically orients Claude Code to the agent loop, the `data-testid` map, the healer guardrails, and all key commands. You do not need to explain anything manually.

:::tip Run the whole loop at once
Type `/demo` in Claude Code to walk through all four steps in a guided conference-style sequence.
:::

When you are ready, continue to [architecture overview](./architecture) to understand how the three agents interact before running them.
