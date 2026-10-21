# 0023: Landing motion is CSS scroll-driven, no motion library

## Status

Accepted.

Date: 2026-10-14

## Context

The landing redesign (Landing v2) adds motion graphics: scroll reveals, a
marquee, a docked install bar and a pointer spotlight. A motion library such as
Motion or GSAP would add JavaScript to a page that otherwise ships almost none
([ADR 0013](0013-landing-islands-for-faq-and-language-switcher.md)), and every
section would need an island. Chromium now ships scroll-driven animations,
`@starting-style` and `sibling-index()`, which cover every effect the design
needs.

## Decision

- Motion is plain CSS: scroll and view timelines, `@starting-style`,
  `sibling-index()` and `:has()`. No motion library is added.
- The static end state is the default. Motion is layered on only under
  `@media (prefers-reduced-motion: no-preference)` and `@supports`, so an
  unsupported or reduced-motion browser shows the finished layout.
- The only exception is a fade-only effect with no movement (the header
  surface), which is not gated by reduced motion.
- Animation longhands are written separately (`animation-name`,
  `animation-duration`, `animation-timeline`, ...). Lightning CSS folds
  `animation-timeline` into the `animation` shorthand and the Chromium used in
  CI rejects the folded result.
- When a parent clips with `overflow`, a plain `view()` timeline stops tracking
  the child, so the effect uses a named `view-timeline` declared on the clipping
  ancestor.
- Keyframes, easing and duration tokens, and shared `@utility` classes live in
  `packages/ui/src/styles/theme.css`. Section-specific rules live in the
  per-section files `apps/site/src/styles/sections-*.css`. Arbitrary values and
  `<style>` blocks stay banned.

## Consequences

- No new runtime JavaScript for motion; effects cost nothing without a
  compositor-driven timeline.
- Browsers without scroll-driven animation support see no motion.
- Visual regression baselines capture the static end state.
