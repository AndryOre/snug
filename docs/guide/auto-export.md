# Auto-export

Snug can export your bookmarks on a schedule, without any manual action:

1. Open the app's **Auto-export** page.
2. Enable automatic export, choose one or more of the six formats, an interval,
   and an optional folder path for the exported files. Intervals are hourly,
   every 12 hours, daily, every 3 days, or weekly. Daily, every-3-days and
   weekly runs happen at a preferred time; weekly runs also let you pick the
   day. Hourly and 12-hour runs ignore the time.
3. From then on, the extension exports your bookmarks on that schedule and saves
   the files straight to your Downloads folder — no save dialog, no extra
   prompts. If the browser was closed or the extension was unavailable when a
   scheduled export was due, it catches up automatically shortly after the
   browser next starts, instead of waiting for the next scheduled time.

**Keep the last N runs** (Retention, default 10) limits how many exports pile
up: after each successful run, Snug deletes the files of its own oldest runs
beyond N (every format of a kept run stays) and their entries in the browser's
download history. It only ever removes files Snug itself saved, never other
files in the folder, and a file you already deleted or moved is simply skipped.
A failed run deletes nothing. Set it to 0 to keep everything.

**Notify me when an export fails** (on by default) shows a system notification,
titled "Snug · Auto-export failed" with the reason, when a run fails. Clicking
it opens the Auto-export page. Successful runs never notify, and repeated
failures replace the previous notification instead of stacking. A failed
scheduled or catch-up run also puts a "!" badge on the toolbar icon until a run
succeeds.

Changes on the **Auto-export** page are saved automatically. Its status card
always shows the real schedule state, independently of any unsaved changes below
it:

- **Last run** — when auto-export last ran, with its outcome and, on failure,
  the stored error message. The popup also shows the next run, or a failure
  notice, on its auto-export status row.
- **Next run** — when it's next due, or "Auto-export is off" if automatic export
  is currently disabled.

**Export now** runs an export immediately using whatever formats and path are
currently on screen, even if the Enable switch is off. It shows a spinner while
running and a brief success or error message once it settles; the status card's
"Last run" row updates to match. Running it never changes your automatic
schedule or its next due time.
