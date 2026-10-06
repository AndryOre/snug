# Landing page content v1 (all ten locales)

Copy for every section of the one-page landing at `snug.andryore.dev`. This
document is content only: it does not decide layout, visuals or components.

- **Source of truth:** English. Every other locale is adapted for meaning, not
  mirrored. Spanish is neutral Latin American (tú, no voseo). The other eight
  (DE, FR, IT, JA, KO, PT_BR, RU, ZH_CN) follow the register of their store
  listing in `docs/store/listings/`.
- **Product terms:** Auto-export, Safety snapshot, Retention, Skip duplicates,
  Duplicates, Preview, Merge and Replace use the labels in
  `apps/extension/locales/<locale>.json`. Where the store listing and the locale
  file differ, the locale file wins, because the page must say what the product
  says.
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
Social proof, 7 FAQ, 8 Final call to action and footer, 9 Search metadata.

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

### DE

- **Eyebrow:** Lesezeichen exportieren, importieren und sichern
- **Headline:** Nimm deine Lesezeichen mit. Nichts verlässt dein Gerät.
- **Subheadline:** Snug exportiert, importiert und sichert deine Lesezeichen in
  Chrome und anderen Chromium-Browsern. Es stellt keine Netzwerkverbindungen her
  und braucht kein Konto.
- **Primary button:** Zu Chrome hinzufügen
- **Under the button:** Kostenlos. Open Source. Funktioniert in Chrome, Edge,
  Brave und Opera.
- **Secondary link:** Quellcode auf GitHub ansehen

### FR

- **Eyebrow:** Exportation, importation et sauvegarde de favoris
- **Headline:** Emportez vos favoris. Rien ne quitte votre appareil.
- **Subheadline:** Snug exporte, importe et sauvegarde vos favoris dans Chrome
  et d'autres navigateurs Chromium. Il ne fait aucun appel réseau et n'exige
  aucun compte.
- **Primary button:** Ajouter à Chrome
- **Under the button:** Gratuit. Open source. Fonctionne dans Chrome, Edge,
  Brave et Opera.
- **Secondary link:** Voir le code source sur GitHub

### IT

- **Eyebrow:** Esportazione, importazione e backup dei segnalibri
- **Headline:** Porta con te i tuoi segnalibri. Niente lascia il tuo
  dispositivo.
- **Subheadline:** Snug esporta, importa e fa il backup dei tuoi segnalibri in
  Chrome e in altri browser Chromium. Non effettua chiamate di rete e non
  richiede alcun account.
- **Primary button:** Aggiungi a Chrome
- **Under the button:** Gratis. Open source. Funziona in Chrome, Edge, Brave e
  Opera.
- **Secondary link:** Vedi il codice sorgente su GitHub

### JA

- **Eyebrow:** ブックマークの書き出し、読み込み、バックアップ
- **Headline:** ブックマークをそのまま移せます。データは端末の外に出ません。
- **Subheadline:**
  Snug は、Chrome などの Chromium ベースのブラウザーで、ブックマークの書き出し、読み込み、バックアップを行います。ネットワーク通信は行わず、アカウントも不要です。
- **Primary button:** Chrome に追加
- **Under the button:**
  無料。オープンソース。Chrome、Edge、Brave、Opera で使えます。
- **Secondary link:** GitHub でソースコードを見る

### KO

- **Eyebrow:** 북마크 내보내기, 가져오기, 백업
- **Headline:** 북마크를 그대로 옮기세요. 기기 밖으로는 아무것도 나가지 않아요.
- **Subheadline:** Snug는 Chrome과 다른 Chromium 기반 브라우저에서 북마크를
  내보내고, 가져오고, 백업해요. 네트워크 호출을 하지 않고 계정도 필요 없어요.
- **Primary button:** Chrome에 추가
- **Under the button:** 무료. 오픈 소스. Chrome, Edge, Brave, Opera에서
  작동해요.
- **Secondary link:** GitHub에서 소스 코드 보기

### PT_BR

- **Eyebrow:** Exportação, importação e backup de favoritos
- **Headline:** Leve seus favoritos com você. Nada sai do seu dispositivo.
- **Subheadline:** O Snug exporta, importa e faz backup dos seus favoritos no
  Chrome e em outros navegadores baseados em Chromium. Não faz chamadas de rede
  e não precisa de conta.
- **Primary button:** Usar no Chrome
- **Under the button:** Grátis. Código aberto. Funciona no Chrome, Edge, Brave e
  Opera.
- **Secondary link:** Ver o código-fonte no GitHub

### RU

- **Eyebrow:** Экспорт, импорт и резервные копии закладок
- **Headline:** Переносите закладки с собой. Ничего не покидает ваше устройство.
- **Subheadline:** Snug экспортирует, импортирует и резервирует ваши закладки в
  Chrome и других браузерах на Chromium. Он не обращается к сети и не требует
  аккаунта.
- **Primary button:** Установить в Chrome
- **Under the button:** Бесплатно. Открытый код. Работает в Chrome, Edge, Brave
  и Opera.
- **Secondary link:** Смотреть исходный код на GitHub

### ZH_CN

- **Eyebrow:** 书签导出、导入与备份
- **Headline:** 带上你的书签。任何内容都不会离开你的设备。
- **Subheadline:**
  Snug 可在 Chrome 和其他基于 Chromium 的浏览器中导出、导入和备份书签。它不发起任何网络请求，也无需账号。
- **Primary button:** 添加至 Chrome
- **Under the button:** 免费。开源。适用于 Chrome、Edge、Brave 和 Opera。
- **Secondary link:** 在 GitHub 上查看源代码

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

### DE

- **Heading:** Eine Erweiterung ohne Server, dem du vertrauen musst
- **Intro:** Snug liest und schreibt den Lesezeichenbaum deines Browsers, auf
  deinem Gerät. Es verbindet sich mit nichts, deshalb können deine Lesezeichen
  nirgendwohin gelangen.
- **Point 1, Keine Netzwerkaufrufe:** Snug macht keine. Jeder Export und Import
  läuft lokal.
- **Point 2, Kein Konto:** Du musst dich nirgends registrieren oder anmelden.
- **Point 3, Open Source:** Der Code ist öffentlich. Lies ihn, oder sieh dir die
  OpenSSF-Scorecard- und Best-Practices-Badges des Projekts, die CodeQL-Scans
  und die CI-Läufe an.
- **Why access to all bookmarks:** Lesezeichen zu lesen und zu schreiben ist die
  einzige Möglichkeit, wie eine Erweiterung sie exportieren und importieren
  kann. Snug tut das und sonst nichts.
- **Links:** Quellcode, OpenSSF Scorecard, OpenSSF Best Practices, CI-Status,
  Datenschutzerklärung

### FR

- **Heading:** Une extension sans serveur à qui faire confiance
- **Intro:** Snug lit et écrit l'arborescence de favoris de votre propre
  navigateur, sur votre appareil. Il ne se connecte à rien, vos favoris n'ont
  donc nulle part où aller.
- **Point 1, Aucun appel réseau:** Snug n'en fait aucun. Chaque exportation et
  chaque importation se fait en local.
- **Point 2, Aucun compte:** Il n'y a rien à créer et aucune connexion à
  effectuer.
- **Point 3, Open source:** Le code est public. Lisez-le, ou consultez les
  badges OpenSSF Scorecard et Best Practices du projet, les analyses CodeQL et
  les exécutions de CI.
- **Why access to all bookmarks:** Lire et écrire vos favoris est le seul moyen
  pour une extension de les exporter et de les importer. Snug fait cela et rien
  d'autre.
- **Links:** Code source, OpenSSF Scorecard, OpenSSF Best Practices, statut de
  la CI, Politique de confidentialité

### IT

- **Heading:** Un'estensione senza un server di cui fidarsi
- **Intro:** Snug legge e scrive l'albero dei segnalibri del tuo browser, sul
  tuo dispositivo. Non si connette a nulla, quindi i tuoi segnalibri non hanno
  dove andare.
