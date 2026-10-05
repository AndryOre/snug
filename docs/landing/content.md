# Landing page content v1 (EN and ES)

Copy for every section of the one-page landing at `snug.andryore.dev`. This
document is content only: it does not decide layout, visuals or components.

- **Source of truth:** English. Spanish is adapted for meaning (neutral Latin
  American, tú, no voseo), not mirrored.
- **Voice:** [`docs/brand/voice.md`](../brand/voice.md). Calm, precise, quietly
  warm. State what happens and stop.
- **Sources:** `PRODUCT.md` (Product), `.agents/product-marketing.md` (Context),
  [`docs/store/baseline-2026-09.md`](../store/baseline-2026-09.md) (Baseline).
  Each section ends with a `Sources` line tracing its claims.
- **One conversion:** the install button goes to the Chrome Web Store through
  the counted `/install` redirect. The store listing is
  `https://chromewebstore.google.com/detail/gdhpeilfkeeajillmcncaelnppiakjhn`.
- **Never imply:** cloud, sync, an account, pricing, importing several files at
  once, or any format or capability Snug does not ship.
- **Store figures, read 2026-10-05:** 5,000 users, 4.8 stars from 20 ratings.
  Re-check on the listing before launch.

Section order: 1 Hero, 2 Trust proof, 3 Features, 4 Real interface, 5 Video, 6
Social proof, 7 FAQ, 8 Final call to action and footer.

---

## 1. Hero

### EN

- **Eyebrow:** Bookmark export, import and backup
- **Headline:** Move your bookmarks. Nothing leaves your device.
- **Subheadline:** Snug exports, imports and backs up your bookmarks in Chrome
  and other Chromium browsers. It makes no network calls and needs no account.
- **Primary button:** Add to Chrome
- **Under the button:** Free. Open source. Works in Chrome, Edge, Brave and
  Opera.
- **Secondary link:** See the source on GitHub

### ES

- **Eyebrow:** Exportar, importar y respaldar marcadores
- **Headline:** Lleva tus marcadores contigo. Nada sale de tu dispositivo.
- **Subheadline:** Snug exporta, importa y respalda tus marcadores en Chrome y
  en otros navegadores Chromium. No hace llamadas de red y no necesita cuenta.
- **Primary button:** Añadir a Chrome
- **Under the button:** Gratis. Código abierto. Funciona en Chrome, Edge, Brave
  y Opera.
- **Secondary link:** Ver el código en GitHub

Sources: no network calls, no account, free, open source, Chromium browsers
(Product: Product Purpose, Positioning; Context: Product Overview). Button label
matches the store's own action.

Alternatives for the headline (EN):

- Your bookmarks, exactly as you left them.
- Export, import and back up bookmarks on your own device.

---

## 2. Trust proof

Leads with the proof only Snug can give. The reader is deciding whether to give
an extension read and write access to the whole bookmark tree.

### EN

- **Heading:** An extension that has no server to trust
- **Intro:** Snug reads and writes your browser's own bookmarks tree, on your
  device. It never connects to anything, so there is nowhere for your bookmarks
  to go.
- **Point 1, No network calls:** Snug makes none. Every export and import
  happens locally.
- **Point 2, No account:** There is nothing to sign up for and nothing to log in
  to.
- **Point 3, Open source:** The code is public. Read it, or check the project's
  OpenSSF Scorecard and Best Practices badges, CodeQL scans and CI runs.
- **Why access to all bookmarks:** Reading and writing your bookmarks is the
  only way an extension can export and import them. Snug does that and nothing
  else.
- **Links:** Source code, OpenSSF Scorecard, OpenSSF Best Practices, CI status,
  Privacy Policy

### ES

- **Heading:** Una extensión sin servidor en el que confiar
- **Intro:** Snug lee y escribe el árbol de marcadores de tu propio navegador,
  en tu dispositivo. Nunca se conecta a nada, así que tus marcadores no tienen a
  dónde ir.
- **Point 1, Sin llamadas de red:** Snug no hace ninguna. Cada exportación e
  importación ocurre en local.
- **Point 2, Sin cuenta:** No hay nada a lo que registrarse ni dónde iniciar
  sesión.
- **Point 3, Código abierto:** El código es público. Léelo, o revisa las
  insignias OpenSSF Scorecard y Best Practices del proyecto, los análisis de
  CodeQL y las ejecuciones de CI.
