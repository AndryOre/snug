# Microsoft Edge Add-ons listing pack for Snug v2.0.0

A field-by-field mirror of the Partner Center "Update" flow for the existing
Edge product (Store ID `0RDCK9J6Z4VS`, extension ID
`efknehclgcncocgochoibgiiagklcnho`). Every field is a plain-text block you can
copy straight into Partner Center, with a character count next to each limited
field. Nothing in this pack has been uploaded or submitted.

It mirrors [`../README.md`](../README.md), the Chrome Web Store pack. The
listing text here never names another browser, because Edge Add-ons policy 1.1.2
forbids a listing from referencing other browsers.

> Paths to extension code (`lib/`, `entrypoints/`, `locales/`) are relative to
> `apps/extension/`. Asset paths are relative to `docs/store/`.

## Findings vs live listing

Snapshot of
`https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/efknehclgcncocgochoibgiiagklcnho`,
taken on 2026-10-07.

| Field          | Live listing                                                                                    | This pack                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Name           | `Bookmark Import/Export` (old name)                                                             | `Snug: Bookmark Export, Import & Backup`                                                   |
| Version        | 1.0.0 (last update 2024-08-09)                                                                  | 2.0.0                                                                                      |
| Permissions    | 2: `bookmarks`, `favicon`                                                                       | 8: adds `storage`, `alarms`, `downloads`, `offscreen`, `unlimitedStorage`, `notifications` |
| Category       | Productivity                                                                                    | Productivity (unchanged)                                                                   |
| Search terms   | 7 terms, all bookmark-related                                                                   | 7 terms, 21 words or fewer                                                                 |
| Privacy URL    | `https://github.com/AndryOre/bookmarks-import-export/blob/main/PRIVACY_POLICY.md`               | `https://snug.andryore.dev/privacy/`                                                       |
| Website        | `https://github.com/AndryOre/bookmarks-import-export` (old repository slug)                     | `https://snug.andryore.dev/`                                                               |
| Support        | `https://github.com/AndryOre/bookmarks-import-export/issues` (old slug, inside the description) | `https://github.com/AndryOre/snug/issues`                                                  |
| Languages      | 1 (`en-US`)                                                                                     | 10                                                                                         |
| Screenshots    | 5, old product                                                                                  | up to 6, new set                                                                           |
| Videos         | none                                                                                            | none                                                                                       |
| Rating / users | 0 ratings, 694 active installs                                                                  | not applicable                                                                             |

What this means:

1. **Permission increase.** Going from 2 to 8 permissions makes Edge show a
   permission-increase prompt to the 694 current users, and the extension stays
   disabled for each of them until they accept it. Expect some attrition. The
   justifications below keep each permission specific and tied to a visible
   feature.
2. **Rename.** The live name and description describe the old product. The name
   comes from the manifest (`extensionManifestName`), so the new package carries
   it. Replace the description in every locale.
3. **Old URLs.** The privacy URL, website and the support link inside the
   description point to the old `bookmarks-import-export` repository slug.
   Replace them with the URLs below.
4. **Old assets.** The five live screenshots show the old product. Replace them.
5. **Policy 1.1.2.** The Chrome Web Store copy lists other browsers in the
   description and the summary (`extensionDescription` in the Chrome build). The
   Edge build must carry Edge-specific store copy (AO-1534), and the screenshots
   must not show another browser's name. See the checklist.

## Store listing

### Product name

Comes from the package manifest (`__MSG_extensionManifestName__`), so it cannot
be typed in Partner Center. Value the package must carry (38 chars):

```text
Snug: Bookmark Export, Import & Backup
```

### Description

Partner Center takes a description of 250 to 10,000 characters per language.
Locales: English (default), Spanish, Portuguese (Brazil), French, German,
Japanese, Chinese (Simplified), Russian, Italian and Korean (`en`, `es`,
`pt_BR`, `fr`, `de`, `ja`, `zh_CN`, `ru`, `it`, `ko`). Add each as its own
language in Partner Center.

