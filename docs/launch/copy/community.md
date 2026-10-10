# Community launch copy

Ready-to-paste text for the Snug 2.0 launch on Product Hunt, Hacker News,
Reddit, X and YouTube. Snug was "Bookmark Import/Export" until the 2.0 rename.
Product Hunt, Hacker News and Reddit have never seen the old name, so those
posts do not mention it. X and YouTube are the maker's own channels and keep the
rename announcement.

Nothing here has been posted. Posting is manual, by the maker, from their own
account.

The "imports one file at a time" limit is lifted: Snug imports several files at
once as an Import batch. Copy below was updated to match. If any post was
published before that change, it stays as historical text and is not edited; all
future copy must not state the limit.

## Rules for this copy

- Proof points come only from
  [`.agents/product-marketing.md`](../../../.agents/product-marketing.md) and
  the store facts in [`docs/store/README.md`](../../store/README.md). No other
  numbers appear.
- No pricing, signup, trial or sync language. The one action is installing from
  the Chrome Web Store.
- Links to the Landing page use `https://snug.andryore.dev/?c=<tag>`. Links to
  the Install redirect use `https://snug.andryore.dev/install?c=<tag>`. The tag
  matches `^[A-Za-z0-9_-]{1,32}$` and comes from the reserved set:
  `producthunt`, `hn`, `reddit-<sub>`, `x`, `youtube`, `github`.
- Reddit tags use the lowercase subreddit name: `reddit-chrome_extensions`,
  `reddit-opensource`, `reddit-sideproject`.
- Links to the GitHub repository stay plain. They are not Landing page or
  Install redirect links, so they carry no `c=` value.
- Character counts below are measured with `len()` over the exact text inside
  each block.

## Facts every post may use

| Fact                                                                                            | Source                   |
| ----------------------------------------------------------------------------------------------- | ------------------------ |
| Free, open source (MIT), no account, no ads, no data collection, zero network calls             | product-marketing.md     |
| Six export formats: HTML, JSON, CSV, Markdown, OPML, XBEL; Markdown and OPML are export-only    | product-marketing, usage |
| Whole tree or chosen folders; import preview; merge, replace or new folder; undo for replace    | product-marketing.md     |
| Safety snapshot before a replace; Duplicates page; Skip duplicates on import                    | product-marketing.md     |
| Scheduled Auto-export to Downloads or a chosen folder with Retention and a failure notification | product-marketing.md     |
| Works in Chrome and other Chromium browsers; 10 languages                                       | product-marketing.md     |
| 5,000 users and 4.8 stars over 20 ratings on the public listing (read 2026-10-05)               | product-marketing.md     |
| Imports several files at once as one Import batch; no sync, no cloud                            | product-marketing.md     |

Re-check the user and rating numbers on the live listing on launch day. They
move.

## Product Hunt

Form requirements read on 2026-10-06 from the Product Hunt Launch Guide
(`/launch/preparing-for-launch`, content checklist) in the logged-in Chrome,
read-only. The submission form itself starts with a "Link to the product" field
and a "Get started" button that opens a draft, so no further form step was
opened and nothing was filled in.

| Field         | Requirement from the guide                                                                |
| ------------- | ----------------------------------------------------------------------------------------- |
| URL           | Direct product page. Shortened links and tracked links (UTMs) are not accepted            |
| Name          | Only the product name, no description, no emoji                                           |
| Tagline       | 60 characters maximum                                                                     |
| Description   | 500 characters maximum in the guide. This kit keeps it at 260 or fewer                    |
| Launch tags   | Up to 3                                                                                   |
| Thumbnail     | Required, square, 240x240 recommended, under 3 MB                                         |
| Gallery       | 2 images required, 1270x760 recommended                                                   |
| Video         | Optional, YouTube links only                                                              |
| First comment | Recommended. Ask for feedback, never for upvotes                                          |
| Timing        | Launch can be scheduled up to 1 month ahead. 12:01 am Pacific starts a full 24-hour cycle |
| Pricing       | Choose "Free"                                                                             |

Not verified: the live topic picker. Topics below were checked only as existing
`/topics/<slug>` pages (`chrome-extensions`, `productivity`, `open-source`).
Confirm them in the picker when filling the form.

The URL field says tracked links are not accepted. Try
`https://snug.andryore.dev/?c=producthunt` first. If the form rejects it, put
the plain `https://snug.andryore.dev/` in the URL field and keep the tagged
links in the first comment and the extra Links field.

### Name

```text
Snug
```

### Tagline (56 of 60)