- **Why access to all bookmarks:** Leer y escribir tus marcadores es la única
  forma en que una extensión puede exportarlos e importarlos. Snug hace eso y
  nada más.
- **Links:** Código fuente, OpenSSF Scorecard, OpenSSF Best Practices, estado de
  CI, Política de privacidad

Sources: Product: Positioning, Evidence on Hand; Context: Objections (access to
all bookmarks, solo-dev safety), Trust links. Link targets are listed in
Context: Trust links.

---

## 3. Features

Four themes from Context: Proof Points, Value themes. One idea each.

### EN

- **Heading:** What Snug does

1. **Export what you choose**
   - Export the whole tree or only the folders you pick, as HTML, JSON, CSV,
     Markdown, OPML or XBEL. Filenames can include the date, so you can tell
     them apart later.
2. **Preview before you import**
   - Import HTML, JSON, CSV or XBEL files, a Chrome profile `Bookmarks` file, or
     a Safari export with Favorites and Reading List. Snug detects the format
     and shows a preview. Then you merge, replace, or add everything to a new
     folder.
3. **Undo a replace**
   - Replace saves a Safety snapshot first. If the result is not what you
     wanted, restore it.
4. **Clean up duplicates**
   - A Duplicates page finds repeated bookmarks. On import, Skip duplicates
     leaves out URLs you already have.
5. **Back up on a schedule**
   - Auto-export saves your bookmarks to the Downloads folder on a schedule you
     set. Retention keeps only the newest files, and you can get a notification
     if a run fails.
6. **Works where you are**
   - Chrome, Edge, Brave, Opera and other Chromium browsers. The interface comes
     in 10 languages and follows your browser's theme and language.

### ES

- **Heading:** Lo que hace Snug

1. **Exporta lo que elijas**
   - Exporta todo el árbol o solo las carpetas que escojas, en HTML, JSON, CSV,
     Markdown, OPML o XBEL. Los nombres de archivo pueden incluir la fecha, así
     los distingues después.
2. **Vista previa antes de importar**
   - Importa archivos HTML, JSON, CSV o XBEL, un archivo `Bookmarks` de un
     perfil de Chrome, o una exportación de Safari con Favoritos y Lista de
     lectura. Snug detecta el formato y te muestra una vista previa. Después
     combinas, reemplazas o añades todo a una carpeta nueva.
3. **Deshaz un reemplazo**
   - Antes de reemplazar, Snug guarda una instantánea de seguridad. Si el
     resultado no es el que querías, la restauras.
4. **Limpia duplicados**
   - Una página de Duplicados encuentra marcadores repetidos. Al importar,
     Omitir duplicados deja fuera las URL que ya tienes.
5. **Respalda con un horario**
   - La exportación automática guarda tus marcadores en la carpeta de Descargas
     con el horario que definas. La retención conserva solo los archivos más
     recientes, y puedes recibir una notificación si una ejecución falla.
6. **Funciona donde estés**
   - Chrome, Edge, Brave, Opera y otros navegadores Chromium. La interfaz está
     en 10 idiomas y sigue el tema y el idioma de tu navegador.

Sources: Product: Capabilities and Constraints; Context: What it does, Value
themes, Glossary. The ES terms "instantánea de seguridad", "exportación
automática", "retención" and "omitir duplicados" must match the shipped
`apps/extension/locales/es.json` labels before the page ships.

---

## 4. Real interface

Captions for real screenshots of the extension. English set:
`docs/store/assets/screenshots/`, one per slide in
[`docs/store/screenshots.md`](../store/screenshots.md). Use the `es/` set for
the Spanish page. Captions describe what the screenshot shows.

### EN

| Image                | Caption                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `01-export.png`      | Export page: pick folders from the tree, choose a format, export.        |
| `02-import.png`      | Import preview: see what will change, then pick merge, replace or new.   |
| `03-auto-export.png` | Auto-export: daily, in HTML, JSON and Markdown, with the next run shown. |
| `04-popup.png`       | The toolbar popup exports everything in one click.                       |

### ES

| Image                | Caption                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `01-export.png`      | Página de exportación: elige carpetas del árbol, un formato y exporta.                           |
| `02-import.png`      | Vista previa de importación: mira qué cambia y elige combinar, reemplazar o carpeta nueva.       |
| `03-auto-export.png` | Exportación automática: a diario, en HTML, JSON y Markdown, con la próxima ejecución a la vista. |
| `04-popup.png`       | La ventana de la barra de herramientas exporta todo con un clic.                                 |