Each description is adapted from the Chrome Web Store pack
([`../README.md`](../README.md) and [`../listings/`](../listings/)) with two
changes: the import sentence names "a browser's bookmarks file" instead of a
specific browser or profile format, and the closing sentence about other
Chromium browsers is dropped. Product and format names (Snug, HTML, JSON) stay
in English. Counts are characters, including spaces and line breaks.

| Locale | Characters | Limit         |
| ------ | ---------- | ------------- |
| en     | 1212       | 250 to 10,000 |
| es     | 1376       | 250 to 10,000 |
| pt_BR  | 1339       | 250 to 10,000 |
| fr     | 1548       | 250 to 10,000 |
| de     | 1498       | 250 to 10,000 |
| ja     | 603        | 250 to 10,000 |
| zh_CN  | 401        | 250 to 10,000 |
| ru     | 1281       | 250 to 10,000 |
| it     | 1367       | 250 to 10,000 |
| ko     | 620        | 250 to 10,000 |

#### English (en, default)

Description (1212 chars):

```text
Snug moves your bookmarks between browsers, exactly as you left them — nothing sent anywhere, no account required.

Export your whole bookmark tree or just the folder you choose, in common formats such as HTML or JSON. Import files from other bookmark managers or a browser's bookmarks file, with a preview first. Then merge into your existing bookmarks, replace them outright, or drop everything into a new folder — your call every time.

Before any replace, Snug saves a safety snapshot of your bookmarks, so you can Undo it. A Duplicates page finds repeated bookmarks and deletes only the ones you pick, and imports can skip duplicates.

Set up a schedule once — hourly, daily, weekly, and more — and Snug backs up your bookmarks straight to your Downloads folder on its own, in the formats you pick. Retention keeps only the latest backups, and a notification tells you if one fails. Filenames can include the date and time automatically.

Snug runs entirely on your device — no account, no cloud, no server. Every operation reads and writes your browser's own bookmarks tree, and that's the whole trust story. The bookmark tree works fully with the keyboard and screen readers, and Snug speaks 10 languages.
```

#### Spanish (es)

Description (1376 chars):

```text
Snug mueve tus marcadores entre navegadores, tal como los dejaste — no se envían a ningún lado, y no necesitas cuenta.

Exporta todo tu árbol de marcadores o solo la carpeta que elijas, en formatos comunes como HTML o JSON. Importa archivos de otros gestores de marcadores o el archivo de marcadores de un navegador, con una vista previa primero. Luego decides: combinarlos con tus marcadores actuales, reemplazarlos por completo, o guardarlo todo en una carpeta nueva — tú decides cada vez.

Antes de cualquier reemplazo, Snug guarda una copia de seguridad de tus marcadores para que puedas deshacerlo. Una página de Duplicados encuentra marcadores repetidos y elimina solo los que elijas, y al importar puedes omitir duplicados.

Configura un horario una sola vez — cada hora, a diario, cada semana y más — y Snug respalda tus marcadores directo a tu carpeta de Descargas, en los formatos que elijas. La Retención conserva solo los respaldos más recientes, y un aviso te dice si alguno falla. Los nombres de archivo pueden incluir la fecha y hora automáticamente.

Snug funciona completamente en tu dispositivo — sin cuenta, sin nube, sin servidor. Cada operación lee y escribe directamente en los marcadores de tu navegador, y esa es toda la historia de confianza. El árbol de marcadores funciona por completo con el teclado y lectores de pantalla, y Snug habla 10 idiomas.
```

#### Portuguese, Brazil (pt_BR)

Description (1339 chars):

