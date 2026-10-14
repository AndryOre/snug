---
version: 1
slug: 'apps-site'
primary_target: 'apps/site'
related_targets: []
---

# Surface brief: Snug landing (apps/site)

Mode: Persuade. Landing v2 (AO-1908), superseding the 2026-10-05 canvas. Boards:
<https://claude.ai/artifact/8ftMuNdgUodA8wfRPoUBsN> (`Landing.dc.html`, area
"Landing v2"). Section order is fixed: 1 Hero, 2 Stats strip, 3 Browser marquee,
4 Bento, 5 Format playground, 6 Interface showcase, 7 Video, 8 Reviews marquee,
9 FAQ (six questions), 10 Closing panel, 11 Footer, plus the Install dock. Copy
is `docs/landing/content.md` (EN source, ten locales). Motion architecture:
[ADR 0023](../../../../docs/adr/0023-landing-v2-motion-and-logos.md). Visual
rules: `apps/site/DESIGN.md`.

## Job and audience

People with years of curated bookmarks who switch browsers or machines and are
deciding whether to give an extension read/write access to the whole bookmark
tree. Trust is the question they bring. One conversion: Add to Chrome, through
the counted `/install` redirect (never the store listing directly).

## Visual authority

The shipped Snug brand, closed in v2.0.0 (`docs/brand/brief.md`,
`docs/brand/tokens.css`, `packages/ui/src/styles/globals.css`). This surface
inherits it and does not replace it: Aurora ground with a warm radial glow, flat
amber accent, Space Grotesk display, Geist UI, Geist Mono for labels, Lucide
icons, Nova radius. The brand gradient stays on the mark and wordmark only. No
cloud or sync imagery, no stock mascot, no gradients in UI chrome. Only the
composition is decided here.

## Direction contract

THESIS: The page proves "nothing leaves your device" and now shows it moving. It
refuses the centered-headline-over-three-feature-cards extension template.
OWN-WORLD: Aurora ground (`--background` with a radial amber glow at the top
left and a faint one on the right), `--card` panels with 1px `--border`, flat
`--primary` amber for the headline's second line, the eyebrow, icons and
numerals. Space Grotesk 700 for headlines, Geist for text, Geist Mono for
eyebrows, file names and format chips. The ribbon-tag mark with its blurred halo
is the visual protagonist of the hero and the closing panel, never a mascot.
STORY: The visitor reads the promise beside the moving ribbon, sees the facts in
the stats strip and the browsers it works in, plays with the six formats, sees
the real interface, and believes it because the diagram and the source agree.
Then they click Add to Chrome. FIRST VIEWPORT: Left-aligned eyebrow, two-line
headline (second line amber), subheadline, amber Add to Chrome button plus
GitHub link, the free/open source/browsers line, with the ribbon motion graphic
beside it. The dashed amber Your device boundary stays the only dashed element;
a mono line outside it reads Network calls: none. Real browser logos are
allowed. FORM: bordered `--card` panels, one amber accent per section; two new
islands only, the Format playground and the Interface showcase. FINISH: motion
is CSS only, static end state first, `prefers-reduced-motion: no-preference` and
`@supports` gated, transform and opacity only, `will-change` on marquees only.

## Real interface

Real extension screenshots from `docs/store/assets/screenshots/<locale>/` with
the captions in `content.md`. The diagram and trust cards use authored
illustration; labelled folders (Research, Job search) are illustrative.

## Constraints from the repo

- No third-party scripts, fonts or requests (ADR 0011): self-host Space Grotesk
  and Geist through `@fontsource-variable/*` as `globals.css` already does. The
  canvas loaded Google Fonts only as a preview.
- Static Astro; `.astro` components by default, a React island only for real
  interaction (ADR 0011, `apps/site/AGENTS.md`). Landing v2 islands: Format
  playground and Interface showcase (`client:visible`), plus the FAQ and header
  islands. No motion library.
- Keyframes and utilities live in `packages/ui` `theme.css` or sanctioned
  per-section CSS files; no arbitrary values, no `<style>` blocks.
- Ten locales: German and Russian run longer than English, CJK needs its own
  fallbacks, so cards and the journey row must reflow without fixed widths.
- Comments are TSDoc only, per the root `AGENTS.md`.

## Decisions a builder must not invent

- The page follows the visitor's system theme and offers a System, Light, Dark
  menu (ADR 0014). Both themes use the shared tokens; the brand stays dark-first
  and the promo video poster stays dark.
- Section order, copy and the Network calls line are fixed; do not add claims
  about sync, cloud, accounts, pricing or importing several files. No cloud or
  sync imagery.
- Motion never gates content, and the ribbon never becomes a mascot.
- Video section ships only when a video exists (content.md).