- **Point 1, Nessuna chiamata di rete:** Snug non ne fa. Ogni esportazione e
  importazione avviene in locale.
- **Point 2, Nessun account:** Non c'è niente a cui registrarsi né dove
  accedere.
- **Point 3, Open source:** Il codice è pubblico. Leggilo, oppure controlla i
  badge OpenSSF Scorecard e Best Practices del progetto, le scansioni CodeQL e
  le esecuzioni della CI.
- **Why access to all bookmarks:** Leggere e scrivere i tuoi segnalibri è
  l'unico modo in cui un'estensione può esportarli e importarli. Snug fa questo
  e nient'altro.
- **Links:** Codice sorgente, OpenSSF Scorecard, OpenSSF Best Practices, stato
  della CI, Informativa sulla privacy

### JA

- **Heading:** 信頼すべきサーバーのない拡張機能
- **Intro:**
  Snug は、お使いのブラウザー自身のブックマークツリーを端末上で読み書きします。どこにも接続しないので、ブックマークの行き先がありません。
- **Point 1, ネットワーク通信なし:**
  Snug は一切行いません。書き出しも読み込みもすべて端末内で完結します。
- **Point 2, アカウント不要:** 登録もログインも必要ありません。
- **Point 3, オープンソース:**
  コードは公開されています。コードを読むか、プロジェクトの OpenSSF
  Scorecard と Best
  Practices のバッジ、CodeQL のスキャン、CI の実行結果を確認できます。
- **Why access to all bookmarks:**
  ブックマークを読み書きすることが、拡張機能がそれらを書き出し・読み込みできる唯一の方法です。Snug はそれ以外のことはしません。
- **Links:** ソースコード、OpenSSF Scorecard、OpenSSF Best
  Practices、CI のステータス、プライバシーポリシー

### KO

- **Heading:** 믿어야 할 서버가 없는 확장 프로그램
- **Intro:** Snug는 기기에서 브라우저 자체의 북마크 트리를 읽고 써요. 어디에도
  연결하지 않으니 북마크가 갈 곳이 없어요.
- **Point 1, 네트워크 호출 없음:** Snug는 하지 않아요. 내보내기와 가져오기는
  모두 기기 안에서 이루어져요.
- **Point 2, 계정 없음:** 가입하거나 로그인할 것이 없어요.
- **Point 3, 오픈 소스:** 코드가 공개되어 있어요. 직접 읽어 보거나, 프로젝트의
  OpenSSF Scorecard 및 Best Practices 배지, CodeQL 검사, CI 실행 기록을 확인해
  보세요.
- **Why access to all bookmarks:** 북마크를 읽고 쓰는 것이 확장 프로그램이
  북마크를 내보내고 가져올 수 있는 유일한 방법이에요. Snug는 그것만 해요.
- **Links:** 소스 코드, OpenSSF Scorecard, OpenSSF Best Practices, CI 상태,
  개인정보처리방침

### PT_BR

- **Heading:** Uma extensão sem servidor em que confiar
- **Intro:** O Snug lê e grava a árvore de favoritos do seu próprio navegador,
  no seu dispositivo. Ele nunca se conecta a nada, então seus favoritos não têm
  para onde ir.
- **Point 1, Sem chamadas de rede:** O Snug não faz nenhuma. Toda exportação e
  importação acontece localmente.
- **Point 2, Sem conta:** Não há nada para cadastrar nem onde fazer login.
- **Point 3, Código aberto:** O código é público. Leia-o, ou confira os selos
  OpenSSF Scorecard e Best Practices do projeto, as varreduras do CodeQL e as
  execuções de CI.
- **Why access to all bookmarks:** Ler e gravar seus favoritos é a única forma
  de uma extensão exportá-los e importá-los. O Snug faz isso e nada além.
- **Links:** Código-fonte, OpenSSF Scorecard, OpenSSF Best Practices, status da
  CI, Política de Privacidade

### RU

- **Heading:** Расширение без сервера, которому нужно доверять
- **Intro:** Snug читает и записывает дерево закладок вашего браузера на вашем
  устройстве. Он ни к чему не подключается, поэтому вашим закладкам некуда
  уходить.
- **Point 1, Нет обращений к сети:** Snug их не делает. Каждый экспорт и импорт
  выполняется локально.
- **Point 2, Нет аккаунта:** Не нужно ни регистрироваться, ни входить.
- **Point 3, Открытый код:** Код общедоступен. Прочитайте его или проверьте
  значки OpenSSF Scorecard и Best Practices проекта, проверки CodeQL и запуски
  CI.
- **Why access to all bookmarks:** Чтобы экспортировать и импортировать
  закладки, расширению нужно их читать и записывать, другого способа нет. Snug
  делает только это.
- **Links:** Исходный код, OpenSSF Scorecard, OpenSSF Best Practices, статус CI,
  Политика конфиденциальности

### ZH_CN

- **Heading:** 无需信任任何服务器的扩展程序
- **Intro:**
  Snug 在你的设备上读写浏览器自带的书签树。它从不连接任何地方，所以你的书签无处可去。
- **Point 1, 无网络请求:** Snug 不发起任何网络请求。每次导出和导入都在本地完成。
- **Point 2, 无需账号:** 无需注册，也无需登录。
- **Point 3, 开源:** 代码是公开的。你可以直接阅读，也可以查看项目的 OpenSSF
  Scorecard 和 Best Practices 徽章、CodeQL 扫描以及 CI 运行记录。
- **Why access to all bookmarks:**
  读写书签是扩展程序导出和导入书签的唯一方式。Snug 只做这件事。
- **Links:** 源代码、OpenSSF Scorecard、OpenSSF Best
  Practices、CI 状态、隐私政策

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

### DE

- **Heading:** Was Snug kann

1. **Exportiere, was du willst**
   - Exportiere den ganzen Baum oder nur die Ordner, die du auswählst, als HTML,
     JSON, CSV, Markdown, OPML oder XBEL. Dateinamen können das Datum enthalten,
     damit du sie später unterscheiden kannst.
2. **Vorschau vor dem Import**
   - Importiere HTML-, JSON-, CSV- oder XBEL-Dateien, eine `Bookmarks`-Datei
     eines Chrome-Profils oder einen Safari-Export mit Favoriten und Leseliste.
     Snug erkennt das Format und zeigt eine Vorschau. Dann führst du zusammen,
     ersetzt oder legst alles in einem neuen Ordner ab.
3. **Ersetzen rückgängig machen**
   - Vor dem Ersetzen speichert Snug einen Sicherheits-Snapshot. Entspricht das
     Ergebnis nicht deinen Vorstellungen, stellst du ihn wieder her.
4. **Duplikate bereinigen**
   - Eine Seite Duplikate findet doppelte Lesezeichen. Beim Import lässt
     Duplikate überspringen die URLs aus, die du schon hast.
5. **Nach Zeitplan sichern**
   - Auto-Export speichert deine Lesezeichen nach einem Zeitplan, den du
     festlegst, im Download-Ordner. Aufbewahrung behält nur die neuesten
     Dateien, und bei einem fehlgeschlagenen Lauf kannst du dich benachrichtigen
     lassen.
6. **Funktioniert, wo du bist**
   - Chrome, Edge, Brave, Opera und andere Chromium-Browser. Die Oberfläche gibt
     es in 10 Sprachen, und sie folgt dem Design und der Sprache deines
     Browsers.

### FR

- **Heading:** Ce que fait Snug

1. **Exportez ce que vous choisissez**
   - Exportez toute l'arborescence ou seulement les dossiers que vous
     sélectionnez, en HTML, JSON, CSV, Markdown, OPML ou XBEL. Les noms de
     fichier peuvent inclure la date, pour les distinguer plus tard.
