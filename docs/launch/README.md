# Launch kit

The plan and index for the Snug 2.0 relaunch. Snug was "Bookmark Import/Export"
until the 2.0 rename, so every channel frames the launch as the same extension,
renamed and rebuilt. The only conversion is installing from the Chrome Web
Store.

Nothing in the kit has been submitted or posted. Every submission needs a human
confirmation first.

## Kit index

| File                                                           | What it holds                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`directories.csv`](directories.csv)                           | Directory tracker: Batch, Campaign tag, URLs and Status per channel |
| [`copy/directories.md`](copy/directories.md)                   | Directory copy, one section per variant ID                          |
| [`copy/community.md`](copy/community.md)                       | Product Hunt, Show HN, Reddit, X and YouTube copy                   |
| [`press-kit.md`](press-kit.md)                                 | Boilerplate, fact sheet, asset links, contact                       |
| [`assets/`](assets/)                                           | Product Hunt gallery and thumbnail, X header                        |
| [`../store/baseline-2026-09.md`](../store/baseline-2026-09.md) | Pre-rename analytics to compare against                             |

Variant IDs in `copy/directories.md`: `extension`, `alternatives`,
`open-source`, `privacy`, `es`. Each row of `directories.csv` names its variant
and its own Campaign tag. Use the row's tag, never one shared tag per variant.

## Campaign tags

A Campaign tag matches `^[A-Za-z0-9_-]{1,32}$` and is unique per channel.
Landing page links use `https://snug.andryore.dev/?c=<tag>`. Install redirect
links use `https://snug.andryore.dev/install?c=<tag>`. The tag comes from the
`Campaign Tag` column of `directories.csv`. Reserved tags: `producthunt`, `hn`,
`reddit-<sub>`, `x`, `youtube`, `github`.

## Channel map (ORB)