```text
O Snug leva seus favoritos entre navegadores, exatamente como você os deixou — nada é enviado a lugar nenhum e você não precisa de conta.

Exporte toda a árvore de favoritos ou só a pasta que escolher, em formatos comuns como HTML ou JSON. Importe arquivos de outros gerenciadores de favoritos ou o arquivo de favoritos de um navegador, com uma prévia primeiro. Depois decida: mesclar com os favoritos atuais, substituí-los por completo ou colocar tudo em uma pasta nova — a escolha é sempre sua.

Antes de qualquer substituição, o Snug salva um instantâneo de segurança dos seus favoritos, para você poder desfazer. Uma página Duplicados encontra favoritos repetidos e exclui só os que você escolher, e a importação pode ignorar duplicados.

Configure um agendamento uma única vez — por hora, diário, semanal e mais — e o Snug salva seus favoritos direto na pasta Downloads, nos formatos que você escolher. A Retenção mantém só os backups mais recentes, e um aviso informa se algum falhar. Os nomes de arquivo podem incluir data e hora automaticamente.

O Snug roda inteiramente no seu dispositivo — sem conta, sem nuvem, sem servidor. Cada operação lê e grava direto nos favoritos do seu navegador, e essa é toda a história de confiança. A árvore de favoritos funciona totalmente com teclado e leitores de tela, e o Snug fala 10 idiomas.
```

#### French (fr)

Description (1548 chars):

```text
Snug déplace vos favoris d'un navigateur à l'autre, exactement comme vous les avez laissés — rien n'est envoyé nulle part, aucun compte requis.

Exportez toute l'arborescence de vos favoris ou seulement le dossier de votre choix, dans des formats courants comme HTML ou JSON. Importez des fichiers d'autres gestionnaires de favoris ou le fichier de favoris d'un navigateur, avec un aperçu d'abord. Puis choisissez : fusionner avec vos favoris existants, les remplacer entièrement, ou tout déposer dans un nouveau dossier — à chaque fois, c'est vous qui décidez.

Avant tout remplacement, Snug enregistre un instantané de sécurité de vos favoris pour que vous puissiez l'annuler. Une page Doublons repère les favoris en double et supprime uniquement ceux que vous choisissez, et l'import peut ignorer les doublons.

Configurez un horaire une seule fois — toutes les heures, chaque jour, chaque semaine, et plus — et Snug sauvegarde vos favoris directement dans votre dossier Téléchargements, dans les formats de votre choix. La Rétention ne conserve que les sauvegardes les plus récentes, et une notification vous prévient en cas d'échec. Les noms de fichier peuvent inclure automatiquement la date et l'heure.

Snug fonctionne entièrement sur votre appareil — pas de compte, pas de cloud, pas de serveur. Chaque opération lit et écrit directement dans l'arborescence de favoris de votre navigateur, et c'est toute l'histoire de la confiance. L'arbre des favoris s'utilise entièrement au clavier et avec un lecteur d'écran, et Snug parle 10 langues.
```

#### German (de)

Description (1498 chars):

```text
Snug überträgt deine Lesezeichen zwischen Browsern, genau so, wie du sie hinterlassen hast – nichts wird irgendwohin gesendet, und ein Konto brauchst du nicht.

Exportiere deine gesamte Lesezeichenstruktur oder nur den Ordner deiner Wahl, in gängigen Formaten wie HTML oder JSON. Importiere Dateien aus anderen Lesezeichen-Managern oder die Lesezeichen-Datei eines Browsers, zuerst mit einer Vorschau. Dann entscheidest du: mit deinen vorhandenen Lesezeichen zusammenführen, sie komplett ersetzen oder alles in einem neuen Ordner ablegen – jedes Mal deine Entscheidung.

Vor jedem Ersetzen legt Snug eine Sicherheitskopie deiner Lesezeichen an, damit du es rückgängig machen kannst. Die Seite Duplikate findet doppelte Lesezeichen und löscht nur die, die du auswählst, und beim Import lassen sich Duplikate überspringen.

Richte einmal einen Zeitplan ein – stündlich, täglich, wöchentlich und mehr –, und Snug sichert deine Lesezeichen von selbst direkt in deinen Download-Ordner, in den Formaten, die du wählst. Die Aufbewahrung behält nur die neuesten Sicherungen, und eine Benachrichtigung meldet, wenn eine fehlschlägt. Dateinamen können automatisch Datum und Uhrzeit enthalten.

Snug läuft vollständig auf deinem Gerät – kein Konto, keine Cloud, kein Server. Jeder Vorgang liest und schreibt direkt in der Lesezeichenstruktur deines Browsers, und das ist die ganze Vertrauensgeschichte. Der Lesezeichenbaum funktioniert vollständig mit Tastatur und Screenreadern, und Snug spricht 10 Sprachen.
```

