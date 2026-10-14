# FAQ

Short answers to the questions people ask most about Snug.

## Can I import several files at once?

Yes. Pick or drop several files on the Import page or in the toolbar popup and
Snug imports them in one go.

## Why does it need access to all my bookmarks?

Reading and writing them is the only way an extension can export and import
them. Snug makes no network calls, so nothing it reads can leave your device.

## Which formats does it handle?

Export as HTML, JSON, CSV, Markdown, OPML or XBEL. Import HTML, JSON, CSV or
XBEL, a Chrome profile "Bookmarks" file, or a Safari export.

## Which browsers does it work in?

Chrome and other Chromium browsers such as Edge, Brave and Opera.

## Is it safe to install a solo developer's extension?

The source is public, CodeQL scans it, the project has OpenSSF Scorecard and
Best Practices badges, and CI runs pinned. Judge it yourself on the public
repository.

## Can backups go to a folder other than Downloads?

Yes. On the [Auto-export](auto-export.md) page, choose a Custom folder. After a
restart, Chrome asks once to confirm access to it; choose "Allow on every visit"
so unattended runs keep working. If access is missing, Snug warns you and the
run fails instead of saving somewhere else.
