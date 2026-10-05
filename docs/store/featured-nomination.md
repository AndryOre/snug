# Featured badge nomination pack

Everything needed to nominate Snug for the Chrome Web Store Featured badge:
where the form lives, copy-ready answers, the evidence behind each form
confirmation, and a dashboard audit checklist. Nothing here has been submitted.
A human fills the form and clicks Submit.

> Paths to extension code (`lib/`, `entrypoints/`, `locales/`, `e2e/`) are
> relative to `apps/extension/`.

The Featured badge is editorial and cannot be paid for. It is requested through
One Stop Support, not the Developer Dashboard. Listing facts below come from the
live listing as checked on 2026-10-05.

## Form path

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

Expected review time: 2-3 days, and up to a month.

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

Description of functionality, target audience and use cases (977 chars, about
1,000 at most). The opening line is the store description opening from
[`README.md`](README.md); the capabilities match its single-purpose text:

```text
Snug moves your bookmarks between browsers, exactly as you left them — nothing sent anywhere, no account required.

What it does: export your whole bookmark tree or one folder as HTML, JSON, CSV, Markdown, OPML or XBEL. Import those formats, a Chrome profile Bookmarks file or Safari bookmarks, with a preview first, then merge, replace or drop everything into a new folder. A safety snapshot lets you undo any replace, a Duplicates page deletes only the copies you pick, and scheduled backups save to your Downloads folder with retention and a failure notification.

Who it is for: anyone switching browsers, anyone who wants a safety net before a cleanup, and anyone with a large bookmark library who wants regular local backups.

Use cases: move to a new browser, back up on a schedule, clean up duplicates, restore after a mistake.

Everything runs on your device — no account, no cloud, no server, no analytics. Works with the keyboard and screen readers, in 10 languages.
```

## Evidence table

One row per form confirmation. Status is `verified` only when the cited source
backs the claim; anything else is `unverified`. Repo paths are relative to the
repository root.

| Confirmation               | Claim                                                                                                                              | Evidence                                                                                                                                                                                                                                                                                                        | Status     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Published and public       | The listing is live, public, "Snug: Bookmark Export, Import & Backup", v2.0.1.                                                     | Live listing and dashboard (checked 2026-10-05). Intended visibility is Public in [`README.md`](README.md) "Distribution". Version in `apps/extension/package.json`.                                                                                                                                            | verified   |
| Broad relevance            | Bookmark export, import and backup applies to any Chrome user. The listing has 5,000 users and 20 ratings.                         | Live listing (checked 2026-10-05). Category Tools in [`README.md`](README.md) "Fields shared by all locales".                                                                                                                                                                                                   | verified   |
| No policy violations       | Single purpose is stated, each permission is justified, remote code is No, no data categories are collected, three certifications. | [`README.md`](README.md) "Single purpose", "Permission justifications" and "Other privacy fields". No Chrome Web Store policy warning or violation notice has been checked.                                                                                                                                     | unverified |
| Manifest V3                | The extension is MV3 with a service worker and an offscreen document.                                                              | `apps/extension/wxt.config.ts` (`offscreen` permission, `minimum_chrome_version` 119) and `apps/extension/AGENTS.md` ("A Chrome MV3 web extension"). The built manifest was not inspected.                                                                                                                      | unverified |
| Security                   | No network requests of its own, no remote code, local-only storage, a documented threat model.                                     | [`docs/security.md`](../security.md) "What users can expect"; `apps/extension/lib/favicon.ts` fetches only the extension's own `_favicon` URL; [`README.md`](README.md) "Other privacy fields" (remote code No). No third-party review.                                                                         | verified   |
| Privacy                    | No data collected or transmitted; permissions explained in a public policy.                                                        | [`PRIVACY_POLICY.md`](../../PRIVACY_POLICY.md) ("Information Collection and Use", "Permissions", "Third-Party Services"); policy URL in [`README.md`](README.md).                                                                                                                                               | verified   |
| Performance                | Large libraries are handled well.                                                                                                  | No benchmark or profiling result in the repo. `unlimitedStorage` is requested for large safety snapshots ([`docs/security.md`](../security.md)), which shows intent, not measured speed.                                                                                                                        | unverified |
| UX                         | Keyboard and screen reader operable, ten languages, previewed imports and undoable replaces.                                       | [`docs/development.md`](../development.md) "Accessibility" (jsx-a11y lint, keyboard rule); ten files in `apps/extension/locales/`; listing text in [`README.md`](README.md). No manual screen reader pass is recorded.                                                                                          | unverified |
| Clear and accurate listing | Title, summary, description, screenshots, tiles and promo videos exist for all ten locales, and match the product.                 | [`README.md`](README.md) "Store listing" and "Graphic assets"; [`screenshots.md`](screenshots.md); [`listings/`](listings/). Live listing shows English plus 9 other locales and a YouTube promo video per locale (checked 2026-10-05). Per-locale accuracy against the dashboard is the audit checklist below. | verified   |

## Dashboard audit checklist

Derived from the [`README.md`](README.md) sections "Store listing", "Graphic
assets", "Privacy" and "Distribution". Tick each box only after checking the
live dashboard or listing.

### Store listing, per locale

For each locale: the detailed description matches the source file (`README.md`
for `en` and `es`, `listings/<code>.md` for the rest), the package-sourced title
and summary match `extensionManifestName` and `extensionDescription` in
`locales/<code>.json`, the category is Tools, and the homepage and support URLs
point to `AndryOre/snug`.

- [ ] `en`
- [ ] `es`
- [ ] `pt_BR`
- [ ] `fr`
- [ ] `de`
- [ ] `ja`
- [ ] `zh_CN`
- [ ] `ru`
- [ ] `it`
- [ ] `ko`

### Graphic assets, per locale

For each locale: five 1280x800 screenshots from `assets/screenshots/<code>/`
(the global set is the `en` copy), the localized promo video URL from the table
in [`README.md`](README.md), and no screenshot of the old product left.

- [ ] `en`
- [ ] `es`
- [ ] `pt_BR`
- [ ] `fr`
- [ ] `de`
- [ ] `ja`
- [ ] `zh_CN`
- [ ] `ru`
- [ ] `it`
- [ ] `ko`

Shared assets, once:

- [ ] Store icon 128x128 (`assets/store-icon-128.png`)
- [ ] Small promo tile 440x280 (`assets/small-tile-440x280.png`)
- [ ] Marquee tile 1400x560 (`assets/marquee-1400x560.png`)

### Privacy

- [ ] Single purpose text matches [`README.md`](README.md) "Single purpose".
- [ ] One justification per permission in `apps/extension/wxt.config.ts`:
      `bookmarks`, `favicon`, `storage`, `alarms`, `downloads`, `offscreen`,
      `unlimitedStorage`, `notifications`.
- [ ] Remote code is No.
- [ ] No data usage categories are checked.
- [ ] All three certifications are ticked.
- [ ] Privacy policy URL is
      `https://github.com/AndryOre/snug/blob/main/PRIVACY_POLICY.md` and opens.

### Distribution

- [ ] Payments: free of charge.
- [ ] Visibility: Public.
- [ ] Regions: all regions, including all unlisted regions.
