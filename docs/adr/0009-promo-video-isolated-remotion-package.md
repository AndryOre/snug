# 9. Promo video is an isolated Remotion package

## Status

Accepted

## Context

The Chrome Web Store listing gets a 30-second promo video per locale, built with
Remotion. It reuses the extension's own strings (`locales/*.json`,
`e2e-store/captions.ts`), brand tokens and fonts, so it has to live next to the
code that owns them. Remotion brings its own React/TypeScript/ESLint setup,
rendering dependencies and a Chromium download, none of which the extension
needs, and the repo is documented as a single-package project
(`docs/agents/domain.md`).

## Decision

The video is an isolated bun package under `video/`, with its own
`package.json`, `tsconfig.json` and `bun.lock`. It is not a bun workspace. Root
`tsconfig.json`, ESLint, knip and Vitest ignore it, and it is not part of root
`bun run check` or CI. Root `video:*` scripts proxy into it.

### Considered options

- **Separate repo** — clean isolation, but the copy, screenshots and fonts would
  be copied out and drift out of sync with the extension.
- **Bun workspace** — shared install, but it breaks the single-package
  assumption in `docs/agents/domain.md` and pulls Remotion into the root
  lockfile and tooling.
- **`video/` folder with root dependencies** — Remotion's lint rules and types
  clash with the root rules and would force exceptions across the root config.

## Consequences

- Root scripts `video:install`, `video:studio`, `video:check`, `video:still` and
  `video:render` proxy into `video/`.
- `video/` has its own lockfile; dependency updates there are separate from the
  extension's.
- CI does not cover it. `bun run video:check` (typecheck and Prettier) is run by
  hand.
- A fresh clone needs a manual `bun run video:install` before any `video:*`
  script works.
