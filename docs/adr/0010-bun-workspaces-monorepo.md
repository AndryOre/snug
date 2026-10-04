# 10. Bun workspaces monorepo with Turborepo

## Status

Accepted. Supersedes the "not a bun workspace" decision in
[ADR 0009](0009-promo-video-isolated-remotion-package.md), which is marked
superseded; the promo video now lives in `apps/video`.

## Context

A marketing site for the extension is planned. It must reuse the extension's
shadcn components, brand tokens and agent instructions. `video/` already shows
the cost of the isolated-package approach: fonts, screenshots and brand colors
are copied by hand and drift. Nearly all root tooling (the generated `.wxt`
tsconfig, ESLint globs, Prettier, `components.json`, knip, CI without path
filters) assumes a single package at the root.

## Decision

- The repo becomes a bun-workspaces monorepo: `apps/*` and `packages/*`, with
  shared dependency versions pinned in a bun catalog. `bunfig.toml` sets the
  isolated linker explicitly; `hoisted` is the fallback if WXT or Remotion
  break.
- The extension moves to `apps/extension`, the shadcn primitives, `cn`, hooks
  and theme tokens to `packages/ui` (`@workspace/ui`, shadcn monorepo mode), and
  the promo video to `apps/video`. Every app has its own `components.json`
  pointing at the shared package, so the future Astro landing consumes the same
  components.
- Turborepo orchestrates `check`, `test`, `build` and `zip`, with local cache
  only and `--affected` in CI. Root scripts stay as wrappers so `bun run check`
  and `bun run test` keep working.
- Extension releases keep the bare `v*` tag and `release.yml`. Other apps are
  not versioned.
- Agent instructions split into a root `AGENTS.md` plus one per workspace;
  skills stay in the root `.claude/skills`.

### Considered options

- **Nested isolated `site/` package, like `video/`** — lowest migration cost,
  but shares no components or agent context and repeats the copy-and-drift
  problem.
- **Nx** — broke on bun lockfile v2 in September 2026 and is heavy for one
  developer.
- **pnpm workspaces** — more mature, but the repo is on bun and the known bun
  workspace issues do not affect it.
- **Bun `--filter` only** — no cache and no affected filtering.

## Consequences

- Moving files keeps history through `git mv`; the existing `v*` tags stay the
  extension's.
- The Chrome Web Store sources zip needs `zip.sourcesRoot` at the repo root with
  an allowlist, or reviewers cannot rebuild the extension.
- `turbo prune` is not used with `bun.lock`.
- `docs/agents/domain.md` now describes a monorepo with one shared `CONTEXT.md`.
