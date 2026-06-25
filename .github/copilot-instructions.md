# Agentic QA Loop Repository Instructions

- Use `tests/seed.spec.ts` as the grounding file before generating or healing tests.
- Treat `specs/` as the human-readable source of truth.
- Use `observability/mock_telemetry_data/` instead of live tracing infrastructure for demo determinism.
- Keep the Healer conservative: if the app flow is genuinely missing, skip and escalate instead of masking defects.
- Initialize the agent definitions with:

```bash
npx playwright init-agents --loop=vscode
```

- The generated VS Code agent definitions should be able to read the local workspace files directly.
