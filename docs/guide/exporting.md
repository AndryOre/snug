# Exporting bookmarks

1. Quick export: in the popup, pick a format and click "Export all" to export
   your whole bookmark tree.
2. For control over what is exported, open the app's **Export** page:
   - Use the search box to find specific bookmarks.
   - Check individual bookmarks or whole folders (or use "Select all").
   - Adjust the **Export options** panel (favicons, dates, hiding folders,
     filename template).
   - Choose the export format and click "Export N bookmarks".

## Export formats

Snug exports six formats:

| Format   | Extension | Good for                                                    |
| -------- | --------- | ----------------------------------------------------------- |
| HTML     | `.html`   | Importing into any browser (Netscape bookmarks file).       |
| JSON     | `.json`   | Restoring into Snug with folders and root locations intact. |
| CSV      | `.csv`    | Spreadsheets; one row per bookmark with a `folder` column.  |
| Markdown | `.md`     | Notes and wikis; folders become headings and lists.         |
| OPML     | `.opml`   | Feed readers and outliners.                                 |
| XBEL     | `.xbel`   | Other bookmark managers that read the XML bookmark format.  |

Markdown and OPML are export-only: Snug cannot import them back.

## Progress and Cancel

A long export or import shows a progress card with a running count. Click
**Cancel** to stop. A canceled export downloads no file. A canceled import
removes the bookmarks it had already added, and a canceled Restore — replace
puts your previous bookmarks back from the Safety snapshot. Cancel on an Import
batch puts your bookmarks back as they were before the batch started.

## Naming exported files

By default, exported files are named `Bookmarks_<date>_<time>` (for example
`Bookmarks_2026-10-03_14-05-09`). To customize this:

1. Open the app's **Export** page (the same panel appears on **Auto-export**).
2. In **Export options**, edit "Filename template". A live preview shows the
   resulting filename as you type.
3. Use these placeholders (case-insensitive) to include the current date and
   time:

   | Placeholder | Value    |
   | ----------- | -------- |
   | `%yyyy`     | Year (4) |
   | `%yy`       | Year (2) |
   | `%mm`       | Month    |
   | `%dd`       | Day      |
   | `%hh`       | Hour     |
   | `%min`      | Minute   |
   | `%sec`      | Second   |

   For example, `%yyyy%mm%dd myPc` produces `20260930 myPc.html` (and the
   matching extension for the other formats).

The template applies everywhere a filename is generated: basic export from the
popup, the Export page, and Auto-export. Characters not allowed in filenames
(`/ \ : * ? " < > |`) are replaced with `_`, and a template that ends up empty
falls back to "Bookmarks".