#### Japanese (ja)

Description (603 chars):

```text
Snugは、ブックマークをブラウザー間でそのままの状態で移せます。データはどこにも送信されず、アカウントも不要です。

ブックマーク全体、または選んだフォルダーだけを、HTMLやJSONなどの一般的な形式で書き出せます。ほかのブックマーク管理ツールのファイルや、ブラウザーのブックマークファイルを読み込め、まずプレビューで確認できます。そのうえで、既存のブックマークと統合するか、完全に置き換えるか、新しいフォルダーにまとめて入れるかを、毎回自分で選べます。

置き換えの前には、Snugがブックマークの安全スナップショットを保存するので、元に戻せます。「重複」ページでは重複したブックマークを見つけ、選んだものだけを削除できます。読み込み時に重複をスキップすることもできます。

スケジュールを一度設定すれば、毎時、毎日、毎週などの間隔で、選んだ形式のバックアップがダウンロードフォルダーに自動で保存されます。保持設定で最新のバックアップだけを残し、失敗したときは通知でお知らせします。ファイル名には日付と時刻を自動で含められます。

Snugはすべて端末内で動作します。アカウント、クラウド、サーバーは不要です。すべての操作はブラウザー自身のブックマークを直接読み書きするだけ。それが信頼の理由のすべてです。ブックマークツリーはキーボードとスクリーンリーダーで完全に操作でき、10言語に対応しています。
```

#### Chinese, Simplified (zh_CN)

Description (401 chars):

```text
Snug 在浏览器之间原样迁移你的书签：不会向任何地方发送数据，也无需账号。

可导出整个书签树或你选择的文件夹，支持 HTML 或 JSON 等常见格式。可导入其他书签管理工具的文件或浏览器的书签文件，并先提供预览。然后由你决定：与现有书签合并、完全替换，或全部放进一个新文件夹。每次都由你决定。

每次替换之前，Snug 都会先保存书签的安全快照，方便你撤销。“重复项”页面可查找重复书签，并只删除你选中的；导入时也可以跳过重复项。

只需设置一次计划，可按每小时、每天、每周等间隔，Snug 就会自动把书签按你选的格式备份到下载文件夹。保留设置只留下最新的备份，备份失败时会有通知提醒。文件名可自动包含日期和时间。

Snug 完全在你的设备上运行：无需账号，没有云端，没有服务器。每个操作都直接读写浏览器自身的书签，这就是信任的全部。书签树可完全通过键盘和屏幕阅读器使用，并支持 10 种语言。
```

#### Russian (ru)

Description (1281 chars):

```text
Snug переносит ваши закладки между браузерами в точности так, как вы их оставили: ничего не отправляется наружу, аккаунт не нужен.

Экспортируйте всё дерево закладок или только выбранную папку в распространённых форматах, например HTML или JSON. Импортируйте файлы из других менеджеров закладок или файл закладок браузера, сначала с предпросмотром. Затем решайте сами: объединить с текущими закладками, полностью заменить их или сложить всё в новую папку.

Перед любой заменой Snug сохраняет страховочный снимок ваших закладок, чтобы её можно было отменить. Страница «Дубликаты» находит повторяющиеся закладки и удаляет только те, что вы выбрали, а при импорте дубликаты можно пропускать.

Настройте расписание один раз — каждый час, каждый день, каждую неделю и не только, — и Snug будет сам сохранять закладки в папку «Загрузки» в выбранных форматах. Хранение оставляет только последние копии, а уведомление сообщит, если копия не удалась. В имена файлов можно автоматически добавлять дату и время.

Snug работает целиком на вашем устройстве: без аккаунта, облака и сервера. Каждая операция читает и записывает дерево закладок самого браузера, и в этом вся суть доверия. Дерево закладок полностью доступно с клавиатуры и для программ чтения с экрана, а Snug говорит на 10 языках.
```

