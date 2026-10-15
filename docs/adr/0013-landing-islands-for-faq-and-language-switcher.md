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
  `client:visible`; `client:load` is never used. The header island's trigger was
  amended in [Amendment](#amendment-header-hydrates-on-interaction).
- Every FAQ answer stays in the server-rendered HTML (panels are kept in the
  DOM, collapsed), so crawlers still see them. No FAQPage structured data is
  emitted: Google no longer shows FAQ rich results.
- The header island also holds the theme menu
  ([ADR 0014](0014-landing-theme-follows-system-with-stored-override.md)), so
  the header still hydrates once, on interaction (see the amendment).
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
- Any new island needs a stated reason and `client:visible`, `client:idle` or
  `client:interaction`.

## Amendment: header hydrates on interaction

The header island (theme and language menus) hydrates on the first
`pointerenter`, `focusin` or `touchstart`, through a custom `client:interaction`
Astro directive, instead of `client:idle`. `client:idle` still downloaded about
132 KB gzipped of JavaScript on every page, including pages where nobody opens a
menu, and it shows up as unused JavaScript and blocking time on mobile.

- A click that lands while the island is still loading is recorded and replayed
  once hydration finishes, so an early tap is not lost.
- The FAQ stays `client:visible`; `client:load` is still never used.
- The server-rendered menu triggers stay visible and focusable, so the header
  looks the same before and after hydration.
- Considered and rejected: keeping `client:idle` and trimming the bundle (the
  React runtime and Base UI primitives dominate the cost), and replacing the
  menus with native `popover` elements (reverses the decision above).

## Amendment: Format playground and Interface showcase islands

Landing v2 sanctions two further islands beyond the FAQ accordion, the header
menus and the video: the Format playground and the Interface showcase. Both
hydrate with `client:visible`, so neither downloads JavaScript until the visitor
scrolls to it. Both stay interactive-only: their static first state is
server-rendered. See
[ADR 0023](0023-landing-motion-is-css-scroll-driven-no-motion-library.md) for
the motion that surrounds them.

## Amendment: hero video hydrates on interaction

Landing v3 moves the promo video into the hero, inside the first viewport. With
`client:visible` it hydrated on load and put the React runtime and the facade on
the critical path, which dropped the mobile Lighthouse performance score of the
longer-copy locales below the budget. The video island now hydrates with
`client:interaction`, like the header: the poster is server-rendered, the poster
loads eagerly, and a click that lands before hydration is replayed. The video
still contacts YouTube only after a click.
