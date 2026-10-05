# 12. Deploy secrets are dotenvx-encrypted in the repository

## Status

Accepted.

## Context

The landing page deploys from CI by calling the Coolify API, which needs an API
token ([ADR 0011](0011-landing-static-site-no-third-party-scripts.md) keeps the
site itself free of runtime secrets). The sibling streamboss repository already
solves this: its secrets live in an encrypted `.env` committed to the
repository, and GitHub holds only the private key. This repository is public, so
the choice needs to be explicit.

## Decision

- `COOLIFY_API_TOKEN` is stored in the root `.env`, encrypted with
  [dotenvx](https://dotenvx.com/encryption) and committed.
- The private key stays in `.env.keys`, which is git-ignored. GitHub holds it as
  the `DOTENV_PRIVATE_KEY` secret; the maintainer keeps a copy in a password
  manager.
- CI reads the token through `dotenvx run -- <command>`. The Coolify application
  id is not secret and lives in the `SNUG_COOLIFY_APP_UUID` repository variable.
- `bun run env:encrypt` re-encrypts `.env` after a change.
- The extension and the site never read this file; it is for deploy tooling
  only.

### Considered options

- **A plain GitHub secret per value** — simplest for a single token and nothing
  sits in the history. Rejected for consistency with streamboss, where one
  `DOTENV_PRIVATE_KEY` covers every secret and the workflow code is shared.

## Consequences

- One secret in GitHub regardless of how many values deploy tooling needs later.
- The ciphertext is in the public history. If `DOTENV_PRIVATE_KEY` ever leaks,
  every value that was ever committed is exposed, so rotate the underlying
  tokens, not just the key.
- Adding a value means running `bun run env:encrypt` and committing `.env`.
- Only deploy tooling may use dotenvx: the shipped extension must stay free of
  secrets and network calls.
