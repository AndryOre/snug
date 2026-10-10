# Auto-export

Snug can export your bookmarks on a schedule, without any manual action:

1. Open the app's **Auto-export** page.
2. Enable automatic export, choose one or more of the six formats, a place to
   save them (Downloads or a Custom folder), an interval, and an optional
   subfolder path for the exported files. Intervals are hourly, every 12 hours,
   daily, every 3 days, or weekly. Daily, every-3-days and weekly runs happen at
   a preferred time; weekly runs also let you pick the day. Hourly and 12-hour
   runs ignore the time.
3. From then on, the extension exports your bookmarks on that schedule and saves
   the files straight to the place you chose, Downloads by default — no save
   dialog, no extra prompts. If the browser was closed or the extension was
   unavailable when a scheduled export was due, it catches up automatically
   shortly after the browser next starts, instead of waiting for the next
   scheduled time.

**Save to** sets the destination. **Downloads** (the default) saves into your
browser's Downloads folder. **Custom folder** saves into a folder you pick
anywhere on your computer: select **Choose folder…**, and later **Change
folder** to pick another one. Select **Downloads** again at any time to switch
back. The subfolder path is relative to the destination, so it names a folder
inside the folder you chose. If a file with the same name already exists, Snug
adds a " (1)" suffix and never overwrites it.

After the first browser restart, Chrome asks once to confirm access to the
Custom folder. Choose "Allow on every visit" so unattended runs keep working.

If access to the folder is missing, Snug warns you when the browser starts. The
popup and the **Auto-export** page then show "Folder access needed" with an
**Allow access** button. Until you allow access, runs fail and nothing is saved
to Downloads instead.

**Keep the last N runs** (Retention, default 10) limits how many exports pile
up: after each successful run, Snug keeps the newest N runs across Downloads and
the Custom folder and deletes the files of its own older runs (every format of a
kept run stays). Files saved to Downloads also lose their entries in the
browser's download history. It only ever removes files Snug itself saved, never
other files in the folder, and a file you already deleted or moved is simply
skipped. After you change the folder, files in the old folder are left alone. A
failed run deletes nothing. Set it to 0 to keep everything.

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
