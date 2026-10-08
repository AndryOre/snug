# Product Marketing Context

**Document version:** v2 **Last updated:** 2026-10-08

Snug is free, consumer-facing, and has no pricing, signup, trial, demo or sales
motion. Marketing skills must not suggest any of those. The only conversion is
installing the extension from the Chrome Web Store.

## Product Overview

**One-liner:** Export, import, and back up your bookmarks, entirely on your
device.

**What it does:** Snug moves your bookmarks between browsers exactly as you left
them. Export the whole tree or only chosen folders in six formats (HTML, JSON,
CSV, Markdown, OPML, XBEL). Import with a preview first, then merge, replace, or
add everything to a new folder, and undo a replace from a Safety snapshot. It
also finds duplicates and runs scheduled Auto-export to the Downloads folder.

**Product category:** Browser bookmark export/import and backup extension
(Chrome Web Store, Chromium browsers).

**Product type:** Free Chrome MV3 extension, open source, local-only.

**Business model:** Free. No account, no ads, no data collection, no network
calls. Solo developer project under the AndryOre name, but Snug is deliberately
an independent brand (no "by AndryOre" on the product).

## Target Audience

**Target users:** Individuals with years of curated bookmarks who switch
browsers or machines and do not want to lose them. Today's real users are power
users and developers; the brand is kept approachable so a broader consumer
audience is not locked out.

**Decision-makers:** The user alone. Install is a one-click, no-cost decision.

**Primary use case:** Move or back up a bookmark tree without losing structure,
and without trusting a third party with it.

**Jobs to be done:**

- Move my bookmarks to a new browser or machine intact.
- Keep a dated backup so I can restore if something breaks.
- Share or archive one folder (research, a course, a job search) without
  exposing my whole library.

**Use cases:**

- Switching between Chrome, Edge, Brave, Opera, or from Safari.
- Scheduled weekly backup to Downloads.
- Cleaning duplicates before or after an import.
- Exporting to Markdown, OPML, or CSV for notes apps and spreadsheets.

## Personas

Not applicable: single-user, no buying committee.

## Problems & Pain Points

**Core problem:** Bookmarks are years of accumulated work, and the built-in
browser export is minimal while many extensions are faceless or ask for more
trust than they earn.

**Why alternatives fall short:**

- Faceless, literal-named utilities with no voice, icon system, or visible trust
  story.
- All-or-nothing exports with no folder control.
- Overpromised formats the extension does not actually produce (the "101
  Export..." case, 3.1 stars).
- No confirmation that an export happened; filenames that cannot be told apart
  later (both fixed in Snug).

**What it costs them:** Lost or scrambled folder structure, hours rebuilding a
library, or exposing private research and work links to an unknown extension.

**Emotional tension:** Handing read/write access to your whole bookmark tree to
a random extension feels riskier than it should.

## Competitive Landscape

Numbers verified on the live Chrome Web Store listings on 2026-10-05. Re-check
before quoting any of them on the page.

**Direct:**

| Listing                         | Users | Rating   | Last update | Falls short because                                                         |
| ------------------------------- | ----- | -------- | ----------- | --------------------------------------------------------------------------- |
| Selective Bookmarks Export Tool | 10k   | 4.8 (48) | 2026-10-03  | HTML export only; strongest on scope control and polish; open source        |
| Export Selective Bookmarks      | 5k    | 4.2 (48) | 2026-06-30  | HTML export only                                                            |
| Bookmark Folder Import & Export | 408   | 5.0 (1)  | 2026-04-21  | TXT/CSV only; almost no adoption                                            |
| Bookmarks Exporter (oneryx)     | 2k    | 5.0 (7)  | 2022-08-22  | Abandoned; flattens to JSON/CSV for Notion or Excel, not browser-to-browser |
| 101 Export History/Bookmarks    | 30k   | 3.1 (71) | 2026-08-18  | JSON only; CSV/XLS needs a separate desktop editor despite the name         |

**Closest overlap on backups:** Maple Backup — Bookmark Snapshots (7k users, 4.0
from 57 ratings, updated 2026-09-21). Daily or scheduled local snapshots with
restore, plus optional copies to Google Drive, OneDrive or Dropbox. Its listing
declares it handles personally identifiable information, authentication
information and website content. Snug's contrast: it handles none of that.

**Secondary:** The browser's built-in "Export bookmarks" (HTML only, no preview,
no schedule, no dedupe) and browser sync (needs an account and a cloud).