2. **Aperçu avant l'import**
   - Importez des fichiers HTML, JSON, CSV ou XBEL, un fichier `Bookmarks` de
     profil Chrome, ou un export Safari avec les Favoris et la Liste de lecture.
     Snug détecte le format et affiche un aperçu. Vous fusionnez ensuite,
     remplacez, ou ajoutez tout dans un nouveau dossier.
3. **Annulez un remplacement**
   - Avant de remplacer, Snug enregistre un instantané de sécurité. Si le
     résultat ne vous convient pas, restaurez-le.
4. **Nettoyez les doublons**
   - Une page Doublons repère les favoris en double. À l'import, Ignorer les
     doublons laisse de côté les URL que vous avez déjà.
5. **Sauvegardez selon un horaire**
   - L'exportation automatique enregistre vos favoris dans le dossier
     Téléchargements selon l'horaire que vous définissez. La Rétention ne garde
     que les fichiers les plus récents, et vous pouvez recevoir une notification
     si une exécution échoue.
6. **Fonctionne où vous êtes**
   - Chrome, Edge, Brave, Opera et d'autres navigateurs Chromium. L'interface
     existe en 10 langues et suit le thème et la langue de votre navigateur.

### IT

- **Heading:** Cosa fa Snug

1. **Esporta ciò che scegli**
   - Esporta l'intero albero o solo le cartelle che selezioni, in HTML, JSON,
     CSV, Markdown, OPML o XBEL. I nomi dei file possono includere la data, così
     li distingui più avanti.
2. **Anteprima prima di importare**
   - Importa file HTML, JSON, CSV o XBEL, un file `Bookmarks` di un profilo
     Chrome oppure un'esportazione di Safari con Preferiti e Lista di lettura.
     Snug rileva il formato e mostra un'anteprima. Poi unisci, sostituisci o
     aggiungi tutto a una nuova cartella.
3. **Annulla una sostituzione**
   - Prima di sostituire, Snug salva un'istantanea di sicurezza. Se il risultato
     non è quello che volevi, ripristinala.
4. **Elimina i duplicati**
   - Una pagina Duplicati trova i segnalibri ripetuti. In importazione, Salta i
     duplicati lascia fuori gli URL che hai già.
5. **Backup programmato**
   - L'esportazione automatica salva i tuoi segnalibri nella cartella Download
     con la pianificazione che imposti. La Conservazione tiene solo i file più
     recenti e puoi ricevere una notifica se un'esecuzione fallisce.
6. **Funziona dove sei**
   - Chrome, Edge, Brave, Opera e altri browser Chromium. L'interfaccia è in 10
     lingue e segue il tema e la lingua del tuo browser.

### JA

- **Heading:** Snug でできること

1. **選んだものを書き出す**
   - ツリー全体、または選んだフォルダーだけを、HTML、JSON、CSV、Markdown、OPML、XBEL で書き出せます。ファイル名に日付を含められるので、あとで見分けられます。
2. **読み込む前にプレビュー**
   - HTML、JSON、CSV、XBEL のファイル、Chrome プロファイルの `Bookmarks`
     ファイル、お気に入りとリーディングリストを含む Safari の書き出しファイルを読み込めます。Snug が形式を検出してプレビューを表示します。そのあと、統合する、置き換える、すべてを新しいフォルダーに追加する、のいずれかを選びます。
3. **置き換えを元に戻す**
   - 置き換える前に、Snug は安全スナップショットを保存します。結果が思っていたものと違ったら、復元できます。
4. **重複を整理する**
   - 「重複」ページで、重複したブックマークを見つけられます。読み込み時は「重複をスキップ」で、すでにある URL を除外します。
5. **スケジュールでバックアップ**
   - 自動書き出しは、設定したスケジュールでブックマークをダウンロードフォルダーに保存します。保持設定で最新のファイルだけを残し、実行が失敗したときは通知を受け取れます。
6. **使っている環境で動く**
   - Chrome、Edge、Brave、Opera、そのほかの Chromium ベースのブラウザーで使えます。画面は 10 言語に対応し、ブラウザーのテーマと言語に従います。

### KO

- **Heading:** Snug가 하는 일

1. **원하는 것만 내보내기**
   - 전체 트리 또는 선택한 폴더만 HTML, JSON, CSV, Markdown, OPML, XBEL로
     내보내요. 파일 이름에 날짜를 넣을 수 있어서 나중에 구분하기 쉬워요.
2. **가져오기 전에 미리보기**
   - HTML, JSON, CSV, XBEL 파일, Chrome 프로필의 `Bookmarks` 파일, 즐겨찾기와
     읽기 목록이 들어 있는 Safari 내보내기 파일을 가져와요. Snug가 형식을
     감지해서 미리보기를 보여 줘요. 그런 다음 병합하거나, 교체하거나, 모두 새
     폴더에 추가해요.
3. **교체 되돌리기**
   - 교체하기 전에 Snug가 안전 스냅샷을 저장해요. 결과가 마음에 들지 않으면
     복원하세요.
4. **중복 정리하기**
   - 중복 페이지에서 반복된 북마크를 찾아요. 가져올 때 중복 건너뛰기를 켜면 이미
     있는 URL은 제외해요.
5. **일정에 맞춰 백업하기**
   - 자동 내보내기는 정한 일정에 따라 북마크를 다운로드 폴더에 저장해요. 보존
     설정은 최신 파일만 남기고, 실행이 실패하면 알림을 받을 수 있어요.
6. **어디서든 작동해요**
   - Chrome, Edge, Brave, Opera와 다른 Chromium 기반 브라우저에서 작동해요.
     인터페이스는 10개 언어를 지원하고 브라우저의 테마와 언어를 따라요.

### PT_BR

- **Heading:** O que o Snug faz

1. **Exporte o que escolher**
   - Exporte a árvore inteira ou só as pastas que escolher, em HTML, JSON, CSV,
     Markdown, OPML ou XBEL. Os nomes de arquivo podem incluir a data, para você
     distingui-los depois.
2. **Pré-visualização antes de importar**
   - Importe arquivos HTML, JSON, CSV ou XBEL, um arquivo `Bookmarks` de perfil
     do Chrome ou uma exportação do Safari com Favoritos e Lista de Leitura. O
     Snug detecta o formato e mostra uma pré-visualização. Depois você mescla,
     substitui ou adiciona tudo a uma pasta nova.
3. **Desfaça uma substituição**
   - Antes de substituir, o Snug salva um instantâneo de segurança. Se o
     resultado não for o que você queria, restaure-o.
4. **Limpe duplicados**
   - Uma página Duplicados encontra favoritos repetidos. Na importação, Ignorar
     duplicados deixa de fora as URLs que você já tem.
5. **Faça backup com agendamento**
   - A exportação automática salva seus favoritos na pasta Downloads no
     agendamento que você definir. A Retenção mantém só os arquivos mais
     recentes, e você pode receber um aviso se uma execução falhar.
6. **Funciona onde você está**
   - Chrome, Edge, Brave, Opera e outros navegadores baseados em Chromium. A
     interface está em 10 idiomas e segue o tema e o idioma do seu navegador.

### RU

- **Heading:** Что умеет Snug

1. **Экспортируйте то, что выбрали**
   - Экспортируйте всё дерево или только выбранные папки в HTML, JSON, CSV,
     Markdown, OPML или XBEL. В имена файлов можно добавить дату, чтобы потом их
     различать.
2. **Предпросмотр перед импортом**
   - Импортируйте файлы HTML, JSON, CSV или XBEL, файл `Bookmarks` профиля
     Chrome или экспорт Safari с Избранным и Списком для чтения. Snug определяет
     формат и показывает предпросмотр. Затем вы объединяете, заменяете или
     добавляете всё в новую папку.
3. **Отмените замену**
   - Перед заменой Snug сохраняет страховой снимок. Если результат вас не
     устроил, восстановите его.
