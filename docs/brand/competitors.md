# Competitor analysis — Chrome bookmark export/import extensions

Scope: direct competitors (bookmark export/import utilities), not general
bookmark managers (Raindrop.io, Workona, Diigo — different category, skipped).

## Our own current listing (baseline)

- **Name:** Bookmark Import/Export (by AndryOre)
- **Rating:** 4.72 / 5, 18 reviews
- **Positioning:** exports from specific folders, cross-browser, HTML output
  plus other export options
- **Complaints:** no visual feedback when an export completes; exported filename
  isn't date-stamped

## Direct competitors

| Name                                                        | Users  | Rating   | Icon                                    | Positioning                                                                                                                             | Complaints / gaps                                                                                                                                          |
| ----------------------------------------------------------- | ------ | -------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bookmarks Exporter** (oneryx)                             | 2,000  | 5.0 (7)  | geometric logo, no distinct brand color | Flattens bookmarks to JSON/CSV, folders become tags — targets Notion/Excel/DB imports, not browser-to-browser                           | No reviews visible; last updated 2022 — stale, niche flatten-to-tags use case only                                                                         |
| **Bookmarks folder exporter & importer** (Kostiantyn Rypta) | 107    | 5.0 (1)  | generic folder icon                     | Export/import selected folders to a text file; also saves open tabs to a folder                                                         | Tiny user base, barely reviewed, plain generic icon/name — no brand identity at all                                                                        |
| **Export Selective Bookmarks**                              | ~5,000 | 4.2 (48) | colorful generic logo                   | Select any part of the bookmark tree, export to Chrome-compatible HTML; pitched for sharing a subset without exposing the whole library | 4.2 is the lowest rating among the live, maintained options — folder-tree UX likely friction point                                                         |
| **Bookmark Folder Import & Export**                         | 361    | 5.0 (1)  | blue folder + link icon                 | Exact-folder mode, grouped TXT output, search/filter, dedup, TXT+CSV, fully local                                                       | Very low adoption despite richer feature list — discoverability/naming problem, not a quality one                                                          |
| **Selective Bookmarks Export Tool**                         | 10,000 | 4.9 (47) | blue/teal bookmark+document icon        | Export chosen bookmarks to HTML, customizable structure, keyword filter, dark mode                                                      | Strongest direct competitor by reach+rating; open source (MIT); EN/中文 only — no other i18n                                                               |
| **101 Export History/Bookmarks to JSON/CSV\*/XLS\***        | 30,000 | 3.1 (71) | colorful generic logo                   | Exports history _and_ bookmarks to JSON; CSV/XLS needs a separate desktop converter                                                     | Lowest rating of the set — direct CSV/XLS claimed in the name but not actually delivered in-extension; history feature capped at 3 months by Chrome itself |

## Takeaways for naming/positioning

- Every direct competitor uses a **literal, generic, unbranded name**
  ("Bookmarks Exporter", "Export Selective Bookmarks", "101 Export..."). None
  has a proper brand identity, icon system, or voice — this is the open gap.
- The best-performing one (**Selective Bookmarks Export Tool**, 10k/4.9) wins on
  scope-control (pick exactly what to export) and polish (dark mode, i18n), not
  on branding — branding is genuinely unclaimed territory in this niche.
- The worst-performing one (**101 Export...**, 3.1) over-promises in its name
  (CSV/XLS) and under-delivers in-product — a lesson for our own CWS descriptor:
  never name a format/feature we don't ship directly.
- Our own current gaps (no completion feedback, no date-stamped filename) are
  real UX fixes to fold into the apply-spec, independent of rebrand — none of
  the competitors above solve these either, so fixing them is a differentiator,
  not table stakes we're behind on.
- No competitor frames itself as part of a **creator's own tool family** (the
  "by Andry Orellana" / AndryOre endorsed-brand angle) — this is unclaimed and
  consistent with the brief's emotional promise.

## Verified 2026-10-05

Re-checked on the live Chrome Web Store listings. The tables above are the
snapshot taken during the rebrand and stay as the historical record.

| Listing                         | Users | Rating   | Last update | Change vs the snapshot above                          |
| ------------------------------- | ----- | -------- | ----------- | ----------------------------------------------------- |
| Snug (our listing)              | 5,000 | 4.8 (20) | 2026-10-05  | Renamed from Bookmark Import/Export; was 4.72 from 18 |
| Selective Bookmarks Export Tool | 10k   | 4.8 (48) | 2026-10-03  | Rating 4.9 (47) to 4.8 (48); new v1.7.0 after a gap   |
| Export Selective Bookmarks      | 5k    | 4.2 (48) | 2026-06-30  | No change                                             |
| 101 Export History/Bookmarks    | 30k   | 3.1 (71) | 2026-08-18  | No change; still JSON only, CSV/XLS needs a converter |
| Bookmark Folder Import & Export | 408   | 5.0 (1)  | 2026-04-21  | Users 361 to 408                                      |
| Bookmarks Exporter (oneryx)     | 2k    | 5.0 (7)  | 2022-08-22  | No change; not updated since 2022                     |
| Bookmarks folder exporter       | 101   | 5.0 (1)  | 2025-01-23  | Users 107 to 101                                      |

New since the snapshot:

- **Maple Backup — Bookmark Snapshots** (7k users, 4.0 from 57 ratings, updated
  2026-09-21). Scheduled local snapshots with restore, plus optional copies to
  Google Drive, OneDrive or Dropbox. Its listing declares it handles personally
  identifiable information, authentication information and website content. It
  is the closest overlap with Snug's scheduled backups; Snug handles none of
  that data.
- **EverSync** (cloud sync and backup service, about 200k users per a search
  snippet, not verified on the store). Indirect competitor.
