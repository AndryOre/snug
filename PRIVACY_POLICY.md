# Privacy Policy for Snug

Last updated: October 10, 2026

## Introduction

Snug is committed to protecting your privacy. This Privacy Policy explains our
practices regarding the collection, use, and disclosure of information that we
receive through our browser extension.

## Information Collection and Use

Snug does not collect, store, or transmit any personal information about its
users. Our extension operates entirely within your browser and does not send any
data to external servers.

### Bookmarks Data

- The extension accesses your browser bookmarks solely for the purpose of
  exporting them to HTML, JSON, CSV, Markdown, OPML, or XBEL files, or importing
  bookmarks from HTML, JSON, CSV, or XBEL files, a Chrome profile `Bookmarks`
  file, or a Safari export. The Duplicates page also reads your bookmarks to
  find copies of the same address, and deletes them only when you confirm.
- This access occurs only when you explicitly initiate an import or export
  operation, or when a scheduled automatic export you configured runs (see
  "Automatic Export" below).
- Your bookmark data is processed locally on your device and is not transmitted
  to us or any third parties.

### Favicons

- To display site icons next to your bookmarks, the extension reads favicons
  through the browser's built-in `_favicon` API. This looks up favicons already
  cached by your browser and does not make any network request to us or to the
  bookmarked sites.

### Automatic Export

- You can optionally enable scheduled automatic export of your bookmarks. When
  enabled, the extension exports your bookmarks on the interval you configure
  and saves the resulting files without showing a save-location prompt. By
  default they go directly to your device's Downloads folder using the browser's
  download functionality. If you choose a Custom folder, they are written into a
  folder you picked on your computer through the browser's File System Access
  API instead.
- This only happens if you explicitly enable automatic export and configure a
  schedule; it is disabled by default.
- Retention: after each successful automatic export, Snug deletes its own oldest
  exported files beyond the number you set (10 by default; 0 keeps everything).
  It only removes files it saved itself, in the Downloads folder or in your
  Custom folder, and never touches other files.
- Custom folder: the folder you pick is remembered on your device so automatic
  exports can keep writing to it. The browser may ask you to confirm access to
  it again. Files are never sent to any server, and choosing a folder does not
  require any additional permission.
- Notifications: if an automatic export fails, Snug shows a system notification
  on your device with the reason. You can turn this off on the Auto-export page.
  Successful exports never notify, and no notification content leaves your
  device.

## Data Storage

- Snug does not store any user data, including bookmarks, on external servers.
- Any files created during export (manual or automatic) are saved directly to
  your local device: to your Downloads folder through your browser's download
  functionality, or, for automatic exports, to the Custom folder you chose
  through the browser's File System Access API. Manual exports use a standard
  `<a download>` link and do not need the `downloads` permission; automatic
  exports and the safety snapshot file use the `downloads` permission.
- The extension stores your local preferences and settings — such as theme,
  display options, export options, the filename template, and your automatic
  export configuration — using the browser's local storage (`storage.local`).
  This data stays on your device and is never transmitted anywhere.
- If you choose a Custom folder for automatic exports, Snug keeps the browser's
  reference to that folder (a folder handle, not your bookmarks or the folder's
  contents) in the extension's local browser storage (IndexedDB). It stays on
  your device and is never transmitted anywhere.
- Snug may show a one-time, dismissible card in the popup inviting you to review
  the extension on the store it was installed from (Chrome Web Store or
  Microsoft Edge Add-ons) after your first successful export. To show it only
  once, Snug stores two local timestamps in `storage.local`: when the card
  became available and when you dismissed it. They contain no bookmark content,
  no personal information and no identifier, and are never transmitted anywhere.
  The card is only a link: opening the store page is your choice, and Snug
  itself makes no network request for it.
- Before every "Restore — replace" import, and whenever you choose to take one
  in Settings, Snug saves a safety snapshot of your bookmarks bar and other
  bookmarks so the import can be undone. This stores your bookmark content
  (titles, addresses and folder structure) locally in the browser's local
  storage, keeping the latest five snapshots, and also saves each one as a file
  in your Downloads folder. It never leaves your device.

## Permissions

Snug requests the following browser permissions, each used solely for the
purpose described:

| Permission         | Purpose                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Read and write your browser bookmarks to support import and export.                                                                           |
| `favicon`          | Display site icons next to bookmarks via the browser's built-in `_favicon` API.                                                               |
| `storage`          | Save your local preferences and settings on your device.                                                                                      |
| `alarms`           | Schedule and trigger automatic bookmark exports at the configured interval.                                                                   |
| `downloads`        | Save automatic exports and safety snapshot files to your device, and delete Snug's own old automatic export files (Retention).                |
| `notifications`    | Show a notification on your device when an automatic export fails. You can turn it off.                                                       |
| `unlimitedStorage` | Keep the latest five safety snapshots of your bookmarks on your device, which can be large for big libraries.                                 |
| `offscreen`        | Create a short-lived hidden document so an automatic export can be turned into a downloadable file. It has no UI and loads no remote content. |

## Third-Party Services

Our extension does not integrate with or utilize any third-party services or
analytics tools.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any
changes by posting the new Privacy Policy on this page and updating the "Last
updated" date at the top of this policy.

## Contact Us

If you have any questions about this Privacy Policy, please contact us:

- By email: hello@andryore.dev
- By opening an issue on our GitHub repository:
  https://github.com/AndryOre/snug/issues

## Consent

By using Snug, you hereby consent to our Privacy Policy and agree to its terms.
