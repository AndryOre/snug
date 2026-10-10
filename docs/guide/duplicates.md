# Finding duplicates

The **Duplicates** page scans your bookmarks for **Duplicates**: bookmarks whose
URLs match once normalized. The scheme and host are lowercased, `http` and
`https` count as the same, and a leading `www.`, a trailing slash and any
`#fragment` are ignored. Folders are never duplicates.

1. Open **Duplicates**. Each group shows its copies, oldest first.
2. By default Snug keeps the oldest copy and marks the rest **Delete**. Choose
   **Keep** on a different copy to change which one stays.
3. Click the delete button and confirm. Only the copies marked Delete are
   removed; this cannot be undone, and no Safety snapshot is taken.

**Scan again** refreshes the list. If nothing matches, the page says there are
no duplicates.
