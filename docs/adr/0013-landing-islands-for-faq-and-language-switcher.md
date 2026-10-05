# 13. Landing uses two React islands: FAQ accordion and language popover

## Status

Accepted.

## Context

The landing ([ADR 0011](0011-landing-static-site-no-third-party-scripts.md)) was
built as static HTML with native widgets: a `<details>` FAQ and a `popover`
language menu. Both hand-roll behavior that `@workspace/ui` already ships as
shadcn primitives (Accordion, Popover), so the site and the extension drift
apart in markup, focus handling and styling, and the language menu needs custom
anchor-positioning CSS with a fallback that misaligns between 1240 and 1352px.

## Decision

- The FAQ renders with the shared shadcn Accordion and the language menu with
  the shared Popover, each as a React island. The FAQ hydrates with
  `client:visible` and the language menu with `client:idle`; `client:load` is
  never used.
- Every FAQ answer stays in the server-rendered HTML (panels are kept in the
  DOM, collapsed), so crawlers still see them. No FAQPage structured data is
  emitted: Google no longer shows FAQ rich results.
- The header island also holds the theme menu
  ([ADR 0014](0014-landing-theme-follows-system-with-stored-override.md)), so
  the header still hydrates once, with `client:idle`.
- The footer lists every locale as plain links, so changing language works
  without JavaScript.
- The promo video island keeps its own `client:visible` behavior and still
  contacts YouTube only after a click.
- Static primitives (Card, Badge, Separator, Empty, Button variants) render from
  `.astro` files with no `client:*` directive and ship no JavaScript.

### Considered options

- **Keep the native widgets** — zero JavaScript, but it keeps the custom CSS and
  the divergence from the shared package.
- **Install Accordion and Popover but render them statically** — a statically
  rendered Base UI widget would not toggle.

## Consequences

- The page ships the React runtime for the two islands; it was previously loaded
  only for the video.
- Script CSP hashes must cover the island bootstrap scripts (see the CSP ticket
  in the same spec).
- Any new island needs a stated reason and `client:visible` or `client:idle`.
