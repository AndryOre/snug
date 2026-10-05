# AGENTS.md — `apps/site`

Stack rules for `@snug/site`, the landing page at snug.andryore.dev. Repo-wide
rules (scripts, commits, comments, `@shadcn/lint`) are in the root
[`AGENTS.md`](../../AGENTS.md).

## Stack

A static Astro site with `@astrojs/react` islands and Tailwind CSS v4. UI
primitives and the theme come from `@workspace/ui`
([`packages/ui/AGENTS.md`](../../packages/ui/AGENTS.md)); the site imports
`@workspace/ui/globals.css` and `@workspace/ui/components/*` and defines no
tokens of its own. The code map is
[`docs/architecture.md`](../../docs/architecture.md).

## Rules

- `.astro` files are linted by the same `shadcn/*` rules and TSDoc-only comment
  rule as `.ts`/`.tsx` (`eslint-plugin-astro` in the root `eslint.config.mjs`).
  Fluid type sizes, line heights, gradients, the site max-width and the
  `content-visibility` and language-panel CSS are tokens and `@utility` entries
  in `packages/ui/src/styles/globals.css`, never arbitrary values or `<style>`
  blocks. The React JSX rules do not apply to `.astro` templates.

- No third-party scripts, fonts, embeds or requests on page load, and no
  analytics of any kind
  ([ADR 0011](../../docs/adr/0011-landing-static-site-no-third-party-scripts.md)).
  Visits are counted from the server access log with masked IPs. The promo video
  may load from YouTube only after the visitor clicks it.
- Default to `.astro` components that render to static HTML. Use a React island
  (`client:*`) only for real interactivity, and prefer `client:visible` or
  `client:idle` over `client:load`.
- Install buttons link to `/install`, which the server answers with a 302 to the
  Chrome Web Store listing with UTM tags. Never link the listing directly.
- Ten locales: English at `/`, plus `es`, `de`, `fr`, `it`, `ja`, `ko`, `pt_BR`,
  `ru` and `zh_CN` under their own path. Locale codes match
  `apps/extension/locales/*.json`; adding one follows
  [`docs/how-to/add-a-locale.md`](../../docs/how-to/add-a-locale.md).
- Page copy lives in per-locale content files, never inline in components, and
  every locale carries the same keys. The source copy and voice are in
  [`docs/landing/content.md`](../../docs/landing/content.md).
- Never run `bun run build`. Verify with `bun run check` from the repo root.
- E2E specs build their locale paths with `LOCALES.map` from `src/i18n/locales`,
  never a copied list. Build-output assertions live in
  `e2e/built-output.spec.ts`, which reads the `dist` that `bun run test:e2e`
  builds; `vitest run` never builds.
