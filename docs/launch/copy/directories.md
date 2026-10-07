# Directory submission copy

Copy for the Launch kit's directory submissions. One section per variant ID; the
headings match the `variant` column in `directories.csv`. Use a different
variant per directory type, never the same description everywhere. Do not
mention the old name, Bookmark Import/Export, or the 2.0 relaunch: the
directories have never listed the extension before, so the old name only
confuses readers.

Rules for every variant:

- Proof points come only from `.agents/product-marketing.md` and the Chrome Web
  Store facts. No pricing, signup, trial or demo language, and no invented
  numbers. Re-check the Chrome Web Store numbers before quoting them.
- Link to the Landing page with a Campaign tag:
  `https://snug.andryore.dev/?c=<tag>`, or the Install redirect
  `https://snug.andryore.dev/install?c=<tag>`. Tags match
  `^[A-Za-z0-9_-]{1,32}$`. Every directory has its own tag in `directories.csv`
  (the `Campaign Tag` column); use that one, never a shared tag per variant.
- Character counts are computed with `[...text].length` and include spaces. The
  long description target is about 500 characters.
- Never submit, save or type anything on an external platform from this file
  without explicit human approval.

| Variant        | Use for                               |
| -------------- | ------------------------------------- |
| `extension`    | Chrome extension and general listings |
| `alternatives` | AlternativeTo, SaaSHub and similar    |
| `open-source`  | GitHub lists, developer directories   |
| `privacy`      | Privacy and security directories      |
| `es`           | Spanish-language directories          |

## extension

**Use for:** Extension directories (Chrome extension and general software
listings). Lead with the outcome: move and back up bookmarks intact.

- **Name:** Snug
- **Tagline** (57/60): Export, import and back up your bookmarks, on your device
- **Short description** (120/160): Snug moves your bookmarks between browsers as
  you left them. Six export formats, import with preview, scheduled backups.
- **Campaign tag:** the directory's own tag from `directories.csv`

**Long description** (451 characters)

Snug is a Chrome extension that moves your bookmarks between browsers exactly as
you left them. Export the whole tree or only chosen folders in HTML, JSON, CSV,
Markdown, OPML or XBEL. Import shows a preview first, then merges, replaces, or
adds everything to a new folder. A replace saves a Safety snapshot, so you can
undo it. Auto-export writes scheduled backups to your Downloads folder. Snug
works in Chromium browsers and makes no network calls.

**Feature bullets**

- Export the whole bookmark tree or only the folders you choose
- Six formats: HTML, JSON, CSV, Markdown, OPML, XBEL
- Import with a preview, then merge, replace, or add to a new folder
- Undo a replace from a Safety snapshot
- Auto-export on a schedule, with Retention and a Failure notification
- Duplicates page and Skip duplicates on import
- 10 languages; follows the browser theme and language

**Tags:** bookmarks, bookmark export, bookmark import, bookmark backup, browser
migration, OPML, Chrome extension, Chromium

**Categories:** Productivity (primary), Browser extensions, Utilities

**Alternative to:**

- The browser built-in "Export bookmarks"
- Selective Bookmarks Export Tool
- Export Selective Bookmarks
- Bookmark Folder Import & Export
- Bookmarks Exporter

## alternatives

**Use for:** Software alternatives directories (AlternativeTo, SaaSHub and
similar). Lead with the alternative framing: the local-only option that goes
beyond HTML export.

- **Name:** Snug
- **Tagline** (54/60): A local-only alternative to bookmark export extensions
- **Short description** (159/160): Snug is the bookmark export and import
  extension that works beyond HTML: six formats, folder selection, import
  preview and undo. Open source, no network calls.
- **Campaign tag:** the directory's own tag from `directories.csv`

**Long description** (542 characters)

Snug is an alternative to the browser built-in "Export bookmarks" and to
single-format extensions such as Selective Bookmarks Export Tool, Export
Selective Bookmarks and 101 Export History/Bookmarks. Where those export one
format, Snug exports HTML, JSON, CSV, Markdown, OPML and XBEL, for the whole
tree or chosen folders. It previews every import, offers merge, replace or new
folder, and keeps a Safety snapshot so a replace can be undone. Auto-export
covers scheduled backups to Downloads. Everything runs on your device, with no
account.

**Feature bullets**

- More than HTML: six export formats, four import sources, auto-detected
- Folder selection instead of all-or-nothing exports
- Import preview, three import modes, undo for replace
- Scheduled Auto-export with Retention and Failure notification
- Duplicates page for cleaning up before or after an import
- Open source, and it never touches the network

**Tags:** bookmark export alternative, bookmark importer, bookmark backup,
export bookmarks to Markdown, export bookmarks to OPML, Chrome extension,
browser switching

**Categories:** Browser extensions (primary), Backup, Productivity

**Alternative to:**

- The browser built-in "Export bookmarks"
- Selective Bookmarks Export Tool
- Export Selective Bookmarks
- 101 Export History/Bookmarks to JSON/CSV/XLS
- Bookmark Folder Import & Export
- Bookmarks Exporter (oneryx)
- Maple Backup - Bookmark Snapshots (scheduled backups only)

## open-source