#### Italian (it)

Description (1367 chars):

```text
Snug sposta i tuoi segnalibri tra i browser, esattamente come li hai lasciati — niente viene inviato da nessuna parte e non serve alcun account.

Esporta l'intera struttura dei segnalibri o solo la cartella che scegli, in formati comuni come HTML o JSON. Importa i file di altri gestori di segnalibri o il file dei segnalibri di un browser, con prima un'anteprima. Poi decidi: unirli ai segnalibri esistenti, sostituirli del tutto o metterli in una nuova cartella — ogni volta scegli tu.

Prima di ogni sostituzione, Snug salva un'istantanea di sicurezza dei tuoi segnalibri, così puoi annullarla. Una pagina Duplicati trova i segnalibri ripetuti ed elimina solo quelli che scegli, e l'importazione può saltare i duplicati.

Imposta una pianificazione una sola volta — ogni ora, ogni giorno, ogni settimana e altro — e Snug salva i tuoi segnalibri direttamente nella cartella Download, nei formati che scegli. La Conservazione tiene solo i backup più recenti e una notifica ti avvisa se uno fallisce. I nomi dei file possono includere automaticamente data e ora.

Snug funziona interamente sul tuo dispositivo — nessun account, nessun cloud, nessun server. Ogni operazione legge e scrive direttamente nei segnalibri del tuo browser, ed è tutta la storia della fiducia. L'albero dei segnalibri funziona interamente con tastiera e screen reader, e Snug parla 10 lingue.
```

#### Korean (ko)

Description (620 chars):

```text
Snug는 북마크를 브라우저 사이에서 있는 그대로 옮겨 줘요. 어디로도 전송되지 않고 계정도 필요 없어요.

북마크 전체 또는 선택한 폴더만 HTML이나 JSON 같은 일반적인 형식으로 내보낼 수 있어요. 다른 북마크 관리 도구의 파일이나 브라우저의 북마크 파일을 가져올 수 있고, 먼저 미리 보기로 확인해요. 그런 다음 기존 북마크와 병합할지, 완전히 교체할지, 새 폴더에 모두 담을지 매번 직접 선택해요.

교체하기 전에 Snug가 북마크의 안전 스냅샷을 저장하므로 실행 취소할 수 있어요. 중복 페이지에서는 중복된 북마크를 찾아 선택한 것만 삭제하고, 가져올 때 중복을 건너뛸 수도 있어요.

일정을 한 번만 설정하면 매시간, 매일, 매주 등 원하는 주기로 선택한 형식의 백업이 다운로드 폴더에 자동으로 저장돼요. 보존 설정으로 최신 백업만 남기고, 백업이 실패하면 알림으로 알려 드려요. 파일 이름에 날짜와 시간을 자동으로 넣을 수 있어요.

Snug는 모든 작업이 기기 안에서만 이루어져요. 계정도, 클라우드도, 서버도 없어요. 모든 작업은 브라우저 자체의 북마크를 직접 읽고 쓸 뿐이고, 그게 신뢰의 전부예요. 북마크 트리는 키보드와 화면 낭독기로 완전히 사용할 수 있고, 10개 언어를 지원해요.
```

### Category and search terms

Category:

```text
Productivity
```

Search terms (7 terms, 14 words; limit 7 terms and 21 words in total). Enter one
per line:

```text
bookmark export
bookmark import
bookmark backup
bookmark manager
export bookmarks html
backup bookmarks
bookmarks
```

### Fields shared by all languages

Website URL:

```text
https://snug.andryore.dev/
```

Support URL:

```text
https://github.com/AndryOre/snug/issues
```

Privacy policy URL (Properties page):

```text
https://snug.andryore.dev/privacy/
```

Mature content: off (unchanged).

Promo video: none for Edge (leave empty).

## Graphic assets

