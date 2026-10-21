# 0021: How-to pages are curated, data-driven pages, not a blog

## Status

Accepted. Follows the pattern of the Comparison pages and keeps
[ADR 0011](0011-landing-static-site-no-third-party-scripts.md),
[ADR 0017](0017-landing-umami-cloud-cookieless-analytics.md) and
[ADR 0019](0019-guide-and-release-notes-on-the-website-with-starlight.md)
intact.

Date: 2026-10-11

## Context

AO-1268 deferred content that answers how-to searches, with the warning that
thin templated pages would hurt a small, trust-first product. Google's 2026 spam
updates target scaled content abuse, helpful-content signals now sit inside core
ranking, and HowTo and FAQ rich results no longer show. AI answers cite pages
that open with a direct answer, give exact steps and show a verified date. A
blog without a publishing cadence reads as abandoned. Snug runs only on Chromium
browsers, so a migration page is only truthful when its destination is one.

## Decision

- Add How-to pages at `/how-to/<slug>/` and a How-to index at `/how-to/`. There
  is no blog, RSS, author page or tag page.
- The list is curated, not a matrix of every browser pair. A page exists only
  when it has something specific to say: menu paths, file locations and what is
  lost. A topic with nothing unique is merged or left out.
- Every page shows the browser's built-in method first and Snug only where it
  adds something (preview, choosing folders, Merge or Replace, Skip duplicates,
  Safety snapshot, formats, Auto-export).
- Browser facts live in one typed module. Each fact has an official source URL,
  a verified date and the browser version checked. A missing fact is
  `not-listed`. Copy uses placeholders and never states a browser fact inline.
- Copy is one file per page per locale, with English required and key parity
  enforced for every other locale. A page is routed, and gets hreflang, only in
  the locales that carry it.
- The pages are Astro routes built like the Comparison pages, not part of the
  Starlight Guide. The Guide links to them through a site-side mapping, so the
  Guide's markdown and its translations are untouched.
- Structured data is `WebPage` and `BreadcrumbList`, plus `CollectionPage` and
  `ItemList` on the index. No HowTo, FAQPage, Rating or Review data.

## Consequences

- Adding a page means adding data and copy: routes, sitemap, llms.txt, the index
  and the e2e path list follow from the registry.
- Browser facts need re-verifying after major browser releases.
- Pages that stay unindexed are merged or removed rather than multiplied.
