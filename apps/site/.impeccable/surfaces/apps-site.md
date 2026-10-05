---
version: 1
slug: 'apps-site'
primary_target: 'apps/site'
related_targets: []
---

# Surface brief: Snug landing (apps/site)

Mode: Persuade. Approved by the maintainer on the design canvas (desktop 1440,
mobile 390) on 2026-10-05. Section order is fixed by the AO-1248 spec: 1 Hero, 2
Trust proof, 3 Features, 4 Real interface, 5 Video, 6 Social proof, 7 FAQ, 8
Final call to action and footer. Copy is `docs/landing/content.md` (EN source,
ten locales).

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

THESIS: The page proves "nothing leaves your device" by drawing the file's path.
It refuses the centered-headline-over-three-feature-cards extension template.
OWN-WORLD: Aurora ground (`--background` with a radial amber glow at the top
left and a faint one on the right), `--card` panels with 1px `--border`, flat
`--primary` amber for the headline's second line, the eyebrow, icons and
numerals. Space Grotesk 700 for headlines, Geist for text, Geist Mono for
eyebrows, file names and format chips. Ribbon-tag mark with its blurred halo in
the header. STORY: The visitor reads the promise, sees one file travel from
their browser to another browser inside a dashed boundary labelled Your device,
sees nothing outside it, then reads the three trust points, then sees the real
interface. They believe it because the diagram and the source agree, and they
click Add to Chrome. FIRST VIEWPORT: Left-aligned eyebrow, two-line headline
(second line amber), subheadline, amber Add to Chrome button plus GitHub link,
the free/open source/browsers line. Directly below, the journey: a dashed amber
boundary with a Your device label holding three cards in a row, Your browser
(folder tree), One file (`bookmarks.html` with the six export formats as chips),
Another browser (folder tree), joined by amber arrows. A mono line outside the
boundary reads Network calls: none. FORM: Surface composition "the file's
journey" (dealt as index 4 of 7, seed key ac844837). Sections after the hero
reuse the same grammar: bordered `--card` panels, numbered mono labels, one
amber accent per section. FINISH: unreviewed and undocumented is unfinished;
this build ends with the finish review, the verdict, DESIGN.md, and every
shipping raster carrying its provenance

## Real interface

Real extension screenshots from `docs/store/assets/screenshots/<locale>/` with
the captions in `content.md`. The diagram and trust cards use authored
illustration; labelled folders (Research, Job search) are illustrative.

## Constraints from the repo

- No third-party scripts, fonts or requests (ADR 0011): self-host Space Grotesk
  and Geist through `@fontsource-variable/*` as `globals.css` already does. The
  canvas loaded Google Fonts only as a preview.
- Static Astro; `.astro` components by default, a React island only for real
  interaction (ADR 0011, `apps/site/AGENTS.md`).
- Ten locales: German and Russian run longer than English, CJK needs its own
  fallbacks, so cards and the journey row must reflow without fixed widths.
- Comments are TSDoc only, per the root `AGENTS.md`.

## Decisions a builder must not invent

- Dark is the default. Whether the page also follows the visitor's light theme
  is open; the tokens already carry a light palette.
- Section order, copy and the Network calls line are fixed; do not add claims
  about sync, cloud, accounts, pricing or importing several files.
- Video section ships only when a video exists (content.md section 5).
