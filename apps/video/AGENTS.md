# AGENTS.md — `apps/video`

Stack rules for `@snug/video`, the Remotion promo video. Repo-wide rules
(scripts, commits, comments) are in the root [`AGENTS.md`](../../AGENTS.md).

## Stack

Remotion 4 (rspack bundler), React 19 and TypeScript, installed with the rest of
the workspace by a single root `bun install`. React, TypeScript and `@types/*`
come from the root catalog; the `remotion` and `@remotion/*` packages stay
pinned to one exact version together. See
[ADR 0010](../../docs/adr/0010-bun-workspaces-monorepo.md).

## Rules

- Copy comes from the extension: locales from `apps/extension/locales/*.json`
  and store captions from `apps/extension/e2e-store/captions.ts`. Import them
  across the workspace boundary by relative path; never copy strings.
- Run scripts from the repo root: `bun run video:studio`, `video:still`,
  `video:render`, `video:thumbnails`. `check` runs `tsc --noEmit` through
  Turborepo; Prettier and ESLint run at the root.
- Keep `remotion` and every `@remotion/*` dependency on the same exact version.
- Never use sudo. Setup, the headless browser fallback and render details are in
  [`README.md`](README.md).
