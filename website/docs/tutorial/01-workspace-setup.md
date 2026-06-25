---
title: 1. Set Up The Workspace
sidebar_position: 3
---

# 1. Set Up The Workspace

## Goal

Get the checkout app, the seed test, and Claude Code all into a known-good state before any agent starts planning.

---

## Step 1 — Install and start the app

```bash
npm install
npm run start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). You should see a clean checkout page.

**What to verify visually:**

| Element | Expected state |
|---------|---------------|
| Session banner | "Signed in as Ada Lovelace" |
| Cart items | Trailhead Hoodie, Insulated Bottle, Merino Socks |
| Cart summary | Shows a Subtotal line |
| Shipping form | Visible with all input fields |
| Payment button | Enabled, labelled "Submit payment" |
| Checkout message | Hidden (not visible) |

---

## Step 2 — Run the grounding test

```bash
npm run test:seed
```

This runs `tests/seed.spec.ts`, the immutable baseline. It must pass before any agent starts work.

Expected output:
```
Running 1 test using 1 worker
✓  seed grounding › establishes the authenticated checkout baseline (1.4s)

1 passed (3.1s)
```

:::danger Never modify the seed test
`tests/seed.spec.ts` is the grounding contract. It defines what the app can do. If it breaks, the Planner and Generator have lost their reference point — fix the app, not the test.
:::

---

## Step 3 — Verify Claude Code orientation

Open Claude Code in this project directory. The repo ships with a `CLAUDE.md` at the root that Claude Code reads at the start of every session. It contains:

- The full `data-testid` map for the checkout UI
- The three-agent loop with file references
- The healer guardrail rules
- All key commands and test data

**Verify the context loaded correctly.** Ask Claude Code:

> "What are the healer guardrails in this project?"

A correctly oriented Claude Code should answer from `CLAUDE.md` without searching files:
- Allowed: update locators, fix timing, fix small data mismatches
- Forbidden: bypass assertions, patch missing flows, force green
- Escalation: if the checkout contract breaks, `.skip` + escalate

:::tip Pre-authorized commands
`.claude/settings.json` pre-authorizes `npm run test:*`, `npm run start`, and `npx playwright *` commands so the demo never stalls on a permission prompt.
:::

---

## Step 4 — (Optional) Start Grafana

```bash
docker compose -f observability/docker-compose.yml up
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001) and navigate to the **Checkout Error Spike** dashboard. This is the visual entry point for the demo — you show the audience the spike before typing `/plan`.

---

## What Success Looks Like

- `http://127.0.0.1:3000` shows the authenticated checkout
- `npm run test:seed` passes with 1 passed
- Claude Code answers project questions using `CLAUDE.md` context without file searches
- (Optional) Grafana dashboard visible at `http://127.0.0.1:3001`

---

## Next

Continue to [read the telemetry](./read-the-telemetry) to understand the incident the Planner will consume.
