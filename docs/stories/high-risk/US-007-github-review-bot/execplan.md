# Exec Plan

## Goal

Set up a safe MVP GitHub review bot that maintainers can invoke with
`/improve` on pull requests. The bot should use OpenAI and a Codex-oriented
review contract to find hidden bugs, security vulnerabilities, and
counterproductive design patterns.

## Scope

In scope:

- High-risk story packet for the review bot.
- Review contract under `docs/agents/`.
- Harness matrix row.
- Deterministic pull-request checks workflow.
- `/improve` command workflow.
- Node script that fetches PR metadata, filters diff, calls OpenAI Responses
  API, validates structured output, and updates one PR comment.
- Dry-run and self-test mode for offline validation.
- Human setup checklist for GitHub secret and variable configuration.

Out of scope:

- GitHub App creation.
- Browser E2E for the review bot.
- Inline PR review comments.
- Auto-fix patches.
- Running OpenAI against fork pull requests by default.

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
2. Design: split deterministic PR checks from AI review to avoid mixing secrets
   with untrusted PR execution.
3. Validation planning: define dry-run/self-test proof and GitHub smoke proof.
4. Implementation: add docs, workflows, script, and fixtures.
5. Verification: run local self-test and syntax checks.
6. Harness update: update matrix and record trace.

## Stop Conditions

Pause for human confirmation if:

- The bot should run on fork PRs by default.
- The bot should post inline review comments in MVP.
- The bot should use `pull_request_target`.
- The bot should auto-approve, request changes, or push fixes.
- The OpenAI model/account access differs from the configured `OPENAI_MODEL`.