**Use for:** Developer and open source directories (GitHub lists, DevHunt and
similar). Lead with technical substance: public source, verifiable claims,
supply-chain signals.

- **Name:** Snug
- **Tagline** (58/60): Open source bookmark export and import, zero network
  calls
- **Short description** (147/160): Snug is an open source Chrome MV3 extension
  that reads and writes the bookmarks tree on-device. MIT licensed, CodeQL,
  OpenSSF Scorecard, pinned CI.
- **Campaign tag:** the directory's own tag from `directories.csv`

**Long description** (447 characters)

Snug is an open source Chrome Manifest V3 extension for bookmark export, import
and backup, MIT licensed, built with WXT, React 19 and Tailwind CSS v4. It reads
and writes the browser bookmarks tree directly and makes no network calls, so
the privacy claim can be checked in the source. The repository runs CodeQL,
tracks an OpenSSF Scorecard, and pins its CI. It exports six formats, previews
imports, and undoes a replace from a Safety snapshot.

**Feature bullets**

- MIT licensed, source at github.com/AndryOre/snug
- Chrome MV3 with WXT, React 19 and Tailwind CSS v4
- No server and no network calls; verifiable in the code
- CodeQL, OpenSSF Scorecard and Best Practices, pinned CI
- Formats: HTML, JSON, CSV, Markdown, OPML, XBEL
- Import format auto-detection with preview before any write

**Tags:** open source, Chrome extension, Manifest V3, WXT, React, TypeScript,
bookmarks, privacy-first

**Categories:** Developer tools (primary), Open source, Browser extensions

**Alternative to:**

- Selective Bookmarks Export Tool (also open source, HTML only)
- The browser built-in "Export bookmarks"
- Bookmarks Exporter (oneryx)

## privacy

**Use for:** Privacy and security directories (privacy-tool lists and catalogs).
Lead with the structural trust story: nothing leaves the device because there is
nothing to send it to.

- **Name:** Snug
- **Tagline** (56/60): Bookmark export and backup that never leaves your device
- **Short description** (124/160): Snug exports, imports and backs up your
  bookmarks on your device, without an account or network calls. The source is
  public.
- **Campaign tag:** the directory's own tag from `directories.csv`

**Long description** (488 characters)

Your bookmarks are years of curated work, and handing them to an unknown
extension feels riskier than it should. Snug reads and writes the browser
bookmarks tree on your device and makes no network calls, so there is no server
to trust. It needs no account and collects no data. You can export everything or
one folder, import with a preview, undo a replace from a Safety snapshot, and
schedule backups to your Downloads folder. The source is public, with CodeQL and
an OpenSSF Scorecard.

**Feature bullets**

- Zero network calls and no account
- No ads and no data collection
- Source is public; the privacy claim is verifiable
- Export one folder without exposing your whole library
- Preview before import; replace never happens silently
- Backups stay in your Downloads folder

**Tags:** privacy, local-only, no tracking, open source, bookmarks, backup,
Chrome extension

**Categories:** Privacy (primary), Browser extensions, Backup

**Alternative to:**

- Browser sync for bookmarks (needs an account and a cloud)
- Maple Backup - Bookmark Snapshots (optional cloud copies)
- EverSync (cloud sync service)
- The browser built-in "Export bookmarks"

## es

**Use for:** Spanish-language directories (Latin America). Neutral Latin
American Spanish, tú, no voseo. Adapted for meaning, not a literal translation.
The product name stays "Snug".

- **Name:** Snug
- **Tagline** (60/60): Exporta, importa y respalda tus marcadores en tu
  dispositivo
- **Short description** (120/160): Snug lleva tus marcadores de un navegador a
  otro tal como los dejaste. Seis formatos, vista previa y copias programadas.
- **Campaign tag:** the directory's own tag from `directories.csv`

**Long description** (483 characters)

Snug es una extensión de Chrome que lleva tus marcadores de un navegador a otro
tal como los dejaste. Exporta todo el árbol o solo las carpetas que elijas en
HTML, JSON, CSV, Markdown, OPML o XBEL. Al importar ves una vista previa y
decides si combinar, reemplazar o añadir todo a una carpeta nueva. Si
reemplazas, Snug guarda una copia de seguridad para que puedas deshacerlo. La
exportación automática guarda copias programadas en Descargas. No hace llamadas
de red ni pide cuenta.

**Feature bullets**

- Exporta todo el árbol de marcadores o solo las carpetas que elijas
- Seis formatos: HTML, JSON, CSV, Markdown, OPML y XBEL
- Vista previa al importar; combina, reemplaza o añade a una carpeta nueva
- Deshaz un reemplazo con la copia de seguridad automática
- Exportación automática programada, con retención y aviso si falla
- No necesita cuenta ni usa la red; el código es público
- Disponible en 10 idiomas

**Tags:** marcadores, exportar marcadores, importar marcadores, copia de
seguridad, extensión de Chrome, código abierto, privacidad, OPML

**Categories:** Productividad (principal), Extensiones de navegador, Utilidades

**Alternative to:**

- La exportación de marcadores integrada del navegador
- Selective Bookmarks Export Tool
- Export Selective Bookmarks
- Bookmark Folder Import & Export
- Bookmarks Exporter
