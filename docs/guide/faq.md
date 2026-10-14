# FAQ

Short answers to the questions people ask most about Snug.

## Does Snug send my bookmarks anywhere?

No. Snug makes no network calls. It reads and writes your browser's bookmarks on
your device, and the source code is public so you can check.

## Do I need an account?

No. Install it and start exporting.

## Does it sync my bookmarks between devices?

No. Snug has no sync and no cloud. To move bookmarks to another browser or
computer, export a file and import it there.

## Can I import several files at once?

Yes. Pick or drop several files on the Import page or in the toolbar popup and
Snug imports them in one go.

## Why does it need access to all my bookmarks?

Reading and writing them is the only way an extension can export and import
them. Snug makes no network calls, so nothing it reads can leave your device.

## My browser already exports HTML. Why use Snug?

The built-in export has no folder selection, preview, undo, schedule, duplicate
check or extra formats. Snug has all of them.

## Will it overwrite my current bookmarks?

Only if you choose Replace. You see a preview first, and Replace saves a Safety
snapshot you can restore.

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

## Does Snug cost anything?

No. It is free.
