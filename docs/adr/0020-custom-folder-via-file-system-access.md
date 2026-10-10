# 20. Save Auto-export to a Custom folder with the File System Access API

## Status

Accepted. Extends Auto-export;
[ADR 0008](0008-safety-snapshot-in-extension-storage.md) and
[ADR 0016](0016-keep-five-safety-snapshots.md) are unchanged: Safety snapshots
still go to Downloads.

## Context

Auto-export saves with `chrome.downloads`, which can only write inside the
browser's Downloads folder. Users who keep backups elsewhere had to change
Chrome's global download folder, which affects every other download. A spike in
desktop Chrome showed that a directory handle stored in IndexedDB keeps
read-write permission across a browser restart once the user picks "Allow on
every visit", and that the service worker can then write without a gesture. The
first pick is session-only, and reloading the extension does not bring back the
persistent prompt.

## Decision

The user picks a Custom folder with `showDirectoryPicker`. Snug stores the
handle in IndexedDB and writes from the service worker. When Folder access is
missing at run time, the run fails with the Failure notification and a badge;
Snug never falls back to Downloads. The one-time confirmation after the first
restart is accepted, and Snug warns about it on browser start, in the popup and
on the Auto-export page. Retention keeps one history across both Export
destinations and never deletes files in a folder that is no longer the Custom
folder.

### Considered options

- **Native messaging host** — writes anywhere without prompts, but needs a
  separate install on every platform.
- **Silent fallback to Downloads** — runs never fail, but files end up where the
  user does not expect them.
- **Offscreen document as the writer** — works too, but adds a hop with no
  benefit once the service worker can write.

## Consequences

- No new manifest permission.
- Every user is asked once to confirm Folder access after the first restart.
- Retention gains a second deletion path (`removeEntry`) next to
  `downloads.removeFile`.
- The handle cannot be stored in `chrome.storage`, so IndexedDB is now used.
- The privacy policy still holds: files stay on the device.