4. **Уберите дубликаты**
   - Страница «Дубликаты» находит повторяющиеся закладки. При импорте
     «Пропускать дубликаты» не добавляет URL, которые у вас уже есть.
5. **Резервные копии по расписанию**
   - Автоэкспорт сохраняет закладки в папку «Загрузки» по заданному вами
     расписанию. Хранение оставляет только самые новые файлы, а при сбое запуска
     можно получить уведомление.
6. **Работает там, где вы**
   - Chrome, Edge, Brave, Opera и другие браузеры на Chromium. Интерфейс
     доступен на 10 языках и следует теме и языку вашего браузера.

### ZH_CN

- **Heading:** Snug 能做什么

1. **导出你选择的内容**
   - 导出整个书签树或你选中的文件夹，格式可选 HTML、JSON、CSV、Markdown、OPML 或 XBEL。文件名可包含日期，方便日后区分。
2. **导入前先预览**
   - 可导入 HTML、JSON、CSV 或 XBEL 文件、Chrome 配置文件的 `Bookmarks`
     文件，或包含个人收藏和阅读列表的 Safari 导出文件。Snug 会检测格式并显示预览。然后你可以合并、替换，或把全部内容添加到一个新文件夹。
3. **撤销替换**
   - 替换前，Snug 会先保存安全快照。如果结果不是你想要的，可以恢复。
4. **清理重复项**
   - “重复项”页面可找出重复的书签。导入时，“跳过重复项”会略过你已有的 URL。
5. **定时备份**
   - 自动导出会按你设定的计划，把书签保存到下载文件夹。保留设置只留下最新的文件，某次运行失败时你可以收到通知。
6. **随处可用**
   - 适用于 Chrome、Edge、Brave、Opera 和其他基于 Chromium 的浏览器。界面支持 10 种语言，并跟随浏览器的主题和语言。

Sources: Product: Capabilities and Constraints; Context: What it does, Value
themes, Glossary. The ES terms "instantánea de seguridad", "exportación
automática", "retención" and "omitir duplicados" must match the shipped
`apps/extension/locales/es.json` labels before the page ships.

---

## 4. Real interface

Captions for real screenshots of the extension. English set:
`docs/store/assets/screenshots/`, one per slide in
[`docs/store/screenshots.md`](../store/screenshots.md). Each locale page uses
its own set (`es/`, `de/`, `fr/`, `it/`, `ja/`, `ko/`, `pt_BR/`, `ru/`,
`zh_CN/`). Captions describe what the screenshot shows.

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

### DE

| Image                | Caption                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `01-export.png`      | Exportseite: Ordner aus dem Baum wählen, Format festlegen, exportieren.                         |
| `02-import.png`      | Importvorschau: sehen, was sich ändert, dann Zusammenführen, Ersetzen oder neuer Ordner wählen. |
| `03-auto-export.png` | Auto-Export: täglich, in HTML, JSON und Markdown, mit dem nächsten Lauf.                        |
| `04-popup.png`       | Das Popup in der Symbolleiste exportiert alles mit einem Klick.                                 |

### FR

| Image                | Caption                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Page d'exportation : choisissez des dossiers dans l'arborescence, un format, puis exportez.             |
| `02-import.png`      | Aperçu de l'import : voyez ce qui change, puis choisissez fusionner, remplacer ou nouveau dossier.      |
| `03-auto-export.png` | Exportation automatique : chaque jour, en HTML, JSON et Markdown, avec la prochaine exécution affichée. |
| `04-popup.png`       | La fenêtre de la barre d'outils exporte tout en un clic.                                                |

### IT

| Image                | Caption                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Pagina di esportazione: scegli le cartelle dall'albero, un formato ed esporta.                       |
| `02-import.png`      | Anteprima di importazione: vedi cosa cambia, poi scegli unisci, sostituisci o nuova cartella.        |
| `03-auto-export.png` | Esportazione automatica: ogni giorno, in HTML, JSON e Markdown, con la prossima esecuzione in vista. |
| `04-popup.png`       | Il popup nella barra degli strumenti esporta tutto con un clic.                                      |

### JA

| Image                | Caption                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `01-export.png`      | 書き出しページ：ツリーからフォルダーを選び、形式を選んで書き出します。               |
| `02-import.png`      | 読み込みプレビュー：変更内容を確認し、統合、置き換え、新しいフォルダーから選びます。 |
| `03-auto-export.png` | 自動書き出し：毎日、HTML、JSON、Markdown で。次回の実行も表示されます。              |
| `04-popup.png`       | ツールバーのポップアップから、ワンクリックですべてを書き出せます。                   |

### KO

| Image                | Caption                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `01-export.png`      | 내보내기 페이지: 트리에서 폴더를 고르고, 형식을 선택해 내보내요.               |
| `02-import.png`      | 가져오기 미리보기: 무엇이 바뀌는지 확인하고 병합, 교체, 새 폴더 중에서 골라요. |
| `03-auto-export.png` | 자동 내보내기: 매일, HTML, JSON, Markdown으로, 다음 실행 시각도 표시돼요.      |
| `04-popup.png`       | 툴바 팝업은 클릭 한 번으로 모두 내보내요.                                      |

### PT_BR

| Image                | Caption                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `01-export.png`      | Página de exportação: escolha pastas da árvore, um formato e exporte.                        |
| `02-import.png`      | Pré-visualização da importação: veja o que muda e escolha mesclar, substituir ou pasta nova. |
| `03-auto-export.png` | Exportação automática: diária, em HTML, JSON e Markdown, com a próxima execução à vista.     |
| `04-popup.png`       | O pop-up da barra de ferramentas exporta tudo com um clique.                                 |

### RU

| Image                | Caption                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `01-export.png`      | Страница экспорта: выберите папки в дереве и формат, затем экспортируйте.                        |
| `02-import.png`      | Предпросмотр импорта: посмотрите, что изменится, и выберите объединение, замену или новую папку. |
| `03-auto-export.png` | Автоэкспорт: ежедневно, в HTML, JSON и Markdown, с указанием следующего запуска.                 |
| `04-popup.png`       | Всплывающее окно на панели инструментов экспортирует всё одним щелчком.                          |

### ZH_CN

| Image                | Caption                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `01-export.png`      | 导出页面：从树中选择文件夹和格式，然后导出。                            |
| `02-import.png`      | 导入预览：查看将发生的更改，再选择合并、替换或新建文件夹。              |
| `03-auto-export.png` | 自动导出：每天一次，格式为 HTML、JSON 和 Markdown，并显示下次运行时间。 |
| `04-popup.png`       | 工具栏弹出窗口一键导出全部书签。                                        |

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

### DE

- **Heading:** Sieh es in Aktion
- **Caption:** Ein kurzer Durchgang: einen Ordner exportieren und mit Vorschau
  wieder importieren.
- **Click-to-load note:** Das Video wird von YouTube erst geladen, wenn du auf
  Abspielen drückst. Bis dahin nimmt die Seite zu niemandem Kontakt auf.

### FR

- **Heading:** Voyez-le en action
- **Caption:** Une courte démonstration : exporter un dossier, puis l'importer
  avec un aperçu.
- **Click-to-load note:** La vidéo ne se charge depuis YouTube que lorsque vous
  appuyez sur lecture. D'ici là, la page ne contacte personne.

### IT

- **Heading:** Guardalo in azione
- **Caption:** Un breve percorso: esportare una cartella e importarla con
  un'anteprima.
- **Click-to-load note:** Il video si carica da YouTube solo quando premi play.
  Fino ad allora la pagina non contatta nessuno.

### JA

- **Heading:** 動作を見る
- **Caption:**
  フォルダーを書き出し、プレビューつきで読み込むまでの短い紹介です。
- **Click-to-load note:**
  動画は、再生を押したときにだけ YouTube から読み込まれます。それまでページは外部と通信しません。

### KO