| Asset       | Size     | Source                                                              | Notes                                          |
| ----------- | -------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Logo        | 300x300  | [`assets/edge-logo-300.png`](../assets/edge-logo-300.png)           | Generated by `bun run brand:export`. Required. |
| Screenshots | 1280x800 | [`screenshots.md`](../screenshots.md)                               | Up to 6. Use the five global English slides.   |
| Small tile  | 440x280  | [`assets/small-tile-440x280.png`](../assets/small-tile-440x280.png) | Reused from the Chrome Web Store pack.         |
| Large tile  | 1400x560 | [`assets/marquee-1400x560.png`](../assets/marquee-1400x560.png)     | Reused from the Chrome Web Store marquee.      |

Per-language screenshots: Partner Center accepts a set per language. Reuse the
localized slides from `assets/screenshots/<locale>/` on each language, after the
review in the checklist (screenshot 02 shows the Import screen, which can name
other browsers).

## Privacy

### Single purpose

Single purpose description (412 chars):

```text
Snug helps people keep their bookmarks portable and safe: export, import, back up and clean up. It exports bookmarks to HTML, JSON, CSV, Markdown, OPML or XBEL files, imports them from HTML, JSON, CSV, XBEL and other browsers' bookmarks files, undoes a replace with a safety snapshot, removes duplicates the user picks, and runs scheduled backups to the Downloads folder. Everything happens on the user's device.
```

### Permission justifications

One justification per permission declared in `wxt.config.ts`: 8 in total. The
text is the Chrome Web Store text from [`../README.md`](../README.md), which
already names no browser; the `notifications` entry adds the opt-out sentence.
The code that uses each permission is listed in that file.

`bookmarks` (598 chars):

```text
Snug reads the bookmarks tree to export it and to scan for duplicates, and creates bookmarks and folders when the user imports a file. It deletes bookmarks in three cases only: the duplicates the user picks on the Duplicates page, the folders it created when the user cancels an import, and the existing bookmarks a Replace import (or Undo) overwrites, only when the user chooses it. This is the extension's core function: backing up, moving, restoring and cleaning up bookmarks. Bookmarks are only read or changed when the user starts an action, or when a backup schedule the user configured runs.
```

`favicon` (286 chars):

```text
Snug reads each bookmark's cached site icon from the browser's own favicon cache to show it next to the bookmark in the folder picker and, when the user turns the option on, to embed it in exported files. Icons come from the browser cache, so no request is made to the bookmarked sites.
```

`storage` (506 chars):

```text
Snug stores the user's own settings on their device: theme, export options, the filename template, the last export format, and the backup schedule with its last and next run times, and two timestamps for a one-time review prompt (when it became available and when it was dismissed). Before a "Restore — replace" import it also keeps the latest five safety snapshots of the bookmarks bar and other bookmarks, so an import can be undone. That is bookmark content, stored locally only. Nothing is synced or sent anywhere.
```

`unlimitedStorage` (346 chars):

```text
Before a "Restore — replace" import, Snug saves a safety snapshot of the user's bookmarks bar and other bookmarks in extension storage, so the import can be undone. The user can also take one from Settings. A large bookmark library can exceed the default storage quota, so this permission lifts it. Only the latest five snapshots are kept, they stay on the device, and nothing is sent anywhere.
```

`alarms` (267 chars):

```text
Snug uses one alarm to run the backup schedule the user configured, for example hourly, daily or weekly. The alarm wakes the extension at the chosen time so it can export bookmarks to the Downloads folder. There is no alarm unless the user turns scheduled backups on.
```

`downloads` (373 chars):

```text
Snug uses the downloads API to save scheduled backups and "Export now" runs to the user's Downloads folder, in a configurable subfolder. When the user turns on Retention, it also removes the oldest backup files that Snug itself saved, and nothing else, so only the latest ones remain. It only downloads files that Snug generated on the device from the user's own bookmarks.
```

`offscreen` (307 chars):

```text
Snug creates a short-lived offscreen document to turn an exported bookmark file into a Blob URL, because a service worker cannot create one and a data URL is too large for big bookmark libraries. The document is created for the download and closed when it finishes. It has no UI and loads no remote content.
```

`notifications` (323 chars):

```text
Snug shows one notification when a scheduled backup fails, so the user finds out that a backup did not happen. Clicking it opens the Auto-export page. There is no other notification, and none is shown when backups succeed. The user can turn this notification off in the Auto-export settings and the extension keeps working.
```