```text
Export, import and back up your bookmarks on your device
```

### Description (253 of 260)

```text
Snug moves your bookmarks between browsers exactly as you left them. Export the whole tree or chosen folders in six formats, preview every import, undo a replace, and schedule backups to Downloads or a folder you choose. Free, open source, and everything stays on your device.
```

### Topics (3)

1. Chrome Extensions
2. Productivity
3. Open Source

### Links

- Product URL: `https://snug.andryore.dev/?c=producthunt`
- Install: `https://snug.andryore.dev/install?c=producthunt`

### Maker first comment

```text
Hi Product Hunt. I'm the maker of Snug, a Chrome extension for moving and backing up your bookmarks.

Snug moves your bookmarks between browsers exactly as you left them. You can export the whole tree or only the folders you pick, in six formats: HTML, JSON, CSV, Markdown, OPML and XBEL. Import takes several files at once, picked or dropped onto the toolbar popup. Snug shows them as a tree preview, you choose exactly what to bring in, and everything lands as one Import batch. With a single file you can merge, replace, or add to a new folder, and a replace saves a Safety snapshot so you can undo it.

It also finds duplicates, and Auto-export writes scheduled backups to Downloads or a folder you choose, keeps only the newest files, and notifies you if one fails.

Everything runs on your device. Snug makes no network calls, needs no account, and the source is public under the MIT license. It works in Chrome and other Chromium browsers, in 10 languages.

What it does not do: it is not a sync service or a bookmark manager.

Install: https://snug.andryore.dev/install?c=producthunt
More details: https://snug.andryore.dev/?c=producthunt

I would like to hear which bookmark moves or backups gave you trouble before, and which formats you still miss.
```

### Gallery captions

File names come from the launch-assets ticket (AO-1424). Each gallery image is
built from the matching English store screenshot, in store order. Images 1 to 4
were regenerated on 2026-10-08 for 2.1.0.

| File                                 | Caption                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `producthunt-gallery-1-1270x760.png` | Export exactly what you choose: one folder or everything, in six formats   |
| `producthunt-gallery-2-1270x760.png` | Preview every import as a tree and choose exactly what to bring in         |
| `producthunt-gallery-3-1270x760.png` | Scheduled backups, hourly to weekly, to Downloads or a folder you choose   |
| `producthunt-gallery-4-1270x760.png` | Export in one click, or drop files onto the toolbar popup to import        |
| `producthunt-gallery-5-1270x760.png` | Everything stays on your device: no account, no network calls, open source |

### Video

```text
https://youtu.be/GA7bAMIAvI0
```

## Show HN

Tone: technical and modest. State what it does and where it falls short, no
adjectives. Show HN rules: post something people can try, do not ask for
upvotes, answer comments yourself. Use the Landing page as the submitted URL
(the repository is linked inside the first comment).

- Submitted URL: `https://snug.andryore.dev/?c=hn`

### Title (72 of 80)

```text
Show HN: Snug, a local-only bookmark export, import and backup extension
```

### First comment

```text
I made Snug, a Chrome extension (Manifest V3, any Chromium browser) for moving and backing up bookmarks.

What it does: export the whole bookmark tree or selected folders as HTML, JSON, CSV, Markdown, OPML or XBEL. Import reads a file (including a Chrome profile Bookmarks file or Safari bookmarks) and shows a preview before anything changes. You then merge, replace, or put everything in a new folder. A replace first saves a Safety snapshot so it can be undone. There is also a duplicates page and a scheduled Auto-export to the Downloads folder.

Everything reads and writes the browser's own bookmarks tree on the device. The extension makes no network calls and has no account, so the privacy claim can be checked in the source instead of taken from a policy. MIT licensed: https://github.com/AndryOre/snug

Limits: Markdown and OPML are export-only, and there is no sync. Auto-export saves to Downloads through the downloads API, or to a folder you choose through the File System Access API, which asks you to confirm access once after the browser restarts.

Install: https://snug.andryore.dev/install?c=hn

I would value feedback on the import edge cases, especially files from bookmark managers I have not tested.
```

## Reddit

Rules read on 2026-10-06 from `old.reddit.com/r/<sub>/about/rules/` and each
subreddit sidebar. `curl` with a browser User-Agent no longer works from this
server: `old.reddit.com` now answers every request with a login redirect
(HTTP 302) or the "Welcome to Reddit" interstitial. The rules were read instead
with same-origin `GET` requests from one tab of the logged-in Chrome
(`cws-dash`), read-only, with no post, vote or form interaction. Reddit changes
rules often, so re-read the page before posting.

