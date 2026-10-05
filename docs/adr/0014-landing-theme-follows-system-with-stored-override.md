# 14. Landing theme follows the system, with a stored override

## Status

Accepted.

## Context

The landing was dark-only: `class="dark"` was hardcoded on `<html>`, although
`@workspace/ui` already carries a finished light palette that the extension uses
and lets the visitor pick (System, Light or Dark) in its settings. A visitor on
a light system sees a dark page, and the dark-first brief left open whether the
page should follow the visitor's theme.

## Decision

- The landing follows the visitor's system theme by default and offers a theme
  menu in the header with System, Light and Dark, the same three choices as the
  extension's settings.
- The choice is stored in the browser's `localStorage` under `snug:theme`. It
  never leaves the browser, and the privacy page says so.
- A small blocking inline script in `<head>` applies the resolved theme to
  `<html>` before first paint, so there is no flash of the wrong theme. Like
  every inline script on the site, its hash is added to the
  Content-Security-Policy at build time
  ([ADR 0011](0011-landing-static-site-no-third-party-scripts.md)).
- Without JavaScript the page shows the light theme and the menu is hidden: the
  theme tokens switch on the `.dark` class, which only the script sets. The
  `color-scheme` and `theme-color` metas still follow the system.
- The menu is the shared shadcn DropdownMenu with a radio group, rendered in the
  same `client:idle` island as the language menu, so the header hydrates once
  ([ADR 0013](0013-landing-islands-for-faq-and-language-switcher.md)).
- Product screenshots ship a dark and a light variant, switched by the same
  theme class so a stored override applies to them too. The promo video poster
  stays dark.

### Considered options

- **CSS-only `prefers-color-scheme`** — no script and no storage, but no
  override, and it duplicates the whole dark token set inside a media query
  instead of reusing the `.dark` class the shared package already defines.
- **Keep the page dark-only** — simplest, but ignores the visitor's system
  setting and leaves a finished light palette unused.
- **A native popover menu for the theme and language** — less JavaScript, but
  arrow-key navigation, focus handling and radio semantics would be
  hand-written, and
  [ADR 0013](0013-landing-islands-for-faq-and-language-switcher.md) already
  moved the language menu off native widgets for that reason.

## Consequences

- One more inline script on every page, covered by the hash-based CSP.
- The site now writes to `localStorage`. This is a preference, not tracking, but
  it is a change to the "no scripts or storage" posture, so the privacy page
  mentions it.
- The header island carries two menus; it stays `client:idle` and never
  `client:load`.
- Theme-dependent assets (screenshots) need both variants in the page, with the
  hidden one lazy and unfetched.