- **Heading:** 작동하는 모습 보기
- **Caption:** 폴더를 내보내고 미리보기와 함께 가져오는 과정을 짧게 보여 줘요.
- **Click-to-load note:** 동영상은 재생을 누를 때만 YouTube에서 불러와요. 그
  전까지 페이지는 누구와도 통신하지 않아요.

### PT_BR

- **Heading:** Veja em ação
- **Caption:** Um passo a passo curto: exportar uma pasta e importá-la com
  pré-visualização.
- **Click-to-load note:** O vídeo só carrega do YouTube quando você aperta o
  play. Até lá, a página não contata ninguém.

### RU

- **Heading:** Посмотрите в работе
- **Caption:** Короткий обзор: экспорт папки и её импорт с предпросмотром.
- **Click-to-load note:** Видео загружается с YouTube только после нажатия
  кнопки воспроизведения. До этого страница ни с кем не связывается.

### ZH_CN

- **Heading:** 看看它如何工作
- **Caption:** 简短演示：导出一个文件夹，再带预览地导入。
- **Click-to-load note:**
  视频只有在你点击播放时才会从 YouTube 加载。在此之前，页面不会联系任何人。

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

### DE

- **Heading:** Das sagen Nutzer
- **Numbers line:** 5.000 Nutzer. 4,8 Sterne bei 20 Bewertungen im Chrome Web
  Store (2026-10-05).
- **Rename note, shown with the reviews:** Das sind öffentliche Rezensionen aus
  dem Chrome Web Store, auf Englisch, wie sie veröffentlicht wurden. Die meisten
  entstanden vor der Umbenennung von Snug, als der Eintrag noch "Bookmark
  Import/Export" hieß, deshalb beschreiben sie Export und Import, nicht die
  aktuelle Oberfläche.
- **Reviews lead-in:** Vier Rezensionen, im englischen Original:
- **Link:** Alle Rezensionen im Chrome Web Store lesen

### FR

- **Heading:** Ce qu'en disent les utilisateurs
- **Numbers line:** 5 000 utilisateurs. 4,8 étoiles sur 20 notes dans le Chrome
  Web Store (2026-10-05).
- **Rename note, shown with the reviews:** Ce sont des avis publics du Chrome
  Web Store, en anglais, tels que publiés. La plupart ont été écrits avant le
  changement de nom de Snug, quand la fiche s'appelait « Bookmark Import/Export
  » ; ils décrivent donc l'export et l'import, pas l'interface actuelle.
- **Reviews lead-in:** Quatre avis, dans leur version originale en anglais :
- **Link:** Lire tous les avis dans le Chrome Web Store

### IT

- **Heading:** Cosa dicono le persone
- **Numbers line:** 5.000 utenti. 4,8 stelle su 20 valutazioni nel Chrome Web
  Store (2026-10-05).
- **Rename note, shown with the reviews:** Sono recensioni pubbliche del Chrome
  Web Store, in inglese come sono state pubblicate. La maggior parte è stata
  scritta prima che Snug cambiasse nome, quando la scheda si chiamava "Bookmark
  Import/Export", quindi descrivono l'esportazione e l'importazione, non
  l'interfaccia attuale.
- **Reviews lead-in:** Quattro recensioni, nell'originale inglese:
- **Link:** Leggi tutte le recensioni nel Chrome Web Store

### JA

- **Heading:** ユーザーの声
- **Numbers line:**
  5,000 人が利用。Chrome ウェブストアで 20 件の評価、平均 4.8 つ星（2026-10-05）。
- **Rename note, shown with the reviews:**
  Chrome ウェブストアで公開されているレビューを、掲載時の英語のまま載せています。多くは Snug の名称変更前、掲載名が「Bookmark
  Import/Export」だった時期に書かれたため、現在の画面ではなく書き出しと読み込みについて述べています。
- **Reviews lead-in:** 4 件のレビューを、英語の原文のまま掲載します。
- **Link:** Chrome ウェブストアのレビューをすべて読む

### KO

- **Heading:** 사용자 후기
- **Numbers line:** 사용자 5,000명. Chrome 웹 스토어 평점 4.8점(20개 평가,
  2026-10-05).
- **Rename note, shown with the reviews:** Chrome 웹 스토어에 공개된 후기를
  게시된 영어 그대로 실었어요. 대부분 Snug 이름이 바뀌기 전, 등록 이름이
  "Bookmark Import/Export"였을 때 작성되어서 현재 인터페이스가 아니라 내보내기와
  가져오기를 이야기해요.
- **Reviews lead-in:** 후기 4개를 영어 원문 그대로 실었어요:
- **Link:** Chrome 웹 스토어에서 후기 모두 읽기

### PT_BR

- **Heading:** O que as pessoas dizem
- **Numbers line:** 5.000 usuários. 4,8 estrelas em 20 avaliações na Chrome Web
  Store (2026-10-05).
- **Rename note, shown with the reviews:** São avaliações públicas da Chrome Web
  Store, em inglês, como foram publicadas. A maioria foi escrita antes de o Snug
  mudar de nome, quando a página se chamava "Bookmark Import/Export", então elas
  falam da exportação e da importação, não da interface atual.
- **Reviews lead-in:** Quatro avaliações, no original em inglês:
- **Link:** Ler todas as avaliações na Chrome Web Store

### RU

- **Heading:** Что говорят пользователи
- **Numbers line:** 5 000 пользователей. 4,8 звезды по 20 оценкам в Chrome Web
  Store (2026-10-05).
- **Rename note, shown with the reviews:** Это публичные отзывы из Chrome Web
  Store, на английском, как их опубликовали. Большинство написано до
  переименования Snug, когда страница называлась "Bookmark Import/Export",
  поэтому в них речь об экспорте и импорте, а не о нынешнем интерфейсе.
- **Reviews lead-in:** Четыре отзыва в английском оригинале:
- **Link:** Читать все отзывы в Chrome Web Store

### ZH_CN

- **Heading:** 用户怎么说
- **Numbers line:**
  5,000 位用户。Chrome 应用商店 20 个评分，平均 4.8 星（2026-10-05）。
- **Rename note, shown with the reviews:**
  以下是 Chrome 应用商店的公开评价，保持发布时的英文原文。大多数写于 Snug 更名之前，当时商店页面叫“Bookmark
  Import/Export”，因此它们讲的是导出和导入，而不是当前的界面。
- **Reviews lead-in:** 四条评价，保留英文原文：
- **Link:** 在 Chrome 应用商店阅读全部评价

The four reviews stay in English as published; do not translate a quote. Every
non-EN page shows the same four quotes above, unchanged, introduced by the
translated **Reviews lead-in** line (ES uses the rename note for that role). A
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

### DE

**Sendet Snug meine Lesezeichen irgendwohin?** Nein. Snug stellt keine
Netzwerkverbindungen her. Es liest und schreibt die Lesezeichen deines Browsers
auf deinem Gerät, und der Quellcode ist öffentlich, damit du es prüfen kannst.

**Brauche ich ein Konto?** Nein. Installieren und losexportieren.

**Synchronisiert es meine Lesezeichen zwischen Geräten?** Nein. Snug hat weder
Synchronisierung noch Cloud. Um Lesezeichen in einen anderen Browser oder auf
einen anderen Computer zu übertragen, exportiere eine Datei und importiere sie
dort.

**Kann ich mehrere Dateien gleichzeitig importieren?** Nein. Snug importiert
eine Datei nach der anderen. Um mehrere zu übernehmen, importiere sie
nacheinander.

**Warum braucht es Zugriff auf alle meine Lesezeichen?** Sie zu lesen und zu
schreiben ist die einzige Möglichkeit, wie eine Erweiterung sie exportieren und
importieren kann. Snug stellt keine Netzwerkverbindungen her, deshalb kann
nichts von dem, was es liest, dein Gerät verlassen.

