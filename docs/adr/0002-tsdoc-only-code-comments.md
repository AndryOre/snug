# 0002: TSDoc-only code comments

## Status

Accepted. Partly superseded by
[0028](0028-oxc-toolchain-replaces-prettier-and-most-of-eslint.md): the lint
tooling that enforces it.

Date: 2026-09-29

Revised: 2026-11-01, the enforcing lint rules now run under Oxlint (ADR 0028)
instead of ESLint.

## Context

The codebase had a mix of Spanish `//` line comments, Spanish non-JSDoc `/* */`
block comments, and occasional English `/**` JSDoc blocks, with no enforced
convention for when to use which. Nothing prevented a comment from drifting out
of sync with the code it described, and nothing required a comment on a
genuinely non-obvious export in the first place. No core lint rule (in ESLint,
Oxlint, `typescript-eslint`, or the plugins already in this repo's lint config)
bans non-doc comments outright — the closest built-ins either forbid specific
comment _content_ (e.g. banning `@ts-ignore`) or require documentation on top
of, rather than instead of, free-form comments.

## Decision

- **TSDoc only.** Every code comment is a `/**` TSDoc block; plain `//` line
  comments and non-JSDoc `/* */` block comments are disallowed, with the sole
  exception of the directive comments a linter or bundler requires (e.g. an
  `eslint-disable` or `oxlint-disable` line, which must itself carry a
  description).
- **TSDoc is added only where it earns its place**, on non-obvious exports — not
  on every function, and never restating what a signature already says.
- **`eslint-plugin-jsdoc`'s `informative-docs` rule is enforced** (loaded as the
  `jsdoc-js` Oxlint jsPlugin), so a TSDoc block that only repeats its symbol's
  name back cannot pass review.
- **This is lint-enforced through a local rule**, written for this repository,
  because no core rule in the existing toolchain bans non-JSDoc comments; a
  policy that isn't enforced by tooling erodes the first time someone is in a
  hurry.

### Rejected alternatives

- **A free-form, unenforced comments policy** (write good comments, please) —
  rejected because a convention nothing checks drifts back to whatever the
  previous mix was within a few PRs.
- **`require-jsdoc` on every export** — rejected because it produces boilerplate
  documentation on self-explanatory exports (a one-line getter, a trivially
  named constant), which is noise, not information.
- **Adopting TypeDoc** — rejected as unnecessary generated-docs tooling for a
  single-maintainer browser extension with no published API surface to document
  a reference site for.

## Consequences

- Rationale that used to live as a `//` comment above a config value (a lint
  rule exception, a magic number, a workaround) now lives as a TSDoc block on
  that constant's own declaration instead, since a bare value with no
  explanation would fail the "why does this exist" review bar the old comments
  were meeting.
- `packages/ui/**` (the shadcn/ui generated registry layer) is permanently
  exempt from this policy — it is vendored, not hand-authored, and holding it to
  a hand-authored documentation standard would fight every future `shadcn add`.
- Existing Spanish comments across the app are not migrated by this decision
  alone; that migration is tracked as separate, later work.
