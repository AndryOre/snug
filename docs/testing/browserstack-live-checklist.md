# BrowserStack Live checklist

Pre-release manual QA on [BrowserStack Live](https://live.browserstack.com).
Live is the only BrowserStack coverage of the extension: it is not automated
(see
[Extension on BrowserStack: manual-only](../development.md#extension-on-browserstack-manual-only)),
and Automate and Percy only exercise the site. Run this list before tagging a
release (step 7 of [How to cut a release](../how-to/cut-a-release.md)).

The sponsored plan includes unlimited Live sessions until 2027-10-10. App Live
is not part of the plan, so everything here uses desktop Live and the browsers'
own extension stores or a sideloaded build.

## Before you start

- Build the release candidate with `bun run zip` and keep the
  `apps/extension/.output/snug-X.Y.Z-chrome.zip` and `...-edge.zip` archives
  handy, or install the candidate from the store listing if it is already
  published.
- Prepare a small bookmark set to import: a few folders, nested folders and a
  duplicate URL. A file exported by the previous release works well.
- Record the extension version and the date in the run notes at the end.

## Site

Open the deployed site (or the preview you are about to release) in each session
and check the landing page, the `/de/` landing page, the guide and the 404 page.

| Platform              | Browser | Live product         |
| --------------------- | ------- | -------------------- |
| iPhone (current iOS)  | Safari  | Desktop Live, mobile |
| Android phone (Pixel) | Chrome  | Desktop Live, mobile |
| Android phone (Pixel) | Firefox | Desktop Live, mobile |

For each session:

- [ ] Page loads with no layout overflow at the device width.
- [ ] Light and dark color schemes both render correctly (toggle the device
      appearance).
- [ ] Navigation, language switch and the install buttons work with touch.
- [ ] Showcase and count-up sections animate and settle without jank.
- [ ] Guide pages and the 404 page render and link back to the landing page.

## Extension

Run the full pass on each of these desktop browsers:

| OS    | Browser | Install from                              |
| ----- | ------- | ----------------------------------------- |
| macOS | Chrome  | Chrome Web Store listing or unpacked zip  |
| macOS | Edge    | Edge Add-ons listing or unpacked zip      |
| macOS | Opera   | Chrome Web Store through the Opera add-on |

Brave: only if Live lists it. Check the browser list in a Live session on macOS
before the release and note the result in the run notes. As of this document's
last edit it has not been verified against the Live catalogue, so Brave counts
as manual-only on a local machine until a Live session confirms it.

For each browser:

- [ ] Install: the extension installs, the toolbar icon appears and the welcome
      or first-run state loads without console errors.
- [ ] Popup: click the icon, the popup opens, shows the bookmark count and the
      export controls, and "Open app" opens the full-page app.
- [ ] Export: export in each of the six formats from the popup and from the app;
      the files download and open with the expected structure.
- [ ] Import: import the prepared file in the app; folders, nesting and the
      duplicate are reported as expected and the bookmarks appear in the
      browser.
- [ ] Auto-export: enable it with Downloads as the destination and the hourly
      interval, wait for a run or trigger it, and confirm the file appears with
      no save dialog. Retention and the " (1)" suffix behave as described in the
      [auto-export guide](../guide/auto-export.md).
- [ ] Custom folder: if the Live session allows choosing a folder, select one
      and confirm a run saves there; otherwise note it as not testable on Live.
- [ ] Theme and locale: switch the theme and one non-English locale; the popup
      and the app follow.

## Run notes

Copy this block into the release PR description.

```text
Extension version:
Date:
Site: iOS Safari / Android Chrome / Android Firefox -> pass | issues
Extension: Chrome macOS / Edge macOS / Opera macOS -> pass | issues
Brave on Live: available | not available | not checked
Issues filed:
```