### Other privacy fields

| Field           | Value                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Remote code     | No, I am not using remote code.                                                                 |
| Data usage      | Check no data categories. Snug collects none.                                                   |
| Certification 1 | I do not sell or transfer user data to third parties, outside of the approved use cases.        |
| Certification 2 | I do not use or transfer user data for purposes that are unrelated to my item's single purpose. |
| Certification 3 | I do not use or transfer user data to determine creditworthiness or for lending purposes.       |

Tick all three certifications. The extension makes no network calls and has no
analytics code.

## Certification notes

Paste into the "Notes for certification" field. Plain text, no browser names
other than Edge.

```text
Test steps (no account or login is needed, everything is local):
1. Click the Snug toolbar icon. The popup offers "Export everything" in one click.
2. Open the Export page from the popup. Pick a folder in the tree, choose a format (HTML, JSON, CSV, Markdown, OPML or XBEL) and click Export. A file is saved to Downloads.
3. Open the Import page. Choose a bookmarks file (an HTML export from step 2 works). A preview is shown first. Choose Merge, Replace or New folder, then confirm. Nothing changes until you confirm.
4. After a Replace import, use Undo to restore the previous bookmarks from the safety snapshot.
5. Open the Duplicates page. It lists repeated bookmarks. Only the ones you tick are deleted.
6. Open Auto-export, turn it on and pick a schedule. Use "Export now" to run one backup immediately.

Policy 1.1.8: every change to the user's bookmarks or favorites is started by the user. Imports, Replace, Undo and duplicate removal run only after an explicit click and confirmation. The only automatic action is a backup schedule the user turned on, and it only writes files to Downloads. It never changes bookmarks.

Policy 1.9: the only notification is one shown when a scheduled backup fails. It can be turned off with the "Failure notification" switch in the Auto-export settings, and the extension keeps working with it off. No notification is shown when backups succeed.

Snug makes no network requests and loads no remote code. All data stays on the device.
```

## Pre-submit checklist

1. **Confirm `main` is green.** `bun run check` and `bun run test` pass.
2. **Edge build.** Build the Edge zip (`wxt zip -b edge`, added by AO-1535) and
   confirm its manifest `name` is `Snug: Bookmark Export, Import & Backup` and
   its `description` and in-app strings name no other browser. Today the Chrome
   build's `extensionDescription`, the Import screen strings and the review
   prompt mention Chrome and Safari; AO-1534 owns the Edge-specific copy.
3. **Screenshots.** Open each global slide and each localized slide you plan to
   upload. Screenshot 02 (Import) can show source names such as "Chrome
   Bookmarks files". Re-capture or skip any slide that names another browser.
4. **Logo.** `assets/edge-logo-300.png` is generated (300x300 PNG). Regenerate
   with `bun run brand:export` if the brand mark changes.
5. **Partner Center, existing product (Store ID `0RDCK9J6Z4VS`).** Do not create
   a new product. Open the product, start an update.
6. **Properties page.** Category Productivity, privacy policy URL, mature
   content off.
7. **Availability page.** Free, public, all markets (confirm unchanged).
8. **Packages page.** Upload the Edge zip. Confirm the 8 permissions are
   detected.
9. **Store listings page, per language.** Add each locale and paste its
   description, then the search terms, website URL, support URL, logo,
   screenshots, small tile and large tile:
   - [ ] `en` (default)
   - [ ] `es`
   - [ ] `pt_BR`
   - [ ] `fr`
   - [ ] `de`
   - [ ] `ja`
   - [ ] `zh_CN`
   - [ ] `ru`
   - [ ] `it`
   - [ ] `ko`
10. **Privacy and certification.** Single purpose, 8 justifications, remote code
    No, no data categories, three certifications, then the certification notes.
11. **Submit**, then watch for a certification result. Expect the permission
    increase prompt for the 694 current users after publication.
12. **After publication.** Re-fetch the product details URL above and confirm
    the new name, version and URLs.
