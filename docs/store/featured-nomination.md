# Featured badge nomination pack (program closed)

Reference only: Google closed self-nominations for the Chrome Web Store Featured
badge on 2026-08-20 and is sunsetting the badge program later in 2026. Do not
try to nominate Snug. This pack keeps the copy-ready answers, the evidence
behind each form confirmation and the dashboard audit result, so they can be
reused if Google reopens nominations or for a similar listing review. Nothing
here was ever submitted.

> Paths to extension code (`lib/`, `entrypoints/`, `locales/`, `e2e/`) are
> relative to `apps/extension/`.

The Featured badge was editorial and could not be paid for. Listing facts below
come from the live listing as checked on 2026-10-05.

## Status: program closed

Source: the Chrome team's post
[Chrome Web Store updates: Faster reviews, new publication limits, badge updates, and more](https://developer.chrome.com/blog/cws-review-updates-2026),
published 2026-08-20.

- The post says the team is "sunsetting the 'Featured' badge program later this
  year", because baseline review standards for security and performance raised
  the bar for every extension and made the badge a less meaningful signal.
- "Self-nominations will close today and all currently pending self-nominations
  will be closed."
- Google points developers to its refreshed rating system as the strongest
  quality signal. The refreshed rating focuses on more recent reviews.
- The post does not say what happens to extensions that already carry the badge.

## What was tried on 2026-10-05

Signed in as the publisher, before the post above was found:

| Route                                                                 | What was done                                                                                                                            | Outcome                                                                                                                                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://support.google.com/chrome_webstore/contact/one_stop_support` | Opened with and without `hl=en`.                                                                                                         | Redirects server-side to the Help Center home (`https://support.google.com/chrome_webstore/?...&rd=1#topic=6243095`). The "My item" menus never appear. |
| `https://support.google.com/chrome_webstore?p=contact`                | Chose "Contact us", entered the text "Nominate my extension for a Featured badge", picked the category "Featured badge", then Next step. | Ends with "Based on your answers, our support specialists won't be able to help you fix this problem." and offers no contact options.                   |
| `https://developer.chrome.com/docs/webstore/discovery`                | Read the page.                                                                                                                           | Still links to the One Stop Support URL and calls the nomination option a "trial".                                                                      |
| `https://support.google.com/chrome_webstore/answer/1050673`           | Read the page.                                                                                                                           | Has no nomination steps.                                                                                                                                |

Conclusion: the unreachable form matches the closure announced on 2026-08-20.
Nothing was submitted.

## Old form path (closed)

The path below no longer exists. Step 1 redirects to the Help Center home, so
the later steps cannot be reached. It is kept so the form can be recognised if
it ever returns.

1. Open the One Stop Support form:

   ```text
   https://support.google.com/chrome_webstore/contact/one_stop_support
   ```

2. First menu choice:

   ```text
   My item (extensions, app, or theme)
   ```

3. Second menu choice:

   ```text
   I want to nominate my extension to receive a Featured badge and be eligible for merchandising
   ```

Reported review time (third-party reports, not a Google promise): 2-3 days, up
to a month.

## What to do instead

- Treat the star rating as the quality signal that counts now. Ask for reviews
  from real users in a legitimate way, and never buy or fake them.
- Keep the listing accurate and complete. The audit result below shows it
  matched the dashboard on 2026-10-05.
- Re-read the discovery docs page now and then in case the badge programs
  change:

  ```text
  https://developer.chrome.com/docs/webstore/discovery
  ```

- Do not use unofficial channels or paid "badge" services. Badges cannot be paid
  for.

## Copy-ready answers

Publisher email:

```text
andryoredev@gmail.com
```

Extension ID:

```text
gdhpeilfkeeajillmcncaelnppiakjhn
```

Related domain: No.

Description of functionality, target audience and use cases (997 chars, about
1,000 at most). The opening line is the store description opening from
[`README.md`](README.md); the capabilities match its single-purpose text:

```text
Snug moves your bookmarks between browsers, exactly as you left them — nothing sent anywhere, no account required.

What it does: export your whole bookmark tree or one folder as HTML, JSON, CSV, Markdown, OPML or XBEL. Import HTML, JSON, CSV or XBEL files, a Chrome profile Bookmarks file or Safari bookmarks, with a preview first, then merge, replace or drop everything into a new folder. A safety snapshot lets you undo any replace, a Duplicates page deletes only the copies you pick, and scheduled backups save to your Downloads folder or a folder you choose, with retention and a failure notification.

Who it is for: anyone switching browsers, anyone who wants a safety net before a cleanup, and anyone with a large bookmark library who wants regular local backups.

Use cases: switch browsers, schedule backups, clean up duplicates, undo a mistake.

Everything runs on your device — no account, no cloud, no server, no analytics. The bookmark tree works fully with the keyboard and screen readers, in 10 languages.
```

## Evidence table

One row per form confirmation. Status is `verified` only when the cited source
backs the claim; anything else is `unverified`. Repo paths are relative to the
repository root.

| Confirmation               | Claim                                                                                                                              | Evidence                                                                                                                                                                                                                                                                                                                            | Status     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Published and public       | The listing is live, public, "Snug: Bookmark Export, Import & Backup", v2.0.1.                                                     | Live listing and dashboard (checked 2026-10-05). Intended visibility is Public in [`README.md`](README.md) "Distribution". Version in `apps/extension/package.json`.                                                                                                                                                                | verified   |
| Broad relevance            | Bookmark export, import and backup applies to any Chrome user. The listing has 5,000 users and 20 ratings.                         | Live listing (checked 2026-10-05). Category Tools in [`README.md`](README.md) "Fields shared by all locales".                                                                                                                                                                                                                       | verified   |
| No policy violations       | Single purpose is stated, each permission is justified, remote code is No, no data categories are collected, three certifications. | [`README.md`](README.md) "Single purpose", "Permission justifications" and "Other privacy fields". Dashboard audit 2026-10-05: item status "Published - public", Notifications page empty, no policy alert on the item.                                                                                                             | verified   |
| Manifest V3                | The extension is MV3 with a service worker and an offscreen document.                                                              | `apps/extension/wxt.config.ts` (`offscreen` permission, `minimum_chrome_version` 119) and `apps/extension/AGENTS.md` ("A Chrome MV3 web extension"). Released `snug-2.0.1-chrome.zip` manifest: `manifest_version` 3, service worker `background.js`, `minimum_chrome_version` 119 (checked 2026-10-05).                            | verified   |
| Security                   | No network requests of its own, no remote code, local-only storage, a documented threat model.                                     | [`docs/security.md`](../security.md) "What users can expect"; `apps/extension/lib/favicon.ts` fetches only the extension's own `_favicon` URL; [`README.md`](README.md) "Other privacy fields" (remote code No). No third-party review.                                                                                             | verified   |
| Privacy                    | No data collected or transmitted; permissions explained in a public policy.                                                        | [`PRIVACY_POLICY.md`](../../PRIVACY_POLICY.md) ("Information Collection and Use", "Permissions", "Third-Party Services"); policy URL in [`README.md`](README.md).                                                                                                                                                                   | verified   |
| Performance                | Large libraries are handled well.                                                                                                  | No benchmark or profiling result in the repo. `unlimitedStorage` is requested for large safety snapshots ([`docs/security.md`](../security.md)), which shows intent, not measured speed.                                                                                                                                            | unverified |
| UX                         | Keyboard and screen reader operable, ten languages, previewed imports and undoable replaces.                                       | [`docs/development.md`](../development.md) "Accessibility" (jsx-a11y lint, keyboard rule); ten files in `apps/extension/locales/`; listing text in [`README.md`](README.md). No manual screen reader pass is recorded.                                                                                                              | unverified |
| Clear and accurate listing | Title, summary, description, screenshots, tiles and promo videos exist for all ten locales, and match the product.                 | [`README.md`](README.md) "Store listing" and "Graphic assets"; [`screenshots.md`](screenshots.md); [`listings/`](listings/). Live listing shows English plus 9 other locales and a YouTube promo video per locale (checked 2026-10-05). Dashboard audit 2026-10-05 matched every locale tab to its source file (see the checklist). | verified   |

## Dashboard audit checklist

Derived from the [`README.md`](README.md) sections "Store listing", "Graphic
assets", "Privacy" and "Distribution". Tick each box only after checking the
live dashboard or listing. Audited on 2026-10-05 against the dashboard.

### Store listing, per locale

For each locale: the detailed description matches the source file (`README.md`
for `en` and `es`, `listings/<code>.md` for the rest), the package-sourced title
and summary match `extensionManifestName` and `extensionDescription` in
`locales/<code>.json`, the category is Tools, and the homepage and support URLs
point to `AndryOre/snug`.

- [x] `en`
- [x] `es`
- [x] `pt_BR`
- [x] `fr`
- [x] `de`
- [x] `ja`
- [x] `zh_CN`
- [x] `ru`
- [x] `it`
- [x] `ko`

### Graphic assets, per locale

For each locale: five 1280x800 screenshots from `assets/screenshots/<code>/`
(the global set is the `en` copy), the localized promo video URL from the table
in [`README.md`](README.md), and no screenshot of the old product left.

- [x] `en`
- [x] `es`
- [x] `pt_BR`
- [x] `fr`
- [x] `de`
- [x] `ja`
- [x] `zh_CN`
- [x] `ru`
- [x] `it`
- [x] `ko`

Shared assets, once:

- [x] Store icon 128x128 (`assets/store-icon-128.png`)
- [x] Small promo tile 440x280 (`assets/small-tile-440x280.png`)
- [x] Marquee tile 1400x560 (`assets/marquee-1400x560.png`)

### Privacy

- [x] Single purpose text matches [`README.md`](README.md) "Single purpose".
- [x] One justification per permission in `apps/extension/wxt.config.ts`:
      `bookmarks`, `favicon`, `storage`, `alarms`, `downloads`, `offscreen`,
      `unlimitedStorage`, `notifications`.
- [x] Remote code is No.
- [x] No data usage categories are checked.
- [x] All three certifications are ticked.
- [x] Privacy policy URL is
      `https://github.com/AndryOre/snug/blob/main/PRIVACY_POLICY.md` and opens.

### Distribution

- [x] Payments: free of charge.
- [x] Visibility: Public.
- [x] Regions: all regions, including all unlisted regions.

### Audit result, 2026-10-05

Checked in the Developer Dashboard with the `cws-dash` browser. Store listing:
for all ten locales the description length equals the source file (`en` 1333,
`es` 1509, `de` 1641, `fr` 1678, `it` 1502, `ja` 692, `ko` 719, `pt_BR` 1484,
`ru` 1408, `zh_CN` 489), the package-sourced title and summary read as in the
source listings, the category is Tools, and both URLs point to `AndryOre/snug`.
Graphic assets: each locale has five localized screenshots plus five global
ones, the localized promo video URL equals the table in
[`README.md`](README.md), and the icon and both tiles are present. Privacy: the
single purpose and all eight justifications match their lengths in
[`README.md`](README.md), remote code is No, no data category is checked, the
three certifications are ticked and the policy URL matches. Distribution: free,
public, all regions.

Limits of this audit: the screenshot images were counted for every locale, but
only the first global English slide was opened and confirmed to show Snug. The
other slides were not inspected one by one. The Performance and UX evidence rows
stay `unverified`.