General notes for all three posts: write the post by hand from the draft below,
disclose that you made it, answer every comment, and keep promotional posts well
under 10% of your account's activity.

### Chosen subreddits

#### r/chrome_extensions

- Rules summary: all posts must be about Chrome extensions (Rule 3). No spam: no
  misleading or clickbait sites, and spamming across several subreddits gets
  reported to admins (Rule 4). Constructive posts only (Rule 2). Moderators have
  final say (Rule 9).
- Self-promotion: no explicit ratio or approval rule. An extension post is on
  topic, so it is allowed. Post once, not as a copy of the other subreddits.
- Format: text post. Flair requirements could not be read without opening the
  submit form. Check the flair list when posting.
- Tag: `reddit-chrome_extensions`

Title (50 of 300):

```text
Snug: export, import and back up bookmarks locally
```

Body:

```text
I'm the developer of Snug, an extension for moving and backing up bookmarks.

What it does:
- Exports the whole bookmark tree or only the folders you pick, as HTML, JSON, CSV, Markdown, OPML or XBEL.
- Imports with a preview first. You choose merge, replace, or a new folder, and a replace saves a Safety snapshot you can undo.
- Finds duplicates, and can skip them on import.
- Auto-export saves scheduled backups to Downloads or a folder you choose, keeps the newest N files, and notifies you if one fails.

It runs on your device, makes no network calls and needs no account. It is open source (MIT): https://github.com/AndryOre/snug

Limits: Markdown and OPML are export-only, and it does not sync anything.

Chrome Web Store: https://snug.andryore.dev/install?c=reddit-chrome_extensions
Details: https://snug.andryore.dev/?c=reddit-chrome_extensions

Feedback on import edge cases is welcome.
```

#### r/opensource

- Rules summary: no spam or excessive self-promotion. Reddit's guideline is
  under 10% of your posts promoting your own work, and the mods are "a little
  more forgiving" (Rule 2). Posts must be directly relevant to open source, and
  linked code must have a `LICENSE` file with an OSI-listed license (Rule 4).
  Snug is MIT. All AI-generated content counts as low-effort and bannable (Rule
  3), so rewrite the draft in your own words. No sensationalized titles (Rule
  5). No drive-by posting or karma farming (Rule 6): reply to comments.
- Flair: required, and must match the post. Use "Promotional" for sharing your
  own project (Rule 8).
- Format: text post that links the repository. The repository is the main link
  here, so it stays plain.
- Tag: `reddit-opensource`

Title (96 of 300):

```text
Snug: an MIT-licensed Chrome extension to export, import and back up bookmarks, no network calls
```

Body:

```text
I maintain Snug. Source and license: https://github.com/AndryOre/snug (MIT).

It exports bookmarks (whole tree or chosen folders) as HTML, JSON, CSV, Markdown, OPML or XBEL, and imports with a preview before anything changes. Merge, replace, or add to a new folder; a replace saves a Safety snapshot so it can be undone. It also finds duplicates and runs scheduled exports to Downloads or a folder you choose.

Everything reads and writes the browser's own bookmarks tree. The extension has no account, no server and no network calls, which is why I kept it open: that claim can be checked in the code. The repository runs CodeQL and OpenSSF Scorecard.

It works in Chrome and other Chromium browsers. It imports several files at once and does not sync.

Chrome Web Store: https://snug.andryore.dev/install?c=reddit-opensource
Project page: https://snug.andryore.dev/?c=reddit-opensource

I would like to hear what formats or import sources people still need.
```

#### r/SideProject

- Rules summary: the sidebar sets a submission format for projects:
  `[Project name] - [Short description]`. The `/about/rules/` page lists no
  rules in the HTML. The sub exists to share projects and get constructive
  feedback, so a project post is the intended use.
- Self-promotion: no ratio stated. Link posts and text posts are both accepted.
- Format: text post titled in the sidebar format.
- Tag: `reddit-sideproject`

Title (63 of 300):

```text
Snug - Export, import and back up your bookmarks on your device
```

Body:

```text
I built Snug, a free Chrome extension for moving and backing up bookmarks.

It exports the whole tree or chosen folders in six formats, previews every import, and lets you undo a replace from a Safety snapshot. Auto-export saves scheduled backups to Downloads or a folder you choose. Everything stays on your device: no account, no network calls, open source under MIT.

It does not sync. That was a choice about scope, and I am still deciding what to add next.

Chrome Web Store: https://snug.andryore.dev/install?c=reddit-sideproject
Project page: https://snug.andryore.dev/?c=reddit-sideproject
Source: https://github.com/AndryOre/snug

What would you want from a bookmark backup tool that this one does not do?
```

