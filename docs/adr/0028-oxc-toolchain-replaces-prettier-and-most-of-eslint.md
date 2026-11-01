# 0028: Oxc toolchain replaces Prettier and most of ESLint

## Status

Accepted. Partly supersedes [0002](0002-tsdoc-only-code-comments.md) and
[0027](0027-practices-parity-with-afe.md): the ESLint and Prettier specific
parts.

Date: 2026-11-01

## Context

`bun run lint` (ESLint with typescript-eslint `recommendedTypeChecked`,
`@eslint-react`, unicorn, jsdoc, jsx-a11y, vitest, astro, `@shadcn/lint` and the
local comment policy) took about 73 s uncached, Prettier about 18 s and the
extension typecheck about 11 s. Agents and CI waited on all three, and the
waiting grew with every rule added. The goal was to stop running ESLint and
Prettier for everything but `.astro`, without losing or loosening a single rule.

Measured in a scratch copy before the migration:

| Step                | Before               | After                         |
| ------------------- | -------------------- | ----------------------------- |
| Lint                | ESLint 73 s          | Oxlint about 23 s (with shim) |
| Format              | Prettier 18 s        | Oxfmt 1.3 s                   |
| Extension typecheck | `tsc` 11.3 s         | `tsc` 1.7 s (TypeScript 7.1)  |
| Site typecheck      | `astro check` 11.5 s | content mapper 0.7 s          |

## Decision

- **Oxlint replaces ESLint for everything except `.astro`.** `bun run lint` runs
  `oxlint --type-aware --deny-warnings` (tsgolint supplies the type-aware rules)
  and then ESLint on `**/*.astro` only. The single config is `oxlint.config.ts`,
  which keeps the `shadcnNoRestyleContracts` doc block. Rules without a native
  port load as aliased jsPlugins (`unicorn-js`, `jsdoc-js`, `shadcn`, `local`,
  `typed-react`) with the same options, severity and file scopes as before;
  per-directory exemptions (`packages/ui/**`, `apps/video/**`, tests,
  `**/e2e/**`) are `overrides` entries that turn rules off.
  `reportUnusedDisableDirectives` is `error`.
- **Oxfmt replaces Prettier** (`.oxfmtrc.json`) with the same style options,
  Tailwind class sorting, import groups and ignore patterns. The one reformat
  commit is listed in `.git-blame-ignore-revs`.
- **TypeScript is split.** `typescript` stays 6.x for tools that use the classic
  JS API (ts-api-utils, `@eslint-react`, the `typed-react` shim); `typescript7`
  (`npm:typescript@7.1.0-beta`, exact-pinned) runs every `tsc --noEmit` by
  calling its bin explicitly, because under bun `node_modules/.bin/tsc` resolves
  to TypeScript 6. TypeScript 7.0 and 7.1 ship no classic JS API, so nothing
  that needs one can move. A test asserts the 7.1 version. `apps/site` replaces
  `astro check` with `@astrojs/ts-content-mapper` and
  `tsc --noEmit --runExternalCode`, filtering only the two untyped Starlight
  `Search.astro` virtual-module errors (`scripts/typecheck-site.ts`).
- **`typed-react` shim.** `@eslint-react/no-leaked-conditional-rendering` is the
  one type-aware `@eslint-react` rule and tsgolint does not run it. A local
  jsPlugin (`oxlint-plugins/typed-react.mjs`) runs the original rule with
  TypeScript 6 `parserServices` built from the file's nearest `tsconfig.json`,
  with one cached program per config and a loud failure for an uncovered file.
  Parity with the original rule beats losing the check.
- **ESLint stays for `.astro`.** Oxlint cannot see `.astro` templates or
  `<style>` blocks
  ([oxc#23207](https://github.com/oxc-project/oxc/issues/23207)), and the
  `shadcn/*` and `jsx-a11y` checks on the site live there. The ESLint config is
  reduced to `**/*.astro` with unchanged options, and `.eslintcache` stays for
  that run.
- **Never relax a rule to make Oxlint pass.** A diverging native port is fixed
  at the site in code or swapped for the original ESLint-engine rule through a
  jsPlugin. Severity, options and scopes do not change in this migration.
- **Parity is proven, not assumed.** A committed differential gate
  (`bun run lint:parity`, `scripts/lint-parity.ts`) compares ESLint with the
  baseline config against Oxlint per `(file, line, rule)`.
- **Cross-repo standard.** andryore-web and animated-fluent-emojis adopt the
  same decisions and naming (single root `oxlint.config.ts`, `<plugin>-js`
  aliases, `typescript7` alias, Oxfmt options), so a rule or fix lands in all
  three.

### Parity report

The gate runs over three inputs and passes with zero unexplained ESLint-only
findings:

- violation fixtures for every enforced rule and policy
  (`scripts/lint-parity-fixtures/expected.json`);
- an external TS/React corpus pinned by commit and downloaded by the script
  outside the repo (vercel/commerce, shadcn-ui/taxonomy, pmndrs/zustand);
- type-aware rules, tsgolint against typescript-eslint, on the same inputs.

Explained differences are recorded next to the fixtures and each has a reason:

- `accepted.json`: two location-only differences. Oxlint reports an unused
  `eslint-disable` / `eslint-enable` block on the closing comment instead of the
  opening one, and tsgolint-side `no-unsafe-declaration-merging` reports one of
  two declarations. In both the violation is still rejected.
- `untriggerable.json`: rules no input can make report in either linter
  (`react-hooks/config`, `react-hooks/gating`, and the two unicorn CSS rules,
  which need `@eslint/css`).

A gap that cannot be closed is reported and decided by the maintainer; it is
never auto-accepted.

## Alternatives considered

- **Keep ESLint and Prettier.** No change in rules, but agents and CI keep
  paying about 90 s per run and the cost grows with the rule set.
- **Use Oxlint's native ports only.** Faster, but drops rules that have no
  native port or diverge from the original, which this migration forbids.
- **Move everything to TypeScript 7.1.** Not possible: it has no classic JS API,
  so `@eslint-react`, ts-api-utils, the shim and `astro check` stay on 6.
- **Replace `astro check` outright.** Rejected until the content mapper covered
  the same error classes with zero hidden diagnostics; it now does, with the
  explicit two-error Starlight filter.

## Consequences

- Lint, format and typecheck are minutes faster for agents and CI. Type-aware
  Oxlint peak memory is recorded in CI; the `quality` job is split only if it
  passes 6 GB.
- Renovate groups the Oxc packages (`oxlint`, `oxlint-tsgolint`, `oxfmt`,
  `typescript7`), exact-pinned and without automerge.
- Two linters still run on a full lint: Oxlint, and ESLint on `.astro`. The
  disable-directive rule names differ by plugin alias, and a directive for a
  non-native rule uses the alias.
- `typescript7` is a beta; an Oxc or TypeScript bump is a reviewed PR, not an
  automerge.
- Follow-ups: drop the `.astro` ESLint run (and ESLint itself) when Oxlint can
  lint `.astro` templates and `<style>`; revisit the Starlight type filter when
  Starlight types its virtual modules.
- This supersedes the ESLint-specific wording of ADR 0002 (the TSDoc-only rule
  is now enforced by `local/no-non-doc-comments` and `jsdoc-js` under Oxlint)
  and the ESLint and Prettier rows of ADR 0027's parity table
  (`jsx-no-literals`, import sort, typescript-eslint preset).
