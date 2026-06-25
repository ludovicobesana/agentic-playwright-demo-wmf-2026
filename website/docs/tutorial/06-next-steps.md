---
title: 6. Next Steps
sidebar_position: 8
---

# 6. Next Steps

You have walked through the complete loop: telemetry → plan → generate → run → heal. Here is how to take it further.

---

## Claude Code Commands Reference

These slash commands are available in any Claude Code session inside this project:

| Command | Agent | What it does |
|---------|-------|-------------|
| `/plan` | Planner | Reads `checkout_error.json` + seed test → writes `specs/anomaly-repro.md` |
| `/generate` | Generator | Reads `specs/anomaly-repro.md` → writes `tests/generate/anomaly.spec.ts` |
| `/heal` | Healer | Runs generated tests, diagnoses failures, repairs drift or escalates |
| `/demo` | All | Runs the full 4-step conference walkthrough in sequence |

---

## CI Integration

The workflow in `.github/workflows/ci.yml` already runs the seed test and the generated test on every push. The healer handoff comment shows where an automated repair step would sit:

```yaml
- name: Healer handoff point
  if: failure()
  run: |
    echo "An automated Healer would inspect traces and patch only locator/timing drift."
    echo "If the checkout flow is missing, the Healer stops and marks the test skipped."
```

To make this real, replace the `echo` steps with a Claude Code non-interactive invocation:

```bash
claude --print "/heal" --no-interactive
```

---

## Extend the Telemetry Layer

Add more anomaly scenarios to `observability/mock_telemetry_data/`:

```json
{
  "event": "cart_empty_on_load",
  "httpStatus": 200,
  "message": "Cart items array empty despite authenticated session",
  "labels": { "flow": "cart" }
}
```

Each new JSON file can be passed to `/plan` with:
```
/plan observability/mock_telemetry_data/cart_empty_on_load.json
```

---

## Add More Generated Tests

The `tests/generate/` directory accepts multiple spec files. Add a new anomaly spec and a matching generated test:

```
specs/
├── anomaly-repro.md           (existing)
└── cart-empty-repro.md        (new)

tests/generate/
├── anomaly.spec.ts            (existing)
└── cart-empty.spec.ts         (new)
```

---

## Evolve the Agents

The agent definitions live in `.claude/agents/`. They are markdown files — edit them to tune agent behavior without touching the application code:

- Add domain knowledge to the Planner (e.g. "always include a 400-error scenario")
- Tighten the Generator's assertion style (e.g. "always assert total price matches cart subtotal")
- Add more escalation triggers to the Healer (e.g. "escalate if latency assertions change")

---

## Ideas for Live Extension

| Idea | Complexity | Description |
|------|-----------|-------------|
| Screenshot diff | Low | Add visual regression to the seed test |
| Trace annotation | Low | Tag Playwright traces with telemetry `requestId` |
| Multi-agent parallel | Medium | Run Planner and Generator in parallel for multiple incidents |
| Real APM integration | Medium | Replace mock JSON with a Datadog log query |
| Healer PR bot | High | Auto-open a PR when the Healer repairs a test |

---

## Finish Line

At this point you can:

- Move from a production error signal to a passing Playwright test without writing a single line manually
- Trust the Healer to repair locator drift without masking real defects
- Use the guardrail system to keep the loop honest under CI pressure
- Extend the pattern to new incidents, new apps, and new agents

The key shift is not "AI writes tests faster." It is **QA engineers becoming orchestrators** — defining intent, setting guardrails, and letting agents handle the mechanical translation between signals and code.