**Mein Browser exportiert schon HTML. Wozu Snug?** Dem integrierten Export
fehlen Ordnerauswahl, Vorschau, Rückgängig, Zeitplan, Duplikatprüfung und
zusätzliche Formate. Snug bietet alle.

**Überschreibt es meine aktuellen Lesezeichen?** Nur, wenn du Ersetzen wählst.
Vorher siehst du eine Vorschau, und Ersetzen speichert einen
Sicherheits-Snapshot, den du wiederherstellen kannst.

**Welche Formate unterstützt es?** Export als HTML, JSON, CSV, Markdown, OPML
oder XBEL. Import von HTML, JSON, CSV oder XBEL, einer `Bookmarks`-Datei eines
Chrome-Profils oder einem Safari-Export.

**In welchen Browsern funktioniert es?** In Chrome und anderen Chromium-Browsern
wie Edge, Brave und Opera.

**Ist es sicher, die Erweiterung eines Einzelentwicklers zu installieren?** Der
Quellcode ist öffentlich, CodeQL scannt ihn, das Projekt hat OpenSSF-Scorecard-
und Best-Practices-Badges, und die CI läuft mit festgelegten Versionen. Urteile
selbst auf GitHub.

**Kostet Snug etwas?** Nein. Es ist kostenlos.

### FR

**Snug envoie-t-il mes favoris quelque part ?** Non. Snug ne fait aucun appel
réseau. Il lit et écrit les favoris de votre navigateur sur votre appareil, et
le code source est public pour que vous puissiez vérifier.

**Ai-je besoin d'un compte ?** Non. Installez-le et commencez à exporter.

**Synchronise-t-il mes favoris entre appareils ?** Non. Snug n'a ni
synchronisation ni cloud. Pour transférer vos favoris vers un autre navigateur
ou ordinateur, exportez un fichier et importez-le là-bas.

**Puis-je importer plusieurs fichiers à la fois ?** Non. Snug importe un fichier
à la fois. Pour en importer plusieurs, importez-les l'un après l'autre.

**Pourquoi a-t-il besoin d'accéder à tous mes favoris ?** Les lire et les écrire
est le seul moyen pour une extension de les exporter et de les importer. Snug ne
fait aucun appel réseau : rien de ce qu'il lit ne peut quitter votre appareil.

**Mon navigateur exporte déjà en HTML. Pourquoi utiliser Snug ?** L'export
intégré n'offre ni sélection de dossiers, ni aperçu, ni annulation, ni horaire,
ni détection des doublons, ni formats supplémentaires. Snug propose tout cela.

**Va-t-il écraser mes favoris actuels ?** Seulement si vous choisissez
Remplacer. Vous voyez d'abord un aperçu, et Remplacer enregistre un instantané
de sécurité que vous pouvez restaurer.

**Quels formats gère-t-il ?** Export en HTML, JSON, CSV, Markdown, OPML ou XBEL.
Import de HTML, JSON, CSV ou XBEL, d'un fichier `Bookmarks` de profil Chrome, ou
d'un export Safari.

**Dans quels navigateurs fonctionne-t-il ?** Dans Chrome et d'autres navigateurs
Chromium comme Edge, Brave et Opera.

**Est-il sûr d'installer l'extension d'un développeur indépendant ?** Le code
source est public, CodeQL l'analyse, le projet a les badges OpenSSF Scorecard et
Best Practices, et la CI utilise des versions épinglées. Jugez par vous-même sur
GitHub.

**Snug est-il payant ?** Non. Il est gratuit.

### IT

**Snug invia i miei segnalibri da qualche parte?** No. Snug non effettua
chiamate di rete. Legge e scrive i segnalibri del tuo browser sul tuo
dispositivo, e il codice sorgente è pubblico così puoi verificare.

**Mi serve un account?** No. Installalo e inizia a esportare.

**Sincronizza i miei segnalibri tra dispositivi?** No. Snug non ha
sincronizzazione né cloud. Per spostare i segnalibri su un altro browser o
computer, esporta un file e importalo lì.

**Posso importare più file alla volta?** No. Snug importa un file alla volta.
Per portarne dentro più di uno, importali uno dopo l'altro.

**Perché ha bisogno di accedere a tutti i miei segnalibri?** Leggerli e
scriverli è l'unico modo in cui un'estensione può esportarli e importarli. Snug
non effettua chiamate di rete, quindi nulla di ciò che legge può lasciare il tuo
dispositivo.

**Il mio browser esporta già in HTML. Perché usare Snug?** L'esportazione
integrata non ha selezione delle cartelle, anteprima, annullamento,
pianificazione, controllo dei duplicati né formati aggiuntivi. Snug li ha tutti.

**Sovrascriverà i miei segnalibri attuali?** Solo se scegli Sostituisci. Prima
vedi un'anteprima, e Sostituisci salva un'istantanea di sicurezza che puoi
ripristinare.

**Quali formati gestisce?** Esporta in HTML, JSON, CSV, Markdown, OPML o XBEL.
Importa HTML, JSON, CSV o XBEL, un file `Bookmarks` di un profilo Chrome oppure
un'esportazione di Safari.

**In quali browser funziona?** In Chrome e in altri browser Chromium come Edge,
Brave e Opera.

**È sicuro installare l'estensione di uno sviluppatore indipendente?** Il codice
sorgente è pubblico, CodeQL lo analizza, il progetto ha i badge OpenSSF
Scorecard e Best Practices e la CI usa versioni bloccate. Giudica tu stesso su
GitHub.

**Snug costa qualcosa?** No. È gratis.

### JA

**Snug はブックマークをどこかに送信しますか？**
いいえ。Snug はネットワーク通信を行いません。お使いのブラウザーのブックマークを端末上で読み書きするだけで、確認できるようソースコードも公開されています。

**アカウントは必要ですか？** いいえ。インストールしてすぐに書き出せます。

**デバイス間でブックマークを同期しますか？**
いいえ。Snug には同期もクラウドもありません。別のブラウザーやパソコンに移すには、ファイルを書き出して、移した先で読み込みます。

**複数のファイルを一度に読み込めますか？**
いいえ。Snug が読み込めるのは一度に 1 ファイルです。複数ある場合は、1 つずつ順に読み込みます。

**なぜすべてのブックマークへのアクセスが必要ですか？**
ブックマークを読み書きすることが、拡張機能が書き出しと読み込みを行う唯一の方法だからです。Snug はネットワーク通信を行わないので、読み取った内容が端末の外に出ることはありません。

**ブラウザーにも HTML の書き出しがあります。なぜ Snug を使うのですか？**
ブラウザー標準の書き出しには、フォルダーの選択、プレビュー、元に戻す機能、スケジュール、重複チェック、追加の形式がありません。Snug にはそのすべてがあります。

**今あるブックマークは上書きされますか？**
「置き換え」を選んだときだけです。先にプレビューが表示され、置き換えでは復元できる安全スナップショットが保存されます。

**どの形式に対応していますか？**
書き出しは HTML、JSON、CSV、Markdown、OPML、XBEL。読み込みは HTML、JSON、CSV、XBEL、Chrome プロファイルの
`Bookmarks` ファイル、Safari の書き出しファイルです。

**どのブラウザーで使えますか？**
Chrome と、Edge、Brave、Opera などの Chromium ベースのブラウザーです。

**個人開発者の拡張機能を入れても安全ですか？**
ソースコードは公開され、CodeQL がスキャンし、プロジェクトには OpenSSF
Scorecard と Best
Practices のバッジがあり、CI はバージョンを固定して実行されます。GitHub でご自身でご確認ください。

**Snug は有料ですか？** いいえ。無料です。

### KO

**Snug가 북마크를 어딘가로 보내나요?** 아니요. Snug는 네트워크 호출을 하지
않아요. 기기에서 브라우저의 북마크를 읽고 쓸 뿐이고, 직접 확인할 수 있도록 소스
코드도 공개되어 있어요.

