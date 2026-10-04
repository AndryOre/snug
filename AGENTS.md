# AGENTS.md

Instructions for coding agents working in this repository.

## Layout

Snug is a bun-workspaces monorepo orchestrated by Turborepo
([ADR 0010](docs/adr/0010-bun-workspaces-monorepo.md)). The root is tooling only
(husky, commitlint, prettier, eslint, turbo, knip). Stack rules live next to the
code they govern, and apply on top of this file:

- [`apps/extension/AGENTS.md`](apps/extension/AGENTS.md) — the Chrome MV3
  extension (WXT, React 19, Tailwind CSS v4).
- [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md) — the shared shadcn/ui and
  theme package (`@workspace/ui`).

The code map is [`docs/architecture.md`](docs/architecture.md). Skills stay in
the root `.claude/skills`.

## Running scripts

Always use `bun run <script>` from the repo root — never call the underlying
tool directly, and never mix in another package manager (this repo uses
`bun.lock`). Read `package.json`'s `scripts` before inventing a command.

- `bun run check` — Turborepo runs each workspace's `check`, plus the root gate:
  format:check, lint, typecheck, knip. Run this after any change.
- `bun run test` — Turborepo runs each workspace's Vitest suite. Run this after
  any change to tested code (`apps/extension/lib/**` and its consumers).
- `bun run build` — **do not run unless explicitly asked.** It's slow and not
  needed to verify most changes.

## Branch and commit conventions

Branch names and commit/PR titles follow fixed patterns, gitmoji included by
convention (not lint-enforced). Detail:
[`docs/development.md#branch-naming`](docs/development.md#branch-naming),
[`docs/development.md#commit-format`](docs/development.md#commit-format).

## Code comments

Every code comment (outside `packages/ui/**`) is a TSDoc block on a non-obvious
export — no `//` or non-JSDoc `/* */` comments, except lint/type directives.
Detail:
[`docs/development.md#code-documentation`](docs/development.md#code-documentation),
[`docs/adr/0002-tsdoc-only-code-comments.md`](docs/adr/0002-tsdoc-only-code-comments.md).

## Escalating a `@shadcn/lint` finding

When `bun run lint` reports a `shadcn/*` finding (e.g. `shadcn/no-restyle`) on a
component you're changing, work up this ladder — never disable the rule
file-wide or project-wide:

1. Use an existing shadcn/ui variant that already covers the styling you need.
2. Add a new variant to the component if no existing one fits.
3. Add or change a `no-restyle` contract in `shadcnNoRestyleContracts`
   (`eslint.config.mjs`), encoding one real, bounded design decision. Detail:
   [`docs/development.md#adding-a-shadcnlint-contract`](docs/development.md#adding-a-shadcnlint-contract).
4. Last resort: a single-line `eslint-disable-next-line -- <reason>` on the
   exact offending line. Never a file-level or project-level disable.