The fifth store slide (`05-local.png`) has no interface in it, so it is not used
here.

Sources: [`docs/store/screenshots.md`](../store/screenshots.md), Shot list.

---

## 5. Video (click to load)

Product: a demo video of the current version does not exist yet (Product:
Evidence on Hand). The video block ships only when one is published; until then
this section is left out of the page rather than filled with a placeholder.

### EN

- **Heading:** See it work
- **Caption:** A short walkthrough of exporting a folder and importing it with a
  preview.
- **Click-to-load note:** The video loads from YouTube only when you press play.
  Until then the page contacts no one.

### ES

- **Heading:** Míralo en acción
- **Caption:** Un recorrido breve: exportar una carpeta e importarla con vista
  previa.
- **Click-to-load note:** El video se carga desde YouTube solo cuando pulsas
  reproducir. Hasta entonces, la página no se conecta con nadie.

Sources: caption describes features in Product: Capabilities and Constraints.
Confirm it matches the final video before publishing.

---

## 6. Social proof

### EN

- **Heading:** What people say
- **Numbers line:** 5,000 users. 4.8 stars from 20 ratings on the Chrome Web
  Store (2026-10-05).
- **Rename note, shown with the reviews:** These are public Chrome Web Store
  reviews. Most were written before Snug was renamed, when the listing was
  called "Bookmark Import/Export", so they describe the export and import, not
  the current interface.
- **Link:** Read all reviews on the Chrome Web Store

Reviews, verbatim from the store, with the name as the store shows it. `[...]`
marks text left out of a longer review.

> "My Dia beta browser (based on Chromium) has no way to export bookmarks. [...]
> It quickly created the HTML bookmarks file I needed."

Birdman, Jun 2025

> "I could not get Vivaldi to import bookmarks from Chrome - crashed every time.
> [...] Installed this in Vivaldi and it imported the export file in a flash.
> Painless."

Sean Frey, Sep 2024

> "I wanted to export bookmarks from a certain folder. This extension can do
> it."

Karol Darvaš, Feb 2026

> "Used the HTML export and it worked awesome."

Jacob Hanson, Jun 2026

### ES

- **Heading:** Lo que dice la gente
- **Numbers line:** 5.000 usuarios. 4,8 estrellas con 20 valoraciones en la
  Chrome Web Store (2026-10-05).
- **Rename note, shown with the reviews:** Son reseñas públicas de la Chrome Web
  Store, en inglés tal como se publicaron. La mayoría se escribió antes de que
  Snug cambiara de nombre, cuando el listado se llamaba "Bookmark
  Import/Export", así que hablan de la exportación y la importación, no de la
  interfaz actual.
- **Link:** Leer todas las reseñas en la Chrome Web Store

The four reviews stay in English as published; do not translate a quote. The ES
page may add a translation line under each in a lighter style, marked as a
translation.

Sources: Product: Evidence on Hand; Context: Proof Points, Testimonials,
Customer Language. Figures match the listing on 2026-10-05; the Baseline shows
4.75 rounding to 4.8 over 20 ratings.

---

## 7. FAQ

Includes what Snug does not do. Each answer is plain and short.

### EN

**Does Snug send my bookmarks anywhere?** No. Snug makes no network calls. It
reads and writes your browser's bookmarks on your device, and the source code is
public so you can check.

**Do I need an account?** No. Install it and start exporting.

**Does it sync my bookmarks between devices?** No. Snug has no sync and no
cloud. To move bookmarks to another browser or computer, export a file and
import it there.

**Can I import several files at once?** No. Snug imports one file at a time. To
bring in more than one, import them one after another.

**Why does it need access to all my bookmarks?** Reading and writing them is the
only way an extension can export and import them. Snug makes no network calls,
so nothing it reads can leave your device.

**My browser already exports HTML. Why use Snug?** The built-in export has no
folder selection, preview, undo, schedule, duplicate check or extra formats.
Snug has all of them.

**Will it overwrite my current bookmarks?** Only if you choose Replace. You see
a preview first, and Replace saves a Safety snapshot you can restore.