**계정이 필요한가요?** 아니요. 설치하고 바로 내보내면 돼요.

**기기 간에 북마크를 동기화하나요?** 아니요. Snug에는 동기화도 클라우드도
없어요. 북마크를 다른 브라우저나 컴퓨터로 옮기려면 파일로 내보내서 그쪽에서
가져오세요.

**파일을 여러 개 한꺼번에 가져올 수 있나요?** 아니요. Snug는 한 번에 파일 하나만
가져와요. 여러 개를 가져오려면 하나씩 차례로 가져오세요.

**왜 모든 북마크에 접근해야 하나요?** 북마크를 읽고 쓰는 것이 확장 프로그램이
북마크를 내보내고 가져올 수 있는 유일한 방법이에요. Snug는 네트워크 호출을 하지
않으므로 읽은 내용이 기기 밖으로 나갈 수 없어요.

**브라우저도 HTML로 내보낼 수 있는데 왜 Snug를 쓰나요?** 기본 내보내기에는 폴더
선택, 미리보기, 실행 취소, 일정, 중복 확인, 추가 형식이 없어요. Snug에는 모두
있어요.

**현재 북마크를 덮어쓰나요?** 교체를 선택할 때만 그래요. 먼저 미리보기를 볼 수
있고, 교체하면 복원할 수 있는 안전 스냅샷이 저장돼요.

**어떤 형식을 지원하나요?** HTML, JSON, CSV, Markdown, OPML, XBEL로 내보내요.
HTML, JSON, CSV, XBEL, Chrome 프로필의 `Bookmarks` 파일, Safari 내보내기 파일을
가져와요.

**어떤 브라우저에서 작동하나요?** Chrome과 Edge, Brave, Opera 같은 Chromium 기반
브라우저에서 작동해요.

**1인 개발자의 확장 프로그램을 설치해도 안전한가요?** 소스 코드가 공개되어 있고,
CodeQL이 검사하고, 프로젝트에 OpenSSF Scorecard와 Best Practices 배지가 있고,
CI는 버전을 고정해 실행해요. GitHub에서 직접 판단해 보세요.

**Snug는 유료인가요?** 아니요. 무료예요.

### PT_BR

**O Snug envia meus favoritos para algum lugar?** Não. O Snug não faz chamadas
de rede. Ele lê e grava os favoritos do seu navegador no seu dispositivo, e o
código-fonte é público para você conferir.

**Preciso de uma conta?** Não. Instale e comece a exportar.

**Ele sincroniza meus favoritos entre dispositivos?** Não. O Snug não tem
sincronização nem nuvem. Para levar favoritos a outro navegador ou computador,
exporte um arquivo e importe lá.

**Posso importar vários arquivos de uma vez?** Não. O Snug importa um arquivo
por vez. Para trazer mais de um, importe um depois do outro.

**Por que ele precisa de acesso a todos os meus favoritos?** Lê-los e gravá-los
é a única forma de uma extensão exportá-los e importá-los. O Snug não faz
chamadas de rede, então nada do que ele lê pode sair do seu dispositivo.

**Meu navegador já exporta HTML. Por que usar o Snug?** A exportação integrada
não tem seleção de pastas, pré-visualização, desfazer, agendamento, verificação
de duplicados nem formatos extras. O Snug tem tudo isso.

**Ele vai sobrescrever meus favoritos atuais?** Só se você escolher Substituir.
Você vê uma pré-visualização antes, e Substituir salva um instantâneo de
segurança que você pode restaurar.

**Quais formatos ele aceita?** Exporte em HTML, JSON, CSV, Markdown, OPML ou
XBEL. Importe HTML, JSON, CSV ou XBEL, um arquivo `Bookmarks` de perfil do
Chrome ou uma exportação do Safari.

**Em quais navegadores funciona?** No Chrome e em outros navegadores baseados em
Chromium, como Edge, Brave e Opera.

**É seguro instalar a extensão de um desenvolvedor independente?** O
código-fonte é público, o CodeQL faz a varredura, o projeto tem os selos OpenSSF
Scorecard e Best Practices, e a CI usa versões fixadas. Julgue você mesmo no
GitHub.

**O Snug custa algo?** Não. É grátis.

### RU

**Отправляет ли Snug мои закладки куда-нибудь?** Нет. Snug не обращается к сети.
Он читает и записывает закладки вашего браузера на вашем устройстве, а исходный
код открыт, так что это можно проверить.

**Нужен ли аккаунт?** Нет. Установите и начинайте экспорт.

**Синхронизирует ли он закладки между устройствами?** Нет. В Snug нет ни
синхронизации, ни облака. Чтобы перенести закладки в другой браузер или на
другой компьютер, экспортируйте файл и импортируйте его там.

**Можно ли импортировать несколько файлов сразу?** Нет. Snug импортирует по
одному файлу за раз. Чтобы добавить несколько, импортируйте их друг за другом.

**Зачем ему доступ ко всем моим закладкам?** Чтобы экспортировать и
импортировать закладки, расширению нужно их читать и записывать, другого способа
нет. Snug не обращается к сети, поэтому ничто из прочитанного не может покинуть
ваше устройство.

**Мой браузер уже экспортирует HTML. Зачем Snug?** У встроенного экспорта нет
выбора папок, предпросмотра, отмены, расписания, проверки дубликатов и
дополнительных форматов. В Snug всё это есть.

**Перезапишет ли он мои текущие закладки?** Только если вы выберете «Заменить».
Сначала вы увидите предпросмотр, а замена сохраняет страховой снимок, который
можно восстановить.

**Какие форматы он поддерживает?** Экспорт в HTML, JSON, CSV, Markdown, OPML или
XBEL. Импорт HTML, JSON, CSV или XBEL, файла `Bookmarks` профиля Chrome или
экспорта Safari.

**В каких браузерах он работает?** В Chrome и других браузерах на Chromium,
например Edge, Brave и Opera.

**Безопасно ли ставить расширение независимого разработчика?** Исходный код
открыт, его проверяет CodeQL, у проекта есть значки OpenSSF Scorecard и Best
Practices, а CI работает с закреплёнными версиями. Оцените сами на GitHub.

**Сколько стоит Snug?** Ничего. Он бесплатный.

### ZH_CN

**Snug 会把我的书签发送到别处吗？**
不会。Snug 不发起任何网络请求。它在你的设备上读写浏览器的书签，源代码也是公开的，你可以自行核查。

**需要账号吗？** 不需要。安装后即可开始导出。

**它会在设备之间同步书签吗？**
不会。Snug 没有同步功能，也没有云端。要把书签转移到另一个浏览器或电脑，请导出文件，然后在那边导入。

**可以一次导入多个文件吗？**
不可以。Snug 一次导入一个文件。要导入多个，请逐个依次导入。

**为什么它需要访问我的所有书签？**
读写书签是扩展程序导出和导入书签的唯一方式。Snug 不发起网络请求，因此它读取的内容不可能离开你的设备。

**我的浏览器已经能导出 HTML，为什么还要用 Snug？**
浏览器内置的导出没有文件夹选择、预览、撤销、计划、重复项检查和额外格式。Snug 全都有。

**它会覆盖我现有的书签吗？**
只有在你选择“替换”时才会。你会先看到预览，而且替换会保存一份可恢复的安全快照。

**支持哪些格式？**
可导出为 HTML、JSON、CSV、Markdown、OPML 或 XBEL。可导入 HTML、JSON、CSV 或 XBEL、Chrome 配置文件的
`Bookmarks` 文件，或 Safari 导出文件。

**适用于哪些浏览器？**
Chrome 以及 Edge、Brave、Opera 等其他基于 Chromium 的浏览器。

**安装独立开发者的扩展程序安全吗？**
源代码是公开的，CodeQL 会对其扫描，项目有 OpenSSF Scorecard 和 Best
Practices 徽章，CI 使用固定版本运行。请到 GitHub 上自行判断。

