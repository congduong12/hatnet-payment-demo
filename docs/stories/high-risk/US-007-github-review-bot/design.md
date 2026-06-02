# Design

## Application Flow

```text
PR comment `@codex review` or Automatic reviews trigger
  -> official Codex GitHub integration
  -> read PR diff
  -> follow closest `AGENTS.md` review guidelines
  -> post a standard GitHub review focused on serious issues
```

The deterministic `pr-checks` workflow is separate:

```text
pull_request
  -> checkout PR code
  -> pnpm install
  -> pnpm check
  -> pnpm test
  -> pnpm build
```

## Interface Contract

### Command

`@codex review`

## UI / Platform Impact

- GitHub Actions keeps the deterministic `pr-checks` workflow.
- GitHub pull requests receive reviews from the official Codex integration.
- Repository maintainers configure Code review and Automatic reviews in Codex
  settings, not GitHub Actions secrets.

## Alternatives Considered

1. Custom GitHub Actions workflow calling the OpenAI API: validated locally and
   in GitHub, but rejected because API billing is separate from ChatGPT Plus.
2. `pull_request_target`: unnecessary for the selected official integration and
   risky if mixed with checkout/build of untrusted code.