**Indirect:** EverSync (cloud sync and backup service, about 200k users per a
search snippet, unverified), bookmark managers such as Raindrop.io (different
category: cloud, accounts, subscriptions), and doing nothing / copying the
profile folder by hand.

## Differentiation

**Key differentiators:**

- Zero network calls, no account, verifiable in the open source code.
- Six export formats and four import sources, with format auto-detection.
- Itemized import preview with Import selection, merge / replace / new folder,
  several files at once as an Import batch, and undo for replace.
- Scheduled Auto-export with retention and failure notification.
- Duplicates page and Skip duplicates on import.
- 10 languages; follows the browser theme and language.

**How we do it differently:** Everything reads and writes the browser's own
bookmarks tree on-device. There is no server to trust.

**Why that's better:** The trust story is structural, not a promise in a privacy
policy.

**Why customers choose us:** From the public Chrome Web Store reviews: it works
in Chromium browsers that lack bookmark export or import (Dia, Vivaldi), it can
export one chosen folder, and it is simple. Most of the 16 text reviews predate
the Snug rename.

## Objections

| Objection                                      | Response                                                                                                                                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Why does it need access to all my bookmarks?" | It is the only way to read and write them. It makes no network calls; the source is public.                                                                                       |
| "Is a solo-dev extension safe?"                | Public source, CodeQL, OpenSSF Scorecard and Best Practices (links below), pinned CI.                                                                                             |
| "My browser already exports HTML."             | Built-in export has no folder selection, preview, undo, schedule, dedupe or extra formats.                                                                                        |
| "Will it overwrite my current bookmarks?"      | Never silently: preview first, and replace saves a Safety snapshot you can restore.                                                                                               |
| "Can I import several files at once?"          | Yes: pick several files and Snug imports them as one batch, each in its own folder (Folder mode, two or more files), and Cancel puts your bookmarks back. Replace needs one file. |

**Trust links:**

- Source: https://github.com/AndryOre/snug
- OpenSSF Scorecard: https://scorecard.dev/viewer/?uri=github.com/AndryOre/snug
- OpenSSF Best Practices: https://www.bestpractices.dev/projects/15093
- CI: https://github.com/AndryOre/snug/actions/workflows/ci.yml
- Privacy Policy: `PRIVACY_POLICY.md`

**Anti-persona:** Anyone who wants cloud sync across devices, a bookmark manager
with tags and search, or a team product. Snug does none of that and will not
imply it.

## Switching Dynamics

**Push:** Moving to a new browser or machine; the built-in export is bare; fear
of losing years of curation; distrust of faceless extensions.

**Pull:** Local-only trust, exact structure preserved, preview and undo,
scheduled backups, six formats.

**Habit:** "I will just use the browser's export" or "sync handles it".

**Anxiety:** Will it mangle my folders? Will it send my data somewhere? Can I
undo a bad import?

## Customer Language

**How they describe the problem:**

- "I wanted to export bookmarks from a certain folder."
- "My Dia beta browser (based on Chromium) has no way to export bookmarks."
- "I could not get Vivaldi to import bookmarks from Chrome - crashed every
  time."

**How they describe us:**

- "Does what it says."
- "Easy to use and intuitive."
- "It imported the export file in a flash. Painless."
- "It had all the features I wanted."
- "The best extension made for the purpose it was made."

Source: public Chrome Web Store reviews, read 2026-10-05.

