# Importing bookmarks

1. Quick import, from the popup:
   - Optionally change the default import mode (see [**Settings**](settings.md))
     — it starts on **Restore — merge**.
   - Click "Choose files…" and select one or more bookmarks files (see **Import
     sources** below), or drop them on the popup's Import section. A "Drop files
     to import" overlay appears while you drag. Files dropped while an import is
     running are ignored.
   - The extension automatically detects each format and imports the bookmarks
     immediately using the default import mode. A CSV file — or any other file
     with no Bookmarks Bar/Other Bookmarks data — always imports into a new
     "Imported Bookmarks" folder instead, regardless of the default mode.
   - Several files are imported together as one **Import batch** (see below). A
     file Snug cannot read is left out. The warning lists up to three skipped
     files as `name: reason`, then "and N more".
   - If the default mode is **Restore — replace**, the popup shows only an
     inline warning that your existing bookmarks will be replaced. Picking a
     file then opens the app's **Import** page, where you review the replace and
     confirm it (a Safety snapshot is saved first, so you can undo it). Very
     large imports open the **Import** page too.
2. Preview first, from the app's **Import** page:
   - Drop or select one or more bookmarks files. Each file gets a row with its
     detected format and bookmark count, or the reason it cannot be read. You
     can remove a file or use **Add files** to add more.
   - An itemized preview shows the bookmarks tree as it would be imported.
     Bookmarks Skip duplicates would leave out carry a `Duplicate · skipped`
     badge, so you can judge the file before anything changes.
   - Choose an import mode (pre-selected from your default):
     - **Create folder**: adds every bookmark to a new "Imported Bookmarks"
       folder. Available for any file, including CSV (which has no folder
       structure to restore).
     - **Restore — merge**: places bookmarks in their original locations
       alongside your existing ones. Only available for JSON/HTML files that
       carry location data.
     - **Restore — replace**: clears your current Bookmarks Bar and Other
       Bookmarks first, then restores bookmarks to their original locations.
       Only available for files that carry location data, and for one file at a
       time.
   - Selecting "Restore — replace" shows how many bookmarks the replace will
     remove and add, lists the bookmarks that will be deleted, and requires
     confirming a warning dialog before the import runs.
   - **Skip duplicates** (on by default) leaves out any bookmark whose URL
     already exists in your browser, and tells you how many of the selected
     bookmarks it will skip. It applies to Create folder and Restore — merge,
     not to Restore — replace. The switch is shared with Quick import.

## Import selection

In Create folder and Restore — merge, the preview tree has checkboxes. Check
single bookmarks, whole folders, or a mix, and Snug imports only the **Import
selection**. Restore — replace has no selection: it always imports everything.

## Import batch

Several files imported at once run as one **Import batch**: one import mode, one
preview and one progress. Snug checks for existing URLs once, so Skip duplicates
also leaves out a bookmark that appears in two of the files.

- In Create folder with two or more files, each file goes into its own folder
  named after the file (without its extension). A single file keeps the
  "Imported Bookmarks" folder, and CSV files always use it.
- Restore — replace needs exactly one file. With two or more files it is
  disabled, because the second file would erase the first.
- A file that cannot be read is left out at preview time and listed in the
  result.
- Cancel, or a failure part-way through, puts your bookmarks back as they were
  before the batch started.

## Import sources

Snug detects the format from the file's MIME type, then its extension, then its
content. It reads:

- Snug and browser exports: HTML (Netscape bookmarks file), JSON, CSV, and XBEL.
- A Chrome profile `Bookmarks` file (the raw JSON file inside a Chrome profile
  folder). Its folders land in their original locations.
- A Safari export (HTML). Favorites becomes the Bookmarks Bar; Reading List and
  the other Safari folders stay in Other Bookmarks, with Reading List in its own
  folder.

## The Safety snapshot and Undo

Before every Restore — replace, Snug saves a **Safety snapshot** of your
Bookmarks Bar and Other Bookmarks: a JSON file in your Downloads folder
(`snug-safety-snapshot-<date>.json`), plus a copy kept inside the extension. The
replace confirmation tells you this and links to the Safety snapshot card in
Settings. If the snapshot can't be saved, nothing is deleted.

- After a replace, **Undo import** on the result restores the snapshot.
- In **Settings**, the Safety snapshot card lists the latest five snapshots. You
  can restore or download any of them, after confirming, and take a new one at
  any time.

Snug keeps the latest five snapshots, so a sixth replaces the oldest, except
that the newest snapshot holding any bookmarks is never dropped. Restoring a
snapshot is itself a replace, so Snug saves a new snapshot of your current
bookmarks first. Everything stays on your device and Snug makes no network
requests.