### Rejected subreddits

| Subreddit        | Reason                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| r/chrome         | Rule 6: "Promotion of Chrome extensions is not allowed at this time. Please try r/chrome_extensions instead. No requests to promote extensions will be accepted." |
| r/browsers       | Described as "a reddit for posting news about browsers, browser technology and web standards". An extension launch is not news, so the post would be off topic    |
| r/vivaldibrowser | Rule 5: no promotion of products, websites or extensions without contacting the mods first, and "all decisions are final". Needs prior mod approval               |
| r/privacy        | Rule 3: no self-promotion or promotional content of any kind, with an immediate ban without warning                                                               |
| r/selfhosted     | Not read in full: Snug has no server to self-host, so the post would be off topic                                                                                 |

## X

Tag: `x`. Posts stay under 280 characters, with links counted by the platform at
its own fixed length. No emoji, no hashtags.

### English thread

Post 1 (203 of 280):

```text
Bookmark Import/Export is now Snug. Version 2.0 is out: a new name and a rebuilt interface for the same job, moving and backing up your bookmarks exactly as you left them.

https://snug.andryore.dev/?c=x
```

Post 2:

```text
Export the whole tree or only the folders you pick, as HTML, JSON, CSV, Markdown, OPML or XBEL.
```

Post 3:

```text
Import shows a preview first. Then merge, replace, or add everything to a new folder. A replace saves a Safety snapshot, so you can undo it.
```

Post 4:

```text
Auto-export writes scheduled backups to Downloads or a folder you choose, keeps the newest files, and notifies you if one fails.
```

Post 5:

```text
Everything runs on your device. No account, no network calls, and the source is public under MIT.

Works in Chrome and other Chromium browsers, in 10 languages.

https://snug.andryore.dev/install?c=x
```

### Hilo en español

Post 1:

```text
Bookmark Import/Export ahora se llama Snug. Ya está la versión 2.0: un nombre nuevo y una interfaz rehecha para el mismo trabajo, mover y respaldar tus marcadores tal como los dejaste.

https://snug.andryore.dev/?c=x
```

Post 2:

```text
Exporta todo el árbol o solo las carpetas que elijas, en HTML, JSON, CSV, Markdown, OPML o XBEL.
```

Post 3:

```text
Al importar ves una vista previa primero. Luego combinas, reemplazas o agregas todo en una carpeta nueva. Un reemplazo guarda una instantánea de seguridad, así que puedes deshacerlo.
```

Post 4:

```text
La exportación automática guarda respaldos programados en Descargas o en una carpeta que elijas, conserva los archivos más recientes y te avisa si alguno falla.
```

Post 5:

```text
Todo se ejecuta en tu dispositivo. Sin cuenta, sin llamadas de red y con el código público bajo licencia MIT.

Funciona en Chrome y otros navegadores Chromium, en 10 idiomas.

https://snug.andryore.dev/install?c=x
```

## YouTube

Tag: `youtube`. Both pieces below carry tagged links.

### Community post

```text
Bookmark Import/Export is now Snug, version 2.0. Same extension, new name and a rebuilt interface.

Export your whole bookmark tree or only the folders you pick, preview every import before it changes anything, and undo a replace. Scheduled backups go to Downloads or a folder you choose. Everything stays on your device, with no account and no network calls.

Chrome Web Store: https://snug.andryore.dev/install?c=youtube
More: https://snug.andryore.dev/?c=youtube
```

### Video description refresh

For the existing Snug video. Replace the current description with this text and
keep the title and any chapter timestamps already on the video.

```text
Snug moves your bookmarks between browsers exactly as you left them. It was called Bookmark Import/Export until version 2.0.

What it does:
- Exports the whole bookmark tree or chosen folders as HTML, JSON, CSV, Markdown, OPML or XBEL.
- Imports with a preview first: merge, replace, or add to a new folder. A replace saves a Safety snapshot you can undo.
- Finds duplicates and can skip them on import.
- Auto-export saves scheduled backups to Downloads or a folder you choose and notifies you if one fails.

Everything runs on your device. Snug has no account and makes no network calls. It is open source under the MIT license: https://github.com/AndryOre/snug

Works in Chrome and other Chromium browsers, in 10 languages.

Install from the Chrome Web Store: https://snug.andryore.dev/install?c=youtube
Project page: https://snug.andryore.dev/?c=youtube
```
