---
title: 2. Read The Telemetry
sidebar_position: 4
---

# 2. Read The Telemetry

## Goal

Understand the production incident that will drive the entire QA loop. The Planner does not invent a problem — it consumes this signal and turns it into a reproducible QA plan.

---

## The Telemetry Event

Open `observability/mock_telemetry_data/checkout_error.json`:

```json
{
  "timestamp": "2026-06-02T09:14:27.403Z",
  "service": "checkout-web",
  "level": "error",
  "event": "checkout_submit_failed",
  "message": "User clicked 'Submit' but API returned 500 on /checkout",
  "requestId": "req-7f3b8f0b1f2c",
  "checkoutId": "chk-10482",
  "httpStatus": 500,
  "latencyMs": 1428,
  "labels": {
    "flow": "checkout",
    "customerTier": "prospect",
    "region": "us-west-2",
    "frontend": "playwright-agentic-demo"
  },
  "k6": {
    "scenario": "checkout_smoke",
    "errorRate": 0.27,
    "checks": {
      "submit button visible": true,
      "checkout endpoint returned 2xx": false
    }
  }
}
```

### What this tells the Planner

| Field | Signal | Planner decision |
|-------|--------|-----------------|
| `event: checkout_submit_failed` | The submit path broke | Test must cover the full form → submit flow |
| `httpStatus: 500` | Server-side failure, not a UI bug | The success path assertion must be present |
| `k6.checks["submit button visible"]: true` | The button rendered fine | No need to test button visibility separately |
| `k6.checks["checkout endpoint returned 2xx"]: false` | The API call failed | The test must assert the result banner state |
| `errorRate: 0.27` | 27% of submissions failed | One test is enough; no need for load coverage |
| `latencyMs: 1428` | Slow response | Generator should add a reasonable wait |

:::info The telemetry is intentionally fake
There is no live tracing cluster. The JSON is a deterministic fixture that makes the demo reproducible. In a real system this would come from Datadog, Grafana Tempo, or your APM of choice.
:::

---

## The Grafana Dashboard

If Docker is running, open [http://127.0.0.1:3001](http://127.0.0.1:3001) and select the **Checkout Error Spike** dashboard.

The dashboard visualizes the same data as the JSON file. It is the **visual entry point for the live demo**: you show the audience the spike, say "this is our incident", and then type `/plan` to start the loop.

---

## How Claude Code Uses This File

When you type `/plan`, Claude Code (acting as the Planner agent) will:

1. Read `checkout_error.json` — to understand the incident
2. Read `tests/seed.spec.ts` — to understand what the app currently does
3. Read `app/public/index.html` — to verify selectors exist in the live DOM
4. Write `specs/anomaly-repro.md` — a structured QA plan grounded in both signals

The Planner is **not** free to invent selectors or steps that are not supported by the live DOM. If it cannot find the checkout form, it escalates instead of guessing.

---

## Replay the Failure Mode

The app exposes a `CHECKOUT_FORCE_500` environment toggle that replays the exact failure condition:

```bash
CHECKOUT_FORCE_500=1 npm run test:generated
```

This forces `/api/checkout` to return `500`, simulating the production incident. The generated test must fail with a meaningful message — not silently pass.

---

## Next

Continue to [write the plan](./write-the-plan) to see how the Planner converts this signal into a Markdown spec.