| Type     | Channel                                                  | Campaign tag                                                          | Copy                                                                                                                                                                                                                         |
| -------- | -------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owned    | X                                                        | `x`                                                                   | [X](copy/community.md#x)                                                                                                                                                                                                     |
| Owned    | YouTube                                                  | `youtube`                                                             | [YouTube](copy/community.md#youtube)                                                                                                                                                                                         |
| Owned    | GitHub repository                                        | `github`                                                              | Plain repository link, no `c=` value on the repository itself                                                                                                                                                                |
| Rented   | Product Hunt                                             | `producthunt`                                                         | [Product Hunt](copy/community.md#product-hunt)                                                                                                                                                                               |
| Rented   | Show HN                                                  | `hn`                                                                  | [Show HN](copy/community.md#show-hn)                                                                                                                                                                                         |
| Rented   | Reddit: r/chrome_extensions, r/opensource, r/SideProject | `reddit-chrome_extensions`, `reddit-opensource`, `reddit-sideproject` | [Reddit](copy/community.md#reddit)                                                                                                                                                                                           |
| Borrowed | Directories, Batch 1 to 3 (20 rows in the CSV)           | One per row                                                           | [`extension`](copy/directories.md#extension), [`alternatives`](copy/directories.md#alternatives), [`open-source`](copy/directories.md#open-source), [`privacy`](copy/directories.md#privacy), [`es`](copy/directories.md#es) |

Rented channels drive visits to the owned ones: the Landing page and the Chrome
Web Store listing.

## Directory batches

| Batch | When         | Directories (Campaign tag)                                                                                                                                                                                                                                   |
| ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Week 1       | ExtensionLaunch (`extensionlaunch`), Web Store Extensions (`webstoreext`), Uneed (`uneed`), LibHunt (`libhunt`), SaaSHub (`saashub`), Sube.dev (`sube`), Prouct (`prouct`)                                                                                   |
| 2     | Weeks 2 to 3 | AlternativeTo (`alternativeto`), OpenAlternative (`openalternative`), DevHunt (`devhunt`), Peerlist Launchpad (`peerlist`), Indie Hackers Products (`indiehackers`), PeerPush (`peerpush`), Twelve Tools (`twelvetools`), Alternativas.io (`alternativasio`) |
| 3     | Weeks 2 to 3 | awesome-privacy (`awesomeprivacy`), lofi.so Local-First Web (`lofi`), SourceForge (`sourceforge`), Fazier (`fazier`), TinyLaunch (`tinylaunch`)                                                                                                              |

Read the row's `Notes` column before submitting. Twelve Tools and Fazier ask for
a backlink on the Landing page or footer for the free tier: decide before
submitting, and do not change the Landing page for it.

## Timeline

Day D is a Tuesday, Wednesday or Thursday, about three weeks after the kit is
ready. Andry fills it in: **D = `____-__-__`**.

| When         | What                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| Week -1      | Pre-launch checklist below. Gallery, thumbnail and header are already in `assets/` |
| Week 1       | Batch 1 directories                                                                |
| Weeks 2 to 3 | Batch 2 and Batch 3 directories                                                    |
| Day D        | Product Hunt, X thread, YouTube community post and description refresh             |
| D+2 to D+7   | Show HN, then the three Reddit posts, one per day                                  |
| D+8 to D+29  | Finish any directory still in `Draft`; answer comments                             |
| Day 30       | Wrap-up with the template below                                                    |

## Runbook: who does what

Claude drives the Chrome Web Store dashboard and directory forms through the
`cws-dash` browser. Claude fills forms and drafts, and stops before anything is
submitted or posted. Andry confirms or submits.

| Channel                | Claude (via cws-dash)                                                               | Andry                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Directories, Batch 1-3 | Fills each form with the variant copy and the row's Campaign tag                    | Confirms, then submits                                                                      |
| Product Hunt           | Fills the draft from [Product Hunt](copy/community.md#product-hunt)                 | Reviews and publishes; answers comments all day                                             |
| Reddit                 | Fills each post from [Reddit](copy/community.md#reddit); checks the sub rules first | Confirms and submits                                                                        |
| Show HN                | Nothing to fill                                                                     | Posts from [Show HN](copy/community.md#show-hn) and adds the first comment                  |
| X                      | Nothing to fill                                                                     | Posts the [X](copy/community.md#x) thread                                                   |
| YouTube                | Nothing to fill                                                                     | Posts the [YouTube](copy/community.md#youtube) community post and refreshes the description |

### Week 1

1. Claude fills Batch 1 forms one at a time with the matching variant and tag.
2. Andry confirms each and submits. Claude then records `Submission Date`,
   `Status` and `Live URL` in `directories.csv`.

### Day D

1. Re-check the facts that move (see the pre-launch checklist).
2. Claude has the Product Hunt draft ready; Andry publishes it.
3. Andry posts X and YouTube.
4. Andry stays on Product Hunt comments through the day.

### D+2 to D+7

1. Andry posts Show HN and adds the first comment.
2. One Reddit post per day. Claude prepares each, Andry confirms and submits.

### Weeks 2 to 3 and after

Work the remaining directory rows. When a listing goes live, set `Status` and
`Live URL`, and set `Backlink Verified` after checking the link.

## Pre-launch checklist

- [ ] `apps/site/src/seo/store-facts.ts` matches the live Chrome Web Store
      listing: rating, rating count, user count, promo video upload date.
- [ ] The listing is on 2.x (Snug, not Bookmark Import/Export 1.x).
- [ ] The accounts needed are logged in to the cws-dash Chrome.
- [ ] Facts quoted in the copy match [`../store/README.md`](../store/README.md)
      and [`.agents/product-marketing.md`](../../.agents/product-marketing.md).
- [ ] Every `Website URL` and `Install URL` in `directories.csv` opens and
      redirects correctly.
- [ ] Day D is set above.

## Metrics

Two sources, read together.

**Landing page visits and install clicks.** Visits come from the nginx access
log ([ADR 0011](../adr/0011-landing-static-site-no-third-party-scripts.md)).
Grep the log for `c=<tag>` per Campaign tag. A request to `/?c=<tag>` is a
visit. A request to `/install?c=<tag>` is an install click, answered with a 302
to the listing. The log is short-lived, so save the counts at each check.

**Listing views by campaign.** The Chrome Web Store dashboard UTM report, by
campaign, shows listing views per Campaign tag. The Install redirect adds
`utm_campaign` to the listing link.

**Comparison.** Compare installs, uninstalls, page views, impressions and weekly
users with [`../store/baseline-2026-09.md`](../store/baseline-2026-09.md), the
pre-rename baseline for September 2026.

How to read them:

- Many visits and few install clicks: the channel sends the wrong audience, or
  the copy promises something the Landing page does not.
- Install clicks but no listing views for that campaign: check the redirect.
- Direct and organic installs carry no tag, so total installs is not the sum of
  the tags.
- Breakdowns in the baseline do not sum to its headline numbers. Compare like
  with like.

| Tag | Visits (`/?c=`) | Install clicks (`/install?c=`) | Listing views (CWS) | Date read |
| --- | --------------- | ------------------------------ | ------------------- | --------- |
|     |                 |                                |                     |           |

## 30-day wrap-up template

Copy this into a new file under `docs/launch/` when day 30 arrives.

```md
# Launch wrap-up: Snug 2.0, D to D+30

- D: YYYY-MM-DD
- Period read: YYYY-MM-DD to YYYY-MM-DD
- Sources: nginx access log, CWS dashboard (UTM report by campaign)

## Totals vs baseline

| Metric       | Baseline (Sept 2026) | Launch period | Change |
| ------------ | -------------------- | ------------- | ------ |
| Installs     | 669                  |               |        |
| Uninstalls   | 162                  |               |        |
| Page views   | 700                  |               |        |
| Impressions  | 5.07K                |               |        |
| Weekly users | ~5K                  |               |        |
| Rating       | 4.75 (20 ratings)    |               |        |

## By Campaign tag

| Tag | Visits | Install clicks | Listing views | Notes |
| --- | ------ | -------------- | ------------- | ----- |

## Directories

- Live:
- Rejected or waiting:
- Backlinks verified:

## What worked, what did not

## Decisions for the next launch
```
