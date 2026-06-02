# Exec Plan

## Goal

Set up GitHub pull-request checks plus the official Codex GitHub review
integration. Maintainers can request a review with `@codex review` or enable
Automatic reviews in Codex settings.

## Scope

In scope:

- High-risk story packet for the review bot.
- Review guidance in `AGENTS.md` and supporting notes under `docs/agents/`.
- Harness matrix row.
- Deterministic pull-request checks workflow.
- Human setup checklist for Codex Cloud and Code review settings.

Out of scope:

- GitHub App creation.
- Browser E2E for the review bot.
- Inline PR review comments.
- Auto-fix patches.
- Custom OpenAI API calls from GitHub Actions.

## Risk Classification

Risk flags:

- Audit/security.
- External systems.
- Public contracts.
- Existing behavior.
- Weak proof.
- Multi-domain.

Hard gates:

- External provider behavior.
- Audit/security.

Lane: high-risk.

## Work Phases

1. Discovery: read Harness docs, current matrix, package scripts, and existing
   GitHub workflow state.
2. Design: keep deterministic PR checks separate from official Codex review.
3. Validation planning: define local repo checks and GitHub smoke proof.
4. Implementation: add PR checks, Codex review guidelines, and setup docs.
5. Verification: run local repo checks and GitHub PR smoke.
6. Harness update: update matrix and record trace.

## Stop Conditions

Pause for human confirmation if:

- Codex Cloud cannot be connected to the repository.
- Repository review policy needs more than the official Codex integration
  provides.
