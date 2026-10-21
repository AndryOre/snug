# 0022: The Coolify token is a GitHub secret, not a dotenvx-encrypted file

## Status

Accepted. Supersedes [0012](0012-dotenvx-encrypted-deploy-secrets.md).

Date: 2026-10-12

Revised: 2026-10-21, Status relation wording now uses the linked phrase form,
recorded on both sides.

## Context

[ADR 0012](0012-dotenvx-encrypted-deploy-secrets.md) kept `COOLIFY_API_TOKEN` in
a dotenvx-encrypted `.env` committed to this public repository, for consistency
with streamboss. The token is the only value the file ever held. Replacing it
meant committing new ciphertext to the public history, and a leak of
`DOTENV_PRIVATE_KEY` would expose every value ever committed. The deploy also
now needs the token to carry the `write` ability, because it publishes the
sitemap `lastmod` dates as a build variable before deploying.

## Decision

- `COOLIFY_API_TOKEN` is a repository secret in GitHub Actions. The deploy
  workflow passes it to `deploy-coolify.sh` as an environment variable.
- The token needs the `read`, `write` and `deploy` abilities.
- The Coolify application id stays in the `SNUG_COOLIFY_APP_UUID` repository
  variable.
- The encrypted `.env`, the `env:encrypt` script, the `@dotenvx/dotenvx`
  dependency and the `DOTENV_PRIVATE_KEY` secret are removed.

## Consequences

- No ciphertext in the public history, and rotating the token needs no commit.
- The previous token stays in the git history as ciphertext, so it must be
  revoked in Coolify rather than just replaced.
- One secret per repository: streamboss keeps its own copy, and rotating the
  shared token means updating both.
- Only deploy tooling may use the token: the shipped extension and the site stay
  free of secrets and network calls.
