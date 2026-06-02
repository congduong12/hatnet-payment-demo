# Overview

## Current Behavior

The repository has Harness guidance, story packets, a test matrix, and local
validation commands, but no GitHub workflow that turns pull-request changes into
an automated review pass. Human reviewers must manually remember repo-specific
rules such as Harness source hierarchy, checkout/cart concurrency risk, and
security-sensitive GitHub Actions constraints.

## Target Behavior

The repository exposes two GitHub workflows:

- deterministic pull-request checks that run without AI secrets
- an `/improve` pull-request command that calls OpenAI from a safe default-branch
  workflow, reviews the PR diff through the GitHub API, and posts or updates one
  advisory review comment

The bot is focused on hidden bugs, security vulnerabilities, counterproductive
design patterns, missing tests, and contract drift.

## Affected Users

- Repository owner.
- Maintainers reviewing pull requests.
- Future agents working from Harness context.

## Affected Product Docs

- `docs/agents/github-review-bot.md`
- `docs/TEST_MATRIX.md`
- `.github/workflows/pr-checks.yml`
- `.github/workflows/ai-review.yml`
- `scripts/github-review-bot/review-pr.mjs`

## Non-Goals

- No auto-merge.
- No auto-fix commits.
- No automatic approval or `REQUEST_CHANGES`.
- No inline comments in MVP.
- No GitHub App in MVP.
- No execution of untrusted pull-request code inside the AI review workflow.
