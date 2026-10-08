# Development

Snug is a bun-workspaces monorepo orchestrated by Turborepo (see
[ADR 0010](adr/0010-bun-workspaces-monorepo.md)). Always run scripts from the
repo root. Paths in this page are relative to the root unless they start with
`apps/` or `packages/`.

| Workspace        | Package           | What it holds                                            |
| ---------------- | ----------------- | -------------------------------------------------------- |
| `apps/extension` | `@snug/extension` | The WXT Chrome MV3 extension: entrypoints, `lib/`, tests |
| `packages/ui`    | `@workspace/ui`   | Shared shadcn/ui components, hooks and theme tokens      |
| `apps/video`     | `@snug/video`     | The Remotion promo video and its thumbnails              |

Agent and contributor rules are split the same way: the root `AGENTS.md` holds
repo-wide rules, and `apps/extension/AGENTS.md`, `packages/ui/AGENTS.md` and
`apps/video/AGENTS.md` hold the stack rules for their workspace.

## Scripts

| Script                      | What it does                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`               | Starts the WXT dev server for `apps/extension` (Chrome MV3).                                                                                                     |
| `bun run build`             | Turborepo build of every workspace (Chrome MV3 for the extension).                                                                                               |
| `bun run zip`               | Builds and packages the extension into a distributable `.zip`.                                                                                                   |
| `bun run check`             | Aggregate gate: each workspace's `check` plus the root `format:check` → `lint` → `typecheck` → `knip`, in parallel under Turborepo. Run before opening a PR.     |
| `bun run fix`               | Aggregate autofix: `format:write` → `lint:fix` → `typecheck`.                                                                                                    |
| `bun run knip`              | Finds unused files, exports, and dependencies (`bunx knip`).                                                                                                     |
| `bun run ci:local`          | Reproduces CI locally: frozen-lockfile install → `check` → `lint:docs` → `test`.                                                                                 |
| `bun run clean`             | Removes build output, `.turbo` and every workspace's `node_modules`.                                                                                             |
| `bun run cache:clear`       | Clears ESLint, Turborepo and `node_modules/.cache` caches.                                                                                                       |
| `bun run format:check`      | Checks formatting with Prettier (no writes).                                                                                                                     |
| `bun run format:write`      | Formats the repo with Prettier.                                                                                                                                  |
| `bun run lint`              | Runs ESLint (`--max-warnings=0`, cached).                                                                                                                        |
| `bun run env:encrypt`       | Encrypts the root `.env` in place with dotenvx.                                                                                                                  |
| `bun run lint:docs`         | Local `lychee` link check, matching `lint-docs.yml`'s markdown link gate.                                                                                        |
| `bun run lint:fix`          | Runs ESLint with `--fix` (`--max-warnings=0`, cached).                                                                                                           |
| `bun run typecheck`         | Runs `tsc --noEmit` at the root, in `packages/ui`, `apps/extension`, `apps/video` and `apps/site`.                                                               |
| `bun run test`              | Turborepo runs each workspace's Vitest suite once, plus the root tooling tests.                                                                                  |
| `bun run test:coverage`     | Runs the Vitest suite with coverage (`apps/extension/lib/**`, v8 provider, 80% lines/statements/functions, 50% branches).                                        |
| `bun run test:watch`        | Runs Vitest in watch mode.                                                                                                                                       |
| `bun run test:e2e`          | Turborepo runs each workspace's Playwright E2E suite: the extension (builds with `wxt build` first, `apps/extension/e2e/**`) and the site (`astro build` first). |
| `bun run store:screenshots` | Builds the extension, then composes the localized store screenshots (`apps/extension/e2e-store/**`).                                                             |
| `bun run video:studio`      | Starts Remotion Studio for `apps/video` (Tailscale-bound wrapper when installed).                                                                                |
| `bun run video:still`       | Renders one still frame of the promo (`remotion still`).                                                                                                         |
| `bun run video:render`      | Renders the promo for every locale into `apps/video/out/`.                                                                                                       |
| `bun run video:thumbnails`  | Renders the localized YouTube thumbnails into `docs/brand/youtube/thumbnails/`.                                                                                  |
| `bun run brand:export`      | Exports the brand tiles and icons from `docs/brand`.                                                                                                             |

## Git hooks

Hooks are installed via Husky and live in `.husky/`:

- **`pre-commit`** — runs `bunx lint-staged`, which applies Prettier + ESLint to
  staged `*.{js,jsx,ts,tsx,mjs}` files, ESLint alone to staged `*.astro` files,
  and Prettier alone to staged `*.{json,md,mdx,css,scss,yml,yaml}` files (see
  `lint-staged.config.mjs`).
- **`commit-msg`** — runs `bunx commitlint --edit $1` against
  `commitlint.config.mjs`, which only extends `@commitlint/config-conventional`.
  It enforces the Conventional Commits `<type>: <subject>` shape and the type
  list below, but it does **not** enforce the gitmoji — a commit without an
  emoji still passes this hook. The gitmoji is a repository convention, not a
  lint-enforced rule.
- **`pre-push`** — rejects a push if the current branch name doesn't match
  `^(main|renovate/.+|(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)/[a-z0-9._-]+)$`.

## CI

Every PR — including docs-only changes — runs the full `ci.yml` pipeline:
`quality`, `build`, `e2e`, and `commitlint`. The `CI passed` job aggregates
their results and is the single status check required to merge; it passes once
every needed job is `success` or `skipped` (e.g. `commitlint` is skipped on
`push` runs), and fails if any needed job is `failure` or `cancelled`.

`.github/workflows/codeql.yml` runs CodeQL static analysis
(`javascript-typescript`) on every PR, on push to `main`, and weekly. It's not
part of the `CI passed` aggregator — findings surface via code scanning, not as
a gate. See [ADR 0004](adr/0004-enable-codeql-sast.md).

## Commit format

`<type>: <emoji> <lowercase subject>`, e.g. `feat: ✨ add dark mode`.

`<type>` must be one of the types `@commitlint/config-conventional` allows,
matching CI's `lint-pr.yml`:

```
feat fix docs style refactor perf test build ci chore revert
```

The subject must start with a lowercase letter.

## Branch naming

Branch names must match:

```
^(main|renovate/.+|(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)/[a-z0-9._-]+)$
```

e.g. `feat/csv-export`, `fix/popup-crash`, `chore/bump-deps`.

## Adding a `@shadcn/lint` contract

The root `eslint.config.mjs` defines `shadcnNoRestyleContracts` — a list of
per-component exceptions to the `shadcn/no-restyle` rule. Each entry pairs a
component name `pattern` (regex) with an `allow` list of class
categories/literal classes that component is permitted to add on top of its
shadcn/ui defaults.

To add a new contract:

1. Add an entry to `shadcnNoRestyleContracts` in `eslint.config.mjs`:
   ```js
   {
     pattern: '^ComponentName$',
     allow: ['layout', 'text-sm'],
   }
   ```
2. Write a one-line comment above the entry explaining the real, bounded design
   decision it encodes — never add a contract just to silence the rule.
3. Run `bun run lint` to confirm the rule now accepts the component's actual
   usage and nothing broader.

## Brand tokens

`packages/ui/src/styles/globals.css` (imported by
`apps/extension/entrypoints/popup/style.css`) defines the Snug palette in
`:root` (warm cream light theme) and `.dark` (dark-first amber on a warm
ground), plus three brand-surface tokens exposed as Tailwind utilities via the
`@theme inline` block:

- **`--primary-text`** (Tailwind `text-primary-text`): text color for brand
  surfaces. Equals `--primary` in both themes (`#A35200` in light, `#FFA230` in
  dark), so it meets text contrast on the page background.
- **`--brand-gradient`** (Tailwind `bg-brand-gradient`): background for the
  logo, hero, and brand accents only — never for buttons or other controls. It
  is `linear-gradient(135deg, #FFA230, #FFD37A)` in both themes and is non-text
  only.
- **`--brand-text-gradient`** (Tailwind `bg-brand-text-gradient`, paired with
  the built-in `bg-clip-text text-transparent` utilities for gradient-clipped
  text): for brand text/accents that need the gradient clipped to glyph shapes.
  The gradient differs per theme so text stays legible: light uses a darker
  `linear-gradient(135deg, #9A4A00, #A35200)` (at least 4.84:1 on the sidebar),
  while dark reuses the amber `linear-gradient(135deg, #FFA230, #FFD37A)`.

Rules for the brand tokens:

- The gradient tokens are for the logo, hero, and accent text only. Buttons and
  other interactive controls always use the flat `--primary` color, never a
  gradient.
- `--destructive` (the error color) must stay visually distinct from `--primary`
  — never tune them to the same hue/lightness, even as brand colors change.

## `fakeBrowser` testing

`apps/extension/lib/**` unit tests run against `wxt/testing/fake-browser`'s
`fakeBrowser` — an in-memory implementation of the WebExtension APIs, wired in
via `WxtVitest()` in `apps/extension/vitest.config.ts`.

`@webext-core/fake-browser` (which `fakeBrowser` wraps) does not implement
`browser.bookmarks.*` — every method throws "not implemented". This repo patches
a minimal in-memory bookmark tree onto `fakeBrowser.bookmarks` via
`apps/extension/lib/testing/fake-bookmarks.ts`, so tests can exercise real
`browser.bookmarks.create/search/getTree/removeTree` calls end to end.
`apps/extension/lib/testing/fake-i18n.ts` provides the same treatment for
`browser.i18n`.

`fakeBrowser.reset()` does not touch `bookmarks` (it only resets APIs that
implement `resetState`), so call `resetFakeBookmarks()` (and `resetFakeI18n()`,
if used) alongside it in `beforeEach`.

Coverage is scoped to `apps/extension/lib/**` only (see
`apps/extension/vitest.config.ts`), with an 80% threshold on
lines/statements/functions and 50% on branches.

See [CONTRIBUTING's `## Tests`](../CONTRIBUTING.md#tests) section for this
repository's testing policy: what a PR is expected to cover and when.

## E2E testing

`apps/extension/e2e/**` runs Playwright against the extension's real build
output (`apps/extension/.output/chrome-mv3`, produced by `wxt build`), loaded
into Playwright's bundled headless Chromium via
`chromium.launchPersistentContext` + `--load-extension`. See
[`docs/adr/0003-e2e-against-built-extension.md`](adr/0003-e2e-against-built-extension.md)
for why this runs against the built extension instead of a component-test layer.

- `apps/extension/e2e/fixtures.ts` is the shared harness every spec extends: the
  persistent `context`, `extensionId`, the extension's `serviceWorker`, an
  `openExtensionPage(name)` helper (e.g. `openExtensionPage('popup.html')`), and
  `seedBookmarks`/`readBookmarkTree` helpers that drive `chrome.bookmarks.*`
  through `serviceWorker.evaluate` — not `fakeBrowser` — so bookmarks state goes
  through the same implementation a real user's browser would use.
- Every test gets a fresh temporary Chromium profile, removed on teardown, so no
  test can see another test's browser state.
- Run locally with `bun run test:e2e`. It needs Playwright's Chromium binary
  installed once via `bunx playwright install chromium` — never `--with-deps` or
  `sudo` outside CI, which installs OS packages this repo's local dev machines
  shouldn't need.
- `bun run test:e2e` isn't part of `bun run check`; CI runs it as its own `e2e`
  job (`.github/workflows/ci.yml`), which installs browsers with
  `bunx playwright install --with-deps chromium` and uploads the Playwright HTML
  report as an artifact on failure.

### Landing visual regression

`apps/site/e2e-container/visual.spec.ts` takes full-page `toHaveScreenshot`
baselines of `/` and `/de/` at 1280, 768, 375 and 320 px in both color schemes
(16 PNGs in `apps/site/e2e-container/visual.spec.ts-snapshots/`). The YouTube
facade, iframes and `<time>` elements are masked and animations are disabled.

- `bun run --cwd apps/site test:visual` builds the site image and runs the spec
  inside the official Playwright Docker image (`scripts/visual.sh` pins the
  image tag to the `@playwright/test` version in `bun.lock`), so fonts and
  rasterization are identical everywhere. CI runs it in the `site-quality` job
  and uploads `test-results/` (expected, actual and diff PNGs) on failure.
- `bun run --cwd apps/site test:visual:update` regenerates the baselines. Run it
  only after an intentional visual change, review the PNG diff in the PR, and
  commit the images with the change. Never commit baselines produced outside
  this script: a local Chromium renders fonts differently and breaks CI.
- `test:container` skips these tests (`--grep-invert @visual`); Docker is
  required for `test:visual`.

## Accessibility

- **Linting**: `eslint-plugin-jsx-a11y`'s `recommended` config is enabled in
  `eslint.config.mjs` and runs as part of `bun run lint` (`--max-warnings=0`, so
  an a11y violation fails the same way any other lint error does). It catches
  issues like missing alt text, non-interactive elements with click handlers but
  no keyboard equivalent, and invalid ARIA attributes.
- **Accessible primitives**: interactive UI is built from
  `packages/ui/src/components/**` (shadcn/ui components on top of Base UI
  primitives), which ship correct ARIA roles, keyboard handling, and focus
  management out of the box. Prefer composing these primitives over hand-rolling
  interactive elements from `div`/`span`.
- **Keyboard operability**: every interactive control (buttons, links, form
  fields, dialogs) must be reachable and operable via keyboard alone — no
  handler that only responds to `onClick`/`onMouseOver` without a keyboard
  equivalent.
- **Labels**: every form control needs an accessible name — a visible `<label>`,
  an `aria-label`, or `aria-labelledby`. Icon-only buttons need an `aria-label`
  describing the action.
- **Focus visibility**: don't suppress the browser's focus ring (no
  `outline: none` without a replacement focus style). shadcn/ui's components
  already include a visible focus-visible style; keep it when customizing a
  component per this repo's
  [`@shadcn/lint` contract](#adding-a-shadcnlint-contract) rules.

## Linting `.astro` files

`.astro` files (almost all of `apps/site`) are linted through
`eslint-plugin-astro` and `astro-eslint-parser`, with the same `shadcn/*` rules
and the same TSDoc-only comment rules as `.ts`/`.tsx`. The React JSX rules
(`react/jsx-key`, `react/no-unknown-property`) are off for `.astro` templates,
and `Props` is allowed as Astro's component-props interface name. Anything the
rules flag in a template (arbitrary type sizes, gradients, `<style>` blocks)
moves into `@theme` or `@utility` entries in
`packages/ui/src/styles/globals.css`.

## Linting `apps/video`

ESLint lints `apps/video` with the full root rule set plus one scoped override
in `eslint.config.mjs` (`files: ['apps/video/**']`). The override turns off:

- every `shadcn/*` rule (`no-restyle`, `no-raw-colors`, `no-arbitrary-values`,
  `no-inline-styles`, `no-unknown-classes`, `require-static-classes`) — Remotion
  renders frames from inline styles, raw colors and arbitrary values, not
  shadcn/ui components;
- `jsdoc/require-param` and `jsdoc/require-returns`, and
  `unicorn/name-replacements` and `unicorn/consistent-boolean-name` — parameter
  docs and naming conventions are out of scope for composition code.

Everything else stays on, including `react-hooks`, `unicorn`,
`jsdoc/informative-docs` and the TSDoc-only comment rule.

## Repository settings

This repo's GitHub settings (rulesets on `main` and `v*` tags, merge strategy,
private vulnerability reporting, SHA-pinned Actions, immutable releases,
workflow execution protections, and feature/metadata flags) are no longer
applied via a script — `scripts/repo-settings/apply.sh` was temporary
settings-as-code tooling and has since been deleted. See
[`docs/adr/0001-public-repo-security-posture.md`](adr/0001-public-repo-security-posture.md)
for the target state this repository's settings were brought to, the reasoning
behind each choice, and why the script was removed rather than kept around
permanently.

## Agent skills

Third-party skills live in `.claude/skills` and are installed with
`bunx skills add <owner>/<repo>#<commit> -s <skill> -a claude-code`, always
pinned to a commit so `skills-lock.json` records the exact `ref`. Read each
`SKILL.md` and any bundled script before committing it. `bunx skills update`
moves the pins, so review the diff the same way.

The marketing skills read `.agents/product-marketing.md` first; run the
`product-marketing` skill to create it before using the others. Snug is a free
consumer extension with no pricing or signup, so say so up front.

## Code documentation

Every code comment in this repository (outside `packages/ui/**`, the
shadcn/ui-generated layer) is a `/**` TSDoc block, added only where it earns its
place on a non-obvious export — never restating what a signature already says.
Plain `//` line comments and non-JSDoc `/* */` block comments are disallowed;
the only exceptions are directive comments a tool reads rather than a human:
`eslint*` (`eslint-disable`, `eslint-enable`, ...), `global`, `@ts-*`
(`@ts-expect-error`, ...), `prettier-ignore`, `@vitest-environment`, and
TypeScript triple-slash reference directives.

This is enforced by ESLint: the local `local/no-non-doc-comments` rule bans
non-doc comments, `jsdoc/informative-docs` rejects a TSDoc block that only
repeats its symbol's name back, and
`@eslint-community/eslint-comments/require-description` requires every
`eslint-disable*` comment to say why. See
[`docs/adr/0002-tsdoc-only-code-comments.md`](adr/0002-tsdoc-only-code-comments.md)
for the full rationale.
