---
name: Snug landing
description:
  Dark-first, amber-accented landing for a local-only bookmark extension,
  inheriting the shipped Snug brand.
colors:
  aurora-ground: 'oklch(0.186 0.017 79.1)'
  aurora-panel: 'oklch(0.226 0.023 69.2)'
  paper-text: 'oklch(0.943 0.019 80.1)'
  muted-text: 'oklch(0.74 0.041 82.3)'
  amber: 'oklch(0.789 0.161 65.7)'
  hairline: 'oklch(0.943 0.019 80.1 / 12%)'
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
never loud. Anti-references: the centered headline over three feature cards,
cloud or sync imagery, gradients in UI chrome, a stock mascot, hype copy.

## Colors

Aurora ground with a warm radial glow behind the top of the page (an amber wash
at low alpha, strongest at the top left, a fainter one on the right edge). One
flat amber accent does every accent job: the headline's second line, eyebrows,
icons, numerals, arrows and the boundary line. Panels sit one tonal step above
the ground. The brand gradient (`--brand-gradient`) appears only on the mark and
wordmark. Muted text is for supporting copy, never for primary claims. Use amber
text only at large sizes or bold; check contrast against `--background` before
shrinking it.

## Typography

Space Grotesk 700 for display and headlines, 500 for card titles. Geist for
text. Geist Mono for eyebrows, file names, format chips and the Network calls
line, uppercase with wide tracking only at label sizes. Fonts are self-hosted
through `@fontsource-variable/*` (ADR 0011); Geist Mono is imported in
`globals.css`. German and Russian run long, and CJK needs its own fallback
stack, so no heading or card may rely on a fixed width.

## Layout

One centered column, max width about 1240px, with 56px side padding on desktop
and 16px on phones. Sections are separated by 96px of space on desktop and 56px
on phones. Section order is fixed by the spec: Hero, Trust proof, Features, Real
interface, Video, Social proof, FAQ, Final call to action and footer. The
journey row is a three-card grid joined by arrows on desktop and a vertical
stack with down arrows on phones. Card grids use
`repeat(auto-fit, minmax(260px, 1fr))`.

## Elevation & Depth

Flat and tonal. Depth is a panel one step lighter than the ground plus a 1px
hairline. No drop shadows. The amber glow is the only atmospheric effect and
stays behind content.

## Shapes

Nova radius from the shared theme: 10px on buttons, 14px on panels, 20px on the
Your device boundary. The boundary is a 1.5px dashed amber line, the only dashed
element on the page. The brand mark is a ribbon tag with a V-notch; its halo is
a blurred copy of the mark behind it.

## Components

- **Primary button:** flat amber, dark text, 600 weight, 10px radius. Always
  links to `/install`, never to the store listing.
- **Card (shadcn):** `--card` fill, hairline border, 14px radius, mono numeral
  in amber, Space Grotesk 500 title, muted body.
- **Journey card:** a panel; the middle card (the file) gets an amber border at
  50% alpha. Folder icons are Lucide `folder`, 2px stroke, amber.
- **Format chip:** Geist Mono 12px, 1px hairline border, 6px radius.
- **Real interface:** the real extension screenshot in a 16px-radius frame with
  a hairline border and the caption from the content document.

## Do's and Don'ts

- Do keep one amber accent per section.
- Do label illustration as illustration where a visitor could mistake it for
  real data.
- Don't imply cloud, sync, an account, pricing or multi-file import, in copy or
  in imagery.
- Don't add third-party fonts, scripts or embeds on load.
- Do focus links with a full-opacity `ring-ring` 3px ring and a 2px
  `ring-offset-background` offset (3:1 minimum, WCAG 1.4.11); never
  `ring-ring/50`.
- Don't put the brand gradient in UI chrome or copy.
- Don't use a side-stripe border on cards or gradient text.