**Snug 收费吗？** 不收费。它是免费的。

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

### DE

- **Heading:** Nimm deine Lesezeichen mit
- **Line:** Füge Snug zu Chrome hinzu und exportiere, importiere oder sichere
  mit wenigen Klicks. Kostenlos, Open Source, und nichts verlässt dein Gerät.
- **Button:** Zu Chrome hinzufügen
- **Footer links:** Quellcode auf GitHub, Datenschutzerklärung, Eintrag im
  Chrome Web Store
- **Footer note:** Snug ist Open Source unter der MIT-Lizenz.

### FR

- **Heading:** Emportez vos favoris avec vous
- **Line:** Ajoutez Snug à Chrome et exportez, importez ou sauvegardez en
  quelques clics. Gratuit, open source, et rien ne quitte votre appareil.
- **Button:** Ajouter à Chrome
- **Footer links:** Code source sur GitHub, Politique de confidentialité, Fiche
  du Chrome Web Store
- **Footer note:** Snug est open source sous licence MIT.

### IT

- **Heading:** Porta con te i tuoi segnalibri
- **Line:** Aggiungi Snug a Chrome ed esporta, importa o fai il backup in pochi
  clic. Gratis, open source, e niente lascia il tuo dispositivo.
- **Button:** Aggiungi a Chrome
- **Footer links:** Codice su GitHub, Informativa sulla privacy, Scheda del
  Chrome Web Store
- **Footer note:** Snug è open source con licenza MIT.

### JA

- **Heading:** ブックマークを持ち出そう
- **Line:**
  Snug を Chrome に追加して、数クリックで書き出し、読み込み、バックアップができます。無料でオープンソース、データは端末の外に出ません。
- **Button:** Chrome に追加
- **Footer links:**
  GitHub のソース、プライバシーポリシー、Chrome ウェブストアの掲載ページ
- **Footer note:** Snug は MIT ライセンスのオープンソースです。

### KO

- **Heading:** 북마크를 가지고 다니세요
- **Line:** Snug를 Chrome에 추가하고 몇 번의 클릭으로 내보내기, 가져오기, 백업을
  해 보세요. 무료이고 오픈 소스이며, 기기 밖으로는 아무것도 나가지 않아요.
- **Button:** Chrome에 추가
- **Footer links:** GitHub 소스, 개인정보처리방침, Chrome 웹 스토어 등록 페이지
- **Footer note:** Snug는 MIT 라이선스의 오픈 소스예요.

### PT_BR

- **Heading:** Leve seus favoritos com você
- **Line:** Adicione o Snug ao Chrome e exporte, importe ou faça backup com
  poucos cliques. Grátis, de código aberto, e nada sai do seu dispositivo.
- **Button:** Usar no Chrome
- **Footer links:** Código no GitHub, Política de Privacidade, Página na Chrome
  Web Store
- **Footer note:** O Snug é de código aberto sob a licença MIT.

### RU

- **Heading:** Заберите закладки с собой
- **Line:** Добавьте Snug в Chrome и экспортируйте, импортируйте или
  резервируйте закладки за несколько щелчков. Бесплатно, с открытым кодом, и
  ничего не покидает ваше устройство.
- **Button:** Установить в Chrome
- **Footer links:** Исходный код на GitHub, Политика конфиденциальности,
  Страница в Chrome Web Store
- **Footer note:** Snug распространяется с открытым исходным кодом по лицензии
  MIT.

### ZH_CN

- **Heading:** 带上你的书签
- **Line:**
  把 Snug 添加到 Chrome，几次点击就能导出、导入或备份。免费、开源，任何内容都不会离开你的设备。
- **Button:** 添加至 Chrome
- **Footer links:** GitHub 源代码、隐私政策、Chrome 应用商店页面
- **Footer note:** Snug 以 MIT 许可证开源。

Sources: Product: Positioning, Capabilities and Constraints. MIT license is
stated in [`docs/store/screenshots.md`](../store/screenshots.md) (slide 5
claims). The Privacy Policy page is `/privacy` (separate ticket).

---

## 9. Search metadata

The `meta.title` and `meta.description` of every locale
(`apps/site/src/content/<locale>.json`). Titles lead with the keyword, name
Chrome and end with `| Snug`, at most 60 characters (CJK counted by visual
width, two columns each). Latin-script descriptions run 140 to 160 characters
and state the platform and the privacy promise. The privacy page title is
`Privacy Policy | Snug`. The h1 does not change.

### EN

- **Title:** Export, Import & Back Up Bookmarks – Chrome Extension | Snug
- **Description:** Snug is a Chrome extension that exports, imports and backs up
  your bookmarks, with scheduled backups. It needs no account and makes no
  network calls.

### ES

- **Title:** Exportar, importar y respaldar marcadores – Chrome | Snug
- **Description:** Snug es una extensión de Chrome para exportar, importar y
  respaldar tus marcadores, con copias automáticas programadas. No pide cuenta y
  no usa la red.

### DE

- **Title:** Lesezeichen exportieren/sichern – Chrome-Erweiterung | Snug
- **Description:** Snug ist eine Chrome-Erweiterung zum Exportieren, Importieren
  und Sichern deiner Lesezeichen, auch automatisch nach Zeitplan. Ohne Konto,
  ohne Netzwerkzugriff.

### FR

- **Title:** Exporter et sauvegarder favoris – Extension Chrome | Snug
- **Description:** Snug est une extension Chrome pour exporter, importer et
  sauvegarder vos favoris, avec des sauvegardes programmées. Sans compte ni
  appel réseau.

### IT

- **Title:** Esporta e salva i segnalibri – Estensione Chrome | Snug
- **Description:** Snug è un’estensione di Chrome per esportare, importare e
  salvare i tuoi segnalibri, con backup automatici programmati. Senza account né
  chiamate di rete.

### JA

- **Title:** ブックマークの書き出し・バックアップ – Chrome拡張 | Snug
- **Description:**
  Chrome拡張機能Snugで、ブックマークを書き出し、読み込み、定時バックアップ。アカウントは不要で、ネットワーク通信も行いません。

### KO

- **Title:** 북마크 내보내기·가져오기·백업 – Chrome 확장 | Snug
- **Description:** Snug는 북마크를 내보내고 가져오고 예약 백업까지 해 주는
  Chrome 확장 프로그램입니다. 계정이 필요 없고 네트워크 호출도 하지 않습니다.

### PT_BR

- **Title:** Exportar e backup de favoritos – Extensão Chrome | Snug
- **Description:** O Snug é uma extensão do Chrome para exportar, importar e
  fazer backup dos seus favoritos, com backups automáticos agendados. Não pede
  conta e não usa a rede.

### RU

- **Title:** Экспорт, импорт и бэкап закладок – расширение Chrome | Snug
- **Description:** Snug – расширение Chrome для экспорта, импорта и резервного
  копирования закладок, в том числе по расписанию. Не требует аккаунта и не
  обращается к сети.

### ZH_CN

- **Title:** 书签导出、导入与备份 – Chrome 扩展 | Snug
- **Description:**
  Snug 是一款 Chrome 扩展，可导出、导入书签，并按计划自动备份。无需账号，也不会发起任何网络请求。

Sources: Product: Positioning, Capabilities and Constraints. Scheduled backups
ship in `lib/auto-export.ts`.

---

## Claim sweep

- No sync, cloud, account, pricing or "several files" claim anywhere, checked
  against Product: Capabilities and Constraints and Context: Words to avoid.
- No exclamation points, emoji, em dashes in short copy, or "seamless",
  "powerful", "effortless", "supercharge".
- Not claimed anywhere: customer logos, press, case studies, usage metrics
  beyond the store figures, a demo video of the current version (Product:
  Evidence on Hand).
- The eight added locales carry the same sections, claims and figures as the
  English source, with the real figures (5,000 users, 4.8 stars from 20 ratings)
  written in each locale's number format.
