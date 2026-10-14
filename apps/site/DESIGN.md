---
name: Snug landing
description:
  Dark-first, amber-accented landing for a local-only bookmark extension,
  inheriting the shipped Snug brand.
colors:
  aurora-ground: 'oklch(0.186 0.017 79.1)'
  aurora-panel: 'oklch(0.25 0.023 69.2)'
  paper-text: 'oklch(0.943 0.019 80.1)'
  muted-text: 'oklch(0.74 0.041 82.3)'
  amber: 'oklch(0.789 0.161 65.7)'
  hairline: 'oklch(0.943 0.019 80.1 / 16%)'
typography:
  display:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: 'clamp(2.5rem, 6vw, 5rem)'
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 3.25rem)'
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: 'Geist Variable, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '0.8125rem'
    fontWeight: 400
    letterSpacing: '0.12em'
rounded:
  md: '10px'
  lg: '14px'
  xl: '20px'
spacing:
  sm: '8px'
  md: '16px'
  lg: '32px'
  section: '96px'
components:
  button-primary:
    backgroundColor: '{colors.amber}'
    textColor: '{colors.aurora-ground}'
    rounded: '{rounded.md}'
    padding: '16px 28px'
  panel:
    backgroundColor: '{colors.aurora-panel}'
    textColor: '{colors.paper-text}'
    rounded: '{rounded.lg}'
    padding: '28px'
---

# Design System: Snug landing

The landing inherits the shipped Snug brand
([`docs/brand/brief.md`](../../docs/brand/brief.md)); it adds composition rules,
not a new identity. The live token source is
`packages/ui/src/styles/globals.css`. Values above mirror its `.dark` theme (the
light theme is the `:root` set: cream `--background`, same amber brand); do not
redefine them here. The landing ships both themes: it follows the system
(`prefers-color-scheme`) and honors a stored `snug:theme` override
(`system | light | dark`), applied by a blocking head script that toggles
`.dark` on `<html>` before first paint.

## Overview

**Creative North Star: "The file's journey."** A calm, warm page (dark or light,
following the system) that proves a claim by drawing it: one file moves from a
browser to another browser inside a dashed boundary labelled Your device, and
nothing exists outside it. It sounds like the product: precise, quietly warm,
never loud. Landing v2 keeps that identity and makes it move and respond: the
page is shorter, the ribbon mark is the visual protagonist, and motion and two
small interactive islands do the persuading that cards used to. Anti-references:
the centered headline over three feature cards, cloud or sync imagery, gradients
in UI chrome, a stock mascot, hype copy.

Design boards: the Landing v2 canvas
(<https://claude.ai/artifact/8ftMuNdgUodA8wfRPoUBsN>, `Landing.dc.html`, area
"Landing v2"). Motion architecture and its constraints are decided in
[ADR 0023](../../docs/adr/0023-landing-v2-motion-and-logos.md); this file
describes the visual rules and must agree with it.

## Colors

Aurora ground with a warm radial glow behind the top of the page (an amber wash
at low alpha, strongest at the top left, a fainter one on the right edge). The
glow starts at the very top of the page and sits behind the 56px header (the
hero pulls up under it), so the header and hero read as one surface with no seam
in either theme. One flat amber accent does every accent job: the headline's
second line, eyebrows, icons, numerals, arrows and the boundary line. Panels sit
one tonal step above the ground. The brand gradient (`--brand-gradient`) appears
only on the mark and wordmark. Muted text is for supporting copy, never for
primary claims. Use amber text only at large sizes or bold; check contrast
against `--background` before shrinking it.

## Typography

Space Grotesk 700 for display and headlines, 500 for card titles. Geist for
text. Geist Mono for eyebrows, file names, format chips and the Network calls
line, uppercase with wide tracking only at label sizes. Fonts are self-hosted
through `@fontsource-variable/*` (ADR 0011); Geist Mono is imported in
`globals.css`. German and Russian run long, and CJK needs its own fallback
stack, so no heading or card may rely on a fixed width. Japanese headings use
`word-break: auto-phrase` (the `phrase-break` utility, applied for `:lang(ja)`)
so they never split inside a phrase. The German h1 uses manual hyphenation
(`hyphens-manual`) so "Lesezeichen" is never hyphenated; other locales keep
`hyphens-auto`.

## Layout

One centered column, max width about 1240px, with 56px side padding on desktop
and 16px on phones. Sections are separated by 96px of space on desktop and 56px
on phones. Section order is fixed by the Landing v2 spec:

1. Hero: the ribbon mark as a motion graphic, headline, Add to Chrome and the
   GitHub link, the free/open source line.
2. Stats strip: a short row of verifiable facts (formats, locales, network
   calls), no new claims.
3. Browser marquee: real browser logos drifting in a loop.
4. Bento: four panels, unequal sizes, one amber accent each.
5. Format playground: island, pick a format and see the file change.
6. Interface showcase: island, the real extension screenshots.
7. Video: only when a video exists.
8. Reviews marquee: real store review excerpts in a loop.
9. FAQ: six questions; the rest live on the Guide FAQ page.
10. Closing panel: the final Add to Chrome call to action.
11. Footer.

