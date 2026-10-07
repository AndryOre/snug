# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Planned for the landing page: Astro with React islands, sharing the
`@workspace/ui` package from this monorepo, deployed from a Dockerfile on
Coolify at `snug.andryore.dev`. Recommended in the monorepo spec (AO-1196) but
not yet specced; the surface brief confirms it.

## Users

People with years of curated bookmarks who switch browsers or machines and do
not want to lose them. Today's real users skew toward power users and
developers, and the product is meant to stay approachable to a broader consumer
audience. The decision is the user's alone: installing is a free, one-click
choice from the Chrome Web Store. Source: `.agents/product-marketing.md`.

Jobs they hire Snug for:

- Move bookmarks to a new browser or machine, structure intact.
- Keep a dated backup they can restore.
- Share or archive one folder without exposing the whole library.

## Product Purpose

Snug is a free Chrome (MV3) extension that exports, imports and backs up
bookmarks entirely on the user's device. It works on Chrome and other Chromium
browsers (Edge, Opera, Brave). Success for the landing page is more installs of
the free extension and better discoverability in search and AI answers. There is
no revenue goal.

## Positioning

Snug makes no network calls and needs no account: every operation reads and
writes the browser's own bookmarks tree locally, and the source is public. A
cloud backup or sync service cannot truthfully make that claim.

## Operating Context

The only conversion is "Add to Chrome" on the Chrome Web Store listing. Visitors
arrive from search, AI answers, the store, GitHub, and directory listings. They
are deciding whether to hand an extension read/write access to their whole
bookmark tree, so trust is the main question they bring.

## Capabilities and Constraints

- Export the whole tree or chosen folders as HTML, JSON, CSV, Markdown, OPML or
  XBEL.
- Import HTML, JSON, CSV and XBEL files, a Chrome profile `Bookmarks` file, or a
  Safari export (Favorites and Reading List); the format is detected.
- Import with a preview, then merge, replace, or add to a new folder. Replace
  saves a Safety snapshot first. Snug keeps the latest five on your device, and
  you can restore or download any of them, or take one at any time.
- Duplicates page, and Skip duplicates on import.
- Scheduled Auto-export to the Downloads folder, with Retention and an optional
  failure notification.
- Imports one file at a time. No sync, no cloud, no account, no pricing, no
  signup. Nothing may imply any of these.
- Interface in 10 languages; follows the browser theme and language.
- Current version 2.0.1. The Chrome Web Store Featured badge program is closed.

Terms: Auto-export, Safety snapshot, Retention, Skip duplicates.

## Brand Commitments

The name is **Snug**, a fully independent brand: no "by AndryOre" signature on
the product. Copy is English first, with Spanish adapted for meaning (neutral
Latin American, tú). The product must be honest about scope: it never names a
format or capability it does not ship. The visual identity is the shipped Snug
brand in `docs/brand/` (Aurora ground, amber accent, Space Grotesk and Geist,
ribbon-tag mark); every surface inherits it. The landing's composition is
documented in `apps/site/DESIGN.md`.

## Evidence on Hand

- Public Chrome Web Store reviews, 4.8 stars from 20 ratings, 5,000 users
  (2026-10-05). Quotable reviews and exact wording are in
  `.agents/product-marketing.md`. Most predate the rename.
- Open source repository, OpenSSF Scorecard and Best Practices badges, CodeQL,
  CI, and a Privacy Policy (`PRIVACY_POLICY.md`).
- Store screenshots and promo assets under `docs/store/` and `docs/brand/`.
- Verified competitor data in `docs/brand/competitors.md`.

Absent, and not to be fabricated: customer logos, press, case studies, usage
metrics beyond the store figures, a demo video of the current version.

## Product Principles

1. Trust is structural, not asserted: the local-only design is the proof, so
   show it before any feature list.
2. Say exactly what ships and stop; never imply cloud, sync or backup-over-time
   beyond what the extension does.
3. Safe by default: preview before import, undo for replace, nothing sent
   anywhere.
4. One small tool, one job: no upsell, no onboarding flow, no feature bloat.
5. Respect the visitor's judgment: they are a peer choosing a tool, not a lead
   to convert.

## Accessibility & Inclusion

No product-specific standard has been set. The extension is localized in 10
languages, so the landing page should be ready for localization.