**Which formats does it handle?** Export as HTML, JSON, CSV, Markdown, OPML or
XBEL. Import HTML, JSON, CSV or XBEL, a Chrome profile `Bookmarks` file, or a
Safari export.

**Which browsers does it work in?** Chrome and other Chromium browsers such as
Edge, Brave and Opera.

**Is it safe to install a solo developer's extension?** The source is public,
CodeQL scans it, the project has OpenSSF Scorecard and Best Practices badges,
and CI runs pinned. Judge it yourself on GitHub.

**Does Snug cost anything?** No. It is free.

### ES

**¿Snug envía mis marcadores a algún lado?** No. Snug no hace llamadas de red.
Lee y escribe los marcadores de tu navegador en tu dispositivo, y el código
fuente es público para que lo verifiques.

**¿Necesito una cuenta?** No. Instálalo y empieza a exportar.

**¿Sincroniza mis marcadores entre dispositivos?** No. Snug no tiene
sincronización ni nube. Para pasar tus marcadores a otro navegador o equipo,
exporta un archivo e impórtalo allí.

**¿Puedo importar varios archivos a la vez?** No. Snug importa un archivo a la
vez. Si tienes varios, impórtalos uno después del otro.

**¿Por qué necesita acceso a todos mis marcadores?** Leerlos y escribirlos es la
única forma en que una extensión puede exportarlos e importarlos. Snug no hace
llamadas de red, así que nada de lo que lee puede salir de tu dispositivo.

**Mi navegador ya exporta HTML. ¿Para qué usar Snug?** La exportación integrada
no permite elegir carpetas, ni tiene vista previa, deshacer, horario, revisión
de duplicados ni otros formatos. Snug sí.

**¿Va a sobrescribir mis marcadores actuales?** Solo si eliges Reemplazar. Antes
ves una vista previa, y Reemplazar guarda una instantánea de seguridad que
puedes restaurar.

**¿Qué formatos maneja?** Exporta en HTML, JSON, CSV, Markdown, OPML o XBEL.
Importa HTML, JSON, CSV o XBEL, un archivo `Bookmarks` de un perfil de Chrome, o
una exportación de Safari.

**¿En qué navegadores funciona?** En Chrome y otros navegadores Chromium, como
Edge, Brave y Opera.

**¿Es seguro instalar la extensión de un desarrollador independiente?** El
código fuente es público, CodeQL lo analiza, el proyecto tiene las insignias
OpenSSF Scorecard y Best Practices, y el CI usa versiones fijadas. Júzgalo tú
mismo en GitHub.

**¿Snug cuesta algo?** No. Es gratis.

Sources: Context: Objections table (all five objections), Anti-persona,
Differentiation; Product: Capabilities and Constraints ("Imports one file at a
time. No sync, no cloud, no account, no pricing").

---

## 8. Final call to action and footer

### EN

- **Heading:** Take your bookmarks with you
- **Line:** Add Snug to Chrome and export, import or back up in a few clicks.
  Free, open source, and nothing leaves your device.
- **Button:** Add to Chrome
- **Footer links:** Source on GitHub, Privacy Policy, Chrome Web Store listing
- **Footer note:** Snug is open source under the MIT license.

### ES

- **Heading:** Lleva tus marcadores contigo
- **Line:** Añade Snug a Chrome y exporta, importa o respalda en pocos clics.
  Gratis, de código abierto, y nada sale de tu dispositivo.
- **Button:** Añadir a Chrome
- **Footer links:** Código en GitHub, Política de privacidad, Listado en la
  Chrome Web Store
- **Footer note:** Snug es de código abierto con licencia MIT.

Sources: Product: Positioning, Capabilities and Constraints. MIT license is
stated in [`docs/store/screenshots.md`](../store/screenshots.md) (slide 5
claims). The Privacy Policy page is `/privacy` (separate ticket).

---

## Claim sweep

- No sync, cloud, account, pricing or "several files" claim anywhere, checked
  against Product: Capabilities and Constraints and Context: Words to avoid.
- No exclamation points, emoji, em dashes in short copy, or "seamless",
  "powerful", "effortless", "supercharge".
- Not claimed anywhere: customer logos, press, case studies, usage metrics
  beyond the store figures, a demo video of the current version (Product:
  Evidence on Hand).
- The other 8 locales come later from the store listing translations
  (`docs/store/listings/`), in a separate ticket.
