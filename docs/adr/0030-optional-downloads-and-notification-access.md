# 0030: Downloads and Notification access become optional permissions

## Status

Accepted. Amends [0008](0008-safety-snapshot-in-extension-storage.md),
[0016](0016-keep-five-safety-snapshots.md) and
[0020](0020-custom-folder-via-file-system-access.md).

Date: 2026-11-03

Revised: 2026-11-03, Notification access is also requested together with
Downloads access when enabling Auto-export.

## Context

Adding `downloads` and `notifications` in 2.0.1 made Chrome and Edge disable the
extension on update until each user re-approved the new warnings, and every
future update or fresh install would show them again. Both permissions serve
only Auto-export (saving to the Downloads folder, Retention and the Failure
notification); the rest of Snug works without them. Safety snapshots also used
`downloads`, although a normal download link from an extension page saves a file
without it, as manual export already does.

## Decision

`downloads` and `notifications` move from `permissions` to
`optional_permissions` in the manifest for Chrome and Edge. A build flag used
only by end-to-end tests keeps them required so Playwright never meets the
prompt. Snug asks for them in a user gesture, at the moment they are needed:

- **Downloads access** when the user enables Auto-export with the Downloads
  destination, switches the destination to Downloads or runs Export now without
  it.
- **Notification access** together with Downloads access when the user enables
  Auto-export to Downloads while the Failure notification is on (its default),
  and on its own when the user turns the Failure notification switch on or
  allows it from the alert.

When the user denies a request the change is not saved and the page says why.
Without Downloads access an Auto-export run to Downloads fails with a specific
reason, a badge and no notification, and Retention leaves Downloads files alone
and retries on the next run. Without Notification access the Failure
notification is skipped silently and the click listener is attached only once
the access exists. The Auto-export page and the popup show when Downloads access
is missing, with an Allow button, as they do for Folder access.

The Safety snapshot file is saved with an `<a download>` link from the page
context, never through the downloads API, and a failed or declined file save
does not block Replace. The copy in extension storage is unchanged.

### Considered options

- **Keep both required** — simplest, but repeats the warning on every install
  and update.
- **Drop the Downloads destination** — removes the permission entirely, but
  breaks Auto-export for everyone who has no Custom folder.
- **Request at install** — the same warning, with no gain.

## Consequences

- Install and update show no new warnings for these two permissions.
- Every use of the downloads and notifications APIs goes through one typed
  access helper or is guarded.
- Whether existing users keep a permission that moved to optional is checked by
  an update test: pending manual verification. The design works either way: a
  user who loses it sees the needed-access state and allows it again.
- The store permission justifications, the security notes and the privacy policy
  say both permissions are optional and when they are requested.
- Safety snapshot files depend on the browser's download behavior (a Save as
  prompt can appear) instead of the downloads API.
