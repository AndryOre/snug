# 16. Keep the latest five Safety snapshots

## Status

Accepted. Amends [ADR 0008](0008-safety-snapshot-in-extension-storage.md): its
"only the latest snapshot is kept" clause no longer holds. The rest of 0008 (a
file in Downloads plus a copy in `chrome.storage.local` under
`unlimitedStorage`) still stands.

## Context

With one slot, a second Restore-replace, or a restore from Settings (which takes
a snapshot first), overwrites the only copy the user had. People with years of
saved links asked for more than one dated way back.

## Decision

Snug keeps the latest five snapshots in `chrome.storage.local`, newest first,
and the oldest beyond five is dropped. The newest snapshot that holds any
bookmarks is never dropped, even when five newer empty ones exist, so a run of
empty captures cannot erase the last good copy. The user can also take a
snapshot at any time from Settings and download or restore any of the five. The
stored value migrates from a single snapshot to a list.

### Considered options

- **Unlimited snapshots** — no data loss from retention, but storage grows
  without bound on large libraries and the list becomes a chore to manage.
- **User-configurable count** — more flexibility, but another setting to explain
  and test. Five is easy to raise later.
- **Dated files only** — Snug cannot read Downloads back, so Undo and restore
  would not work.

## Consequences

- Storage use is up to five times a single snapshot; `unlimitedStorage` already
  covers it and no new permission is needed.
- The privacy policy, security doc and store justifications say "latest five",
  and still say snapshots never leave the device.