**Words to use:** bookmarks, export, import, back up, on your device, local,
exactly as you left them, preview, undo, no account.

**Words to avoid:** sync, cloud, seamless, effortless, supercharge, "powerful",
"ultimate", any format or capability Snug does not ship, exclamation points,
emoji in copy.

**Glossary:**

| Term             | Meaning                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Auto-export      | Scheduled export to the Downloads folder                                                                            |
| Safety snapshot  | Automatic copy saved before a replace so it can be restored; the latest five are kept, and you can take one anytime |
| Import selection | The bookmarks and folders you check in the preview to import only those                                             |
| Import batch     | Several files imported together as one operation; Cancel restores the previous bookmarks                            |
| Retention        | Keep only the newest N exported files                                                                               |
| Skip duplicates  | Import option that leaves out URLs already present                                                                  |

## Brand Voice

**Tone:** Calm, precise, quietly warm. Short declarative sentences.

**Style:** State what happens and stop. Trust-first: lead with local-only, not a
feature list. Peer to peer; never sales-y or onboarding-flavored.

**Personality:** Precise, honest about scope, quietly confident, careful, small
on purpose.

English first; Spanish is adapted for meaning, neutral Latin American, tú, no
voseo. Source of truth: `docs/brand/voice.md`, `docs/store/README.md`,
`locales/*.json`.

## Proof Points

**Metrics:** 5,000 users on the public listing (2026-10-05); 4.8 stars over 20
ratings; about 5,000 weekly users (Sept 2026); 10 languages; 21 GitHub stars.

**Customers:** None to name.

**Testimonials:** Public Chrome Web Store reviews, shown with the reviewer name
as the store displays it. Link to the reviews page when quoting.

> "My Dia beta browser (based on Chromium) has no way to export bookmarks. [...]
> It quickly created the HTML bookmarks file I needed." — Birdman, Jun 2025

> "I could not get Vivaldi to import bookmarks from Chrome - crashed every time.
> [...] Installed this in Vivaldi and it imported the export file in a flash.
> Painless." — Sean Frey, Sep 2024

> "I wanted to export bookmarks from a certain folder. This extension can do
> it." — Karol Darvaš, Feb 2026

> "Used the HTML export and it worked awesome." — Jacob Hanson, Jun 2026

Most predate the rename, when the listing was "Bookmark Import/Export". Do not
present them as reviews of the v2 interface.

**Value themes:**

| Theme               | Proof                                                         |
| ------------------- | ------------------------------------------------------------- |
| Local-only trust    | Zero network calls, no account, open source, Privacy Policy   |
| Safe to import      | Preview, three import modes, Safety snapshot undo             |
| Hands-off backups   | Scheduled Auto-export with Retention and failure notification |
| Works where you are | Any Chromium browser, 10 languages, six formats               |

## Goals

**Business goal:** More installs of the free extension and more discoverability
(Chrome Web Store, search, AI answers). No revenue goal.

**Conversion action:** Click "Add to Chrome" and install from the Chrome Web
Store.

**Current metrics:** Sept 2026 baseline (pre-rename): 669 installs, 700 listing
page views, 5.07K impressions, about 24% uninstalls vs installs. Source:
`docs/store/baseline-2026-09.md`. The Featured badge program is closed
(`docs/store/featured-nomination.md`), so do not plan around it.

## Changelog

_Newest first. One line per revision: what changed and why._

- v2 (2026-10-08) — Import limit lifted: several files per Import batch, Import
  selection and five Safety snapshots now shipped. Updated differentiators and
  the "several files" FAQ row.
- v1 (2026-10-05) — Initial context, auto-drafted from README, `docs/brand/*`
  and `docs/store/*` ahead of the landing page at snug.andryore.dev. Free,
  no-signup framing set explicitly. Filled with live Chrome Web Store reviews,
  verified competitor numbers (including Maple Backup), and trust links.
