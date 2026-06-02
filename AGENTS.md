# Agent Instructions

Add project-specific agent instructions here.

<!-- HARNESS:BEGIN -->
## Harness

This repo uses Harness. Before work, read:

- `README.md`
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTEXT_RULES.md`
- `scripts/bin/harness-cli query matrix`

Use the Rust Harness CLI at `scripts/bin/harness-cli` as the main operational
tool.
<!-- HARNESS:END -->

## Review guidelines

- Detect hidden bugs, including concurrency, transaction, stale-snapshot, and
  malformed-input regressions.
- Flag security vulnerabilities, especially auth, authorization, secret
  exposure, unsafe logging, payment, webhook, and provider-verification issues.
- Identify counterproductive design patterns that weaken domain boundaries,
  duplicate business rules, or add indirection without reducing complexity.
- Check whether high-risk changes include focused tests and Harness evidence.
- Prioritize serious, high-confidence P0 and P1 findings over style feedback.
