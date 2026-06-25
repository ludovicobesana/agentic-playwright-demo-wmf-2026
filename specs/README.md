# Specs

This folder is the single source of truth for human-readable QA intent.

Write plans in Markdown with the following shape:
- Intent
- Source inputs
- Problem statement
- Preconditions
- Steps
- Expected outcomes
- Necessary data
- Selector map
- Acceptance criteria

The Planner consumes telemetry and `tests/seed.spec.ts`, then writes a new Markdown file here. The Generator reads the Markdown and produces a matching executable test under `tests/generate/`.