The Install dock is a persistent compact Add to Chrome control that sits outside
this flow and never overlaps the closing panel. Wide grids use
`repeat(auto-fit, minmax(260px, 1fr))` and collapse to one column on phones.
Nothing relies on a fixed width, so German, Russian and CJK reflow.

## Elevation & Depth

Flat and tonal. Depth is a panel one step lighter than the ground plus a 1px
hairline (`--card-border`). A card reads at least 1.15:1 against the ground and
its hairline at least 1.5:1 against the card in both themes; a unit test in
`src/styles/card-contrast.test.ts` guards both. No drop shadows. The amber glow
is the only atmospheric effect and stays behind content.

## Shapes

Nova radius from the shared theme: 10px on buttons, 14px on panels, 20px on the
Your device boundary. The boundary is a 1.5px dashed amber line, the only dashed
element on the page: marquee edges, dividers and playground frames use solid
hairlines. The brand mark is a ribbon tag with a V-notch; its halo is a blurred
copy of the mark behind it. In v2 the mark is the visual protagonist of the hero
and the closing panel: a large ribbon that the page's motion revolves around. It
is a brand mark, never a mascot: no face, no pose, no character behaviour.

## Components

- **Primary button:** flat amber, dark text, 600 weight, 10px radius. Always
  links to `/install`, never to the store listing.
- **Card (shadcn):** `--card` fill, `--card-border` hairline, 14px radius, Space
  Grotesk 500 title, muted body. Feature cards add a mono numeral in amber;
  trust cards carry none because they are not steps.
- **FAQ item:** Base UI accordion island. Open answers use `text-lead` (17px),
  line height 1.6, `pt-1` under the question, in a column about 832px wide. The
  server HTML marks every collapsed panel `hidden="until-found"` so find-in-page
  and text-fragment links open it before hydration. The panel itself animates
  height; reduced motion removes the transition.
- **Journey card:** a panel; the middle card (the file) gets a 1px
  `ring-primary/50` amber ring and the other two stay plain. Folder icons are
  Lucide `folder`, 2px stroke, amber.
- **Format chip:** one outline Badge style for the hero and the playground:
  Geist Mono 12px, 1px hairline border, no fill, pill radius.
- **Browser logos:** real browser logos are allowed (Chrome, Edge, Brave,
  Firefox and peers), self-hosted as static assets, shown at one consistent
  size, and presented as compatibility facts, never as endorsements.
- **Marquee:** the browser and reviews rows loop horizontally on a duplicated
  track with a hairline mask at the edges. Hover or focus within pauses it; the
  static state is a wrapped, fully visible row.
- **Format playground (island):** the visitor picks one of the six export
  formats and sees the sample file change. Hydrated with `client:visible`; the
  server HTML already shows the default format, so the section reads without
  JavaScript. Keyboard operable, no network request.
- **Interface showcase (island):** the real extension screenshots switchable by
  tab, in a 16px-radius frame with a hairline border and the caption from the
  content document. Hydrated with `client:visible`; the first screenshot is in
  the server HTML.

## Motion

Motion explains and rewards; it never gates content.

- **Static end state first.** Every section is complete and legible with no
  animation. Motion is an enhancement layered on that state.
- **Gating.** Animations run only inside
  `@media (prefers-reduced-motion: no-preference)`, and scroll or view timelines
  additionally inside `@supports (animation-timeline: view())`. Browsers without
  support, and visitors who prefer reduced motion, get the end state.
- **No motion library.** Pure CSS: keyframes, scroll and view timelines,
  `@starting-style`, `sibling-index()` stagger. Islands add no animation
  runtime.
- **Transform and opacity only.** Animate `transform` and `opacity` so the work
  stays on the compositor; never animate layout properties, filters or
  gradients. The FAQ panel height transition is the one existing exception and
  is removed under reduced motion.
- **`will-change` only on marquees.** Nowhere else, and never as a blanket hint.
- **Where it lives.** Keyframes and utilities live in
  `packages/ui/src/styles/theme.css` or the sanctioned per-section CSS files,
  never arbitrary values or `<style>` blocks.
- **Purpose.** The ribbon mark in the hero, the file travelling in the journey,
  the marquees and in-view reveals. One idea per section, no parallax stacks.

## Do's and Don'ts

- Do keep one amber accent per section.
- Do label illustration as illustration where a visitor could mistake it for
  real data.
- Don't imply cloud, sync, an account, pricing or multi-file import, in copy or
  in imagery.
- Don't add third-party fonts, scripts or embeds on load; browser logos are
  self-hosted.
- Don't turn the ribbon mark into a mascot, or the motion into decoration that
  hides content.
- Do focus links and shadcn button-based controls with a full-opacity
  `ring-ring` 3px ring and a 2px `ring-offset-background` offset (3:1 minimum,
  WCAG 1.4.11); never `ring-ring/50`. Consumers add the `focus-ring-solid`
  utility from `packages/ui/src/styles/theme.css`, which overrides the registry
  default without editing `packages/ui/src/components`.
- Do hover the primary CTA with `hover:bg-primary-hover`, the token that keeps
  the label at 4.5:1 in both themes; never `bg-primary/80`.
- Do draw link underlines with `decoration-muted-foreground` and cards with
  `border-card-border`, never `border-border` on `bg-card`.
- Don't put the brand gradient in UI chrome or copy.
- Don't use a side-stripe border on cards or gradient text.
