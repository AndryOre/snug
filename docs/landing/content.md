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
- **Never imply:** cloud, sync, an account, pricing, or any format or capability
  Snug does not ship.
- **Store figures, read 2026-10-05:** 5,000 users, 4.8 stars from 20 ratings.
  Re-check on the listing before launch.

Section order: 2 Trust proof (links), 4 Real interface, 5 Video, 6 Social proof,
7 FAQ, 8 Footer, 9 Search metadata, 10 Comparison pages, 11 How-to pages, 12
Landing v2 copy. Sections 1 (Hero) and 3 (Features) were removed with the old
keys; hero, features-style cards and closing copy now live in section 12.

---

## 2. Trust proof

Leads with the proof only Snug can give. The reader is deciding whether to give
an extension read and write access to the whole bookmark tree.

### EN

- **Links:** Source code, OpenSSF Scorecard, OpenSSF Best Practices, CI status,
  Privacy Policy

### ES

- **Links:** Código fuente, OpenSSF Scorecard, OpenSSF Best Practices, estado de
  CI, Política de privacidad

### DE

- **Links:** Quellcode, OpenSSF Scorecard, OpenSSF Best Practices, CI-Status,
  Datenschutzerklärung

### FR

- **Links:** Code source, OpenSSF Scorecard, OpenSSF Best Practices, statut de
  la CI, Politique de confidentialité

### IT

- **Links:** Codice sorgente, OpenSSF Scorecard, OpenSSF Best Practices, stato
  della CI, Informativa sulla privacy

### JA

- **Links:** ソースコード、OpenSSF Scorecard、OpenSSF Best
  Practices、CI のステータス、プライバシーポリシー

### KO

- **Links:** 소스 코드, OpenSSF Scorecard, OpenSSF Best Practices, CI 상태,
  개인정보처리방침

### PT_BR

- **Links:** Código-fonte, OpenSSF Scorecard, OpenSSF Best Practices, status da
  CI, Política de Privacidade

### RU

- **Links:** Исходный код, OpenSSF Scorecard, OpenSSF Best Practices, статус CI,
  Политика конфиденциальности

### ZH_CN

- **Links:** 源代码、OpenSSF Scorecard、OpenSSF Best
  Practices、CI 状态、隐私政策

Sources: Product: Positioning, Evidence on Hand; Context: Objections (access to
all bookmarks, solo-dev safety), Trust links. Link targets are listed in
Context: Trust links.

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
| `04-popup.png`       | The toolbar popup exports in one click and imports files you drop on it. |

### ES

| Image                | Caption                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `01-export.png`      | Página de exportación: elige carpetas del árbol, un formato y exporta.                                 |
| `02-import.png`      | Vista previa de importación: mira qué cambia y elige combinar, reemplazar o carpeta nueva.             |
| `03-auto-export.png` | Exportación automática: a diario, en HTML, JSON y Markdown, con la próxima ejecución a la vista.       |
| `04-popup.png`       | La ventana de la barra de herramientas exporta con un clic e importa los archivos que sueltas en ella. |

### DE

| Image                | Caption                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Exportseite: Ordner aus dem Baum wählen, Format festlegen, exportieren.                                 |
| `02-import.png`      | Importvorschau: sehen, was sich ändert, dann Zusammenführen, Ersetzen oder neuer Ordner wählen.         |
| `03-auto-export.png` | Auto-Export: täglich, in HTML, JSON und Markdown, mit dem nächsten Lauf.                                |
| `04-popup.png`       | Das Popup in der Symbolleiste exportiert mit einem Klick und importiert Dateien, die du darauf ablegst. |

### FR

| Image                | Caption                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Page d'exportation : choisissez des dossiers dans l'arborescence, un format, puis exportez.             |
| `02-import.png`      | Aperçu de l'import : voyez ce qui change, puis choisissez fusionner, remplacer ou nouveau dossier.      |
| `03-auto-export.png` | Exportation automatique : chaque jour, en HTML, JSON et Markdown, avec la prochaine exécution affichée. |
| `04-popup.png`       | La fenêtre de la barre d'outils exporte en un clic et importe les fichiers que vous y déposez.          |

### IT

| Image                | Caption                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Pagina di esportazione: scegli le cartelle dall'albero, un formato ed esporta.                       |
| `02-import.png`      | Anteprima di importazione: vedi cosa cambia, poi scegli unisci, sostituisci o nuova cartella.        |
| `03-auto-export.png` | Esportazione automatica: ogni giorno, in HTML, JSON e Markdown, con la prossima esecuzione in vista. |
| `04-popup.png`       | Il popup nella barra degli strumenti esporta con un clic e importa i file che ci trascini sopra.     |

### JA

| Image                | Caption                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `01-export.png`      | 書き出しページ：ツリーからフォルダーを選び、形式を選んで書き出します。                   |
| `02-import.png`      | 読み込みプレビュー：変更内容を確認し、統合、置き換え、新しいフォルダーから選びます。     |
| `03-auto-export.png` | 自動書き出し：毎日、HTML、JSON、Markdown で。次回の実行も表示されます。                  |
| `04-popup.png`       | ツールバーのポップアップは、ワンクリックで書き出し、ドロップしたファイルを読み込めます。 |

### KO

| Image                | Caption                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `01-export.png`      | 내보내기 페이지: 트리에서 폴더를 고르고, 형식을 선택해 내보내요.               |
| `02-import.png`      | 가져오기 미리보기: 무엇이 바뀌는지 확인하고 병합, 교체, 새 폴더 중에서 골라요. |
| `03-auto-export.png` | 자동 내보내기: 매일, HTML, JSON, Markdown으로, 다음 실행 시각도 표시돼요.      |
| `04-popup.png`       | 툴바 팝업은 클릭 한 번으로 내보내고, 놓아 둔 파일을 가져와요.                  |

### PT_BR

| Image                | Caption                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Página de exportação: escolha pastas da árvore, um formato e exporte.                             |
| `02-import.png`      | Pré-visualização da importação: veja o que muda e escolha mesclar, substituir ou pasta nova.      |
| `03-auto-export.png` | Exportação automática: diária, em HTML, JSON e Markdown, com a próxima execução à vista.          |
| `04-popup.png`       | O pop-up da barra de ferramentas exporta com um clique e importa os arquivos que você solta nele. |

### RU

| Image                | Caption                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `01-export.png`      | Страница экспорта: выберите папки в дереве и формат, затем экспортируйте.                                   |
| `02-import.png`      | Предпросмотр импорта: посмотрите, что изменится, и выберите объединение, замену или новую папку.            |
| `03-auto-export.png` | Автоэкспорт: ежедневно, в HTML, JSON и Markdown, с указанием следующего запуска.                            |
| `04-popup.png`       | Всплывающее окно на панели инструментов экспортирует одним щелчком и импортирует перетащенные в него файлы. |

### ZH_CN

| Image                | Caption                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `01-export.png`      | 导出页面：从树中选择文件夹和格式，然后导出。                            |
| `02-import.png`      | 导入预览：查看将发生的更改，再选择合并、替换或新建文件夹。              |
| `03-auto-export.png` | 自动导出：每天一次，格式为 HTML、JSON 和 Markdown，并显示下次运行时间。 |
| `04-popup.png`       | 工具栏弹出窗口可一键导出，也可导入拖入的文件。                          |

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

- **Link:** Leer todas las reseñas en la Chrome Web Store

### DE

- **Reviews lead-in:** Vier Rezensionen, im englischen Original:
- **Link:** Alle Rezensionen im Chrome Web Store lesen

### FR

- **Reviews lead-in:** Quatre avis, dans leur version originale en anglais :
- **Link:** Lire tous les avis dans le Chrome Web Store

### IT

- **Reviews lead-in:** Quattro recensioni, nell'originale inglese:
- **Link:** Leggi tutte le recensioni nel Chrome Web Store

### JA

- **Reviews lead-in:** 4 件のレビューを、英語の原文のまま掲載します。
- **Link:** Chrome ウェブストアのレビューをすべて読む

### KO

- **Reviews lead-in:** 후기 4개를 영어 원문 그대로 실었어요:
- **Link:** Chrome 웹 스토어에서 후기 모두 읽기

### PT_BR

- **Reviews lead-in:** Quatro avaliações, no original em inglês:
- **Link:** Ler todas as avaliações na Chrome Web Store

### RU

- **Reviews lead-in:** Четыре отзыва в английском оригинале:
- **Link:** Читать все отзывы в Chrome Web Store

### ZH_CN

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

**My browser already exports HTML. Why use Snug?** The built-in export has no
folder selection, preview, undo, schedule, duplicate check or extra formats.
Snug has all of them.

**Will it overwrite my current bookmarks?** Only if you choose Replace. You see
a preview first, and Replace saves a Safety snapshot you can restore.

**Does Snug cost anything?** No. It is free.

### ES

**¿Snug envía mis marcadores a algún lado?** No. Snug no hace llamadas de red.
Lee y escribe los marcadores de tu navegador en tu dispositivo, y el código
fuente es público para que lo verifiques.

**¿Necesito una cuenta?** No. Instálalo y empieza a exportar.

**¿Sincroniza mis marcadores entre dispositivos?** No. Snug no tiene
sincronización ni nube. Para pasar tus marcadores a otro navegador o equipo,
exporta un archivo e impórtalo allí.

**Mi navegador ya exporta HTML. ¿Para qué usar Snug?** La exportación integrada
no permite elegir carpetas, ni tiene vista previa, deshacer, horario, revisión
de duplicados ni otros formatos. Snug sí.

**¿Va a sobrescribir mis marcadores actuales?** Solo si eliges Reemplazar. Antes
ves una vista previa, y Reemplazar guarda una instantánea de seguridad que
puedes restaurar.

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

**Mein Browser exportiert schon HTML. Wozu Snug?** Dem integrierten Export
fehlen Ordnerauswahl, Vorschau, Rückgängig, Zeitplan, Duplikatprüfung und
zusätzliche Formate. Snug bietet alle.

**Überschreibt es meine aktuellen Lesezeichen?** Nur, wenn du Ersetzen wählst.
Vorher siehst du eine Vorschau, und Ersetzen speichert einen
Sicherheits-Snapshot, den du wiederherstellen kannst.

**Kostet Snug etwas?** Nein. Es ist kostenlos.

### FR

**Snug envoie-t-il mes favoris quelque part ?** Non. Snug ne fait aucun appel
réseau. Il lit et écrit les favoris de votre navigateur sur votre appareil, et
le code source est public pour que vous puissiez vérifier.

**Ai-je besoin d'un compte ?** Non. Installez-le et commencez à exporter.

**Synchronise-t-il mes favoris entre appareils ?** Non. Snug n'a ni
synchronisation ni cloud. Pour transférer vos favoris vers un autre navigateur
ou ordinateur, exportez un fichier et importez-le là-bas.

**Mon navigateur exporte déjà en HTML. Pourquoi utiliser Snug ?** L'export
intégré n'offre ni sélection de dossiers, ni aperçu, ni annulation, ni horaire,
ni détection des doublons, ni formats supplémentaires. Snug propose tout cela.

**Va-t-il écraser mes favoris actuels ?** Seulement si vous choisissez
Remplacer. Vous voyez d'abord un aperçu, et Remplacer enregistre un instantané
de sécurité que vous pouvez restaurer.

**Snug est-il payant ?** Non. Il est gratuit.

### IT

**Snug invia i miei segnalibri da qualche parte?** No. Snug non effettua
chiamate di rete. Legge e scrive i segnalibri del tuo browser sul tuo
dispositivo, e il codice sorgente è pubblico così puoi verificare.

**Mi serve un account?** No. Installalo e inizia a esportare.

**Sincronizza i miei segnalibri tra dispositivi?** No. Snug non ha
sincronizzazione né cloud. Per spostare i segnalibri su un altro browser o
computer, esporta un file e importalo lì.

**Il mio browser esporta già in HTML. Perché usare Snug?** L'esportazione
integrata non ha selezione delle cartelle, anteprima, annullamento,
pianificazione, controllo dei duplicati né formati aggiuntivi. Snug li ha tutti.

**Sovrascriverà i miei segnalibri attuali?** Solo se scegli Sostituisci. Prima
vedi un'anteprima, e Sostituisci salva un'istantanea di sicurezza che puoi
ripristinare.

**Snug costa qualcosa?** No. È gratis.

### JA

**Snug はブックマークをどこかに送信しますか？**
いいえ。Snug はネットワーク通信を行いません。お使いのブラウザーのブックマークを端末上で読み書きするだけで、確認できるようソースコードも公開されています。

**アカウントは必要ですか？** いいえ。インストールしてすぐに書き出せます。

**デバイス間でブックマークを同期しますか？**
いいえ。Snug には同期もクラウドもありません。別のブラウザーやパソコンに移すには、ファイルを書き出して、移した先で読み込みます。

**ブラウザーにも HTML の書き出しがあります。なぜ Snug を使うのですか？**
ブラウザー標準の書き出しには、フォルダーの選択、プレビュー、元に戻す機能、スケジュール、重複チェック、追加の形式がありません。Snug にはそのすべてがあります。

**今あるブックマークは上書きされますか？**
「置き換え」を選んだときだけです。先にプレビューが表示され、置き換えでは復元できる安全スナップショットが保存されます。

**Snug は有料ですか？** いいえ。無料です。

### KO

**Snug가 북마크를 어딘가로 보내나요?** 아니요. Snug는 네트워크 호출을 하지
않아요. 기기에서 브라우저의 북마크를 읽고 쓸 뿐이고, 직접 확인할 수 있도록 소스
코드도 공개되어 있어요.

**계정이 필요한가요?** 아니요. 설치하고 바로 내보내면 돼요.

**기기 간에 북마크를 동기화하나요?** 아니요. Snug에는 동기화도 클라우드도
없어요. 북마크를 다른 브라우저나 컴퓨터로 옮기려면 파일로 내보내서 그쪽에서
가져오세요.

**브라우저도 HTML로 내보낼 수 있는데 왜 Snug를 쓰나요?** 기본 내보내기에는 폴더
선택, 미리보기, 실행 취소, 일정, 중복 확인, 추가 형식이 없어요. Snug에는 모두
있어요.

**현재 북마크를 덮어쓰나요?** 교체를 선택할 때만 그래요. 먼저 미리보기를 볼 수
있고, 교체하면 복원할 수 있는 안전 스냅샷이 저장돼요.

**Snug는 유료인가요?** 아니요. 무료예요.

### PT_BR

**O Snug envia meus favoritos para algum lugar?** Não. O Snug não faz chamadas
de rede. Ele lê e grava os favoritos do seu navegador no seu dispositivo, e o
código-fonte é público para você conferir.

**Preciso de uma conta?** Não. Instale e comece a exportar.

**Ele sincroniza meus favoritos entre dispositivos?** Não. O Snug não tem
sincronização nem nuvem. Para levar favoritos a outro navegador ou computador,
exporte um arquivo e importe lá.

**Meu navegador já exporta HTML. Por que usar o Snug?** A exportação integrada
não tem seleção de pastas, pré-visualização, desfazer, agendamento, verificação
de duplicados nem formatos extras. O Snug tem tudo isso.

**Ele vai sobrescrever meus favoritos atuais?** Só se você escolher Substituir.
Você vê uma pré-visualização antes, e Substituir salva um instantâneo de
segurança que você pode restaurar.

**O Snug custa algo?** Não. É grátis.

### RU

**Отправляет ли Snug мои закладки куда-нибудь?** Нет. Snug не обращается к сети.
Он читает и записывает закладки вашего браузера на вашем устройстве, а исходный
код открыт, так что это можно проверить.

**Нужен ли аккаунт?** Нет. Установите и начинайте экспорт.

**Синхронизирует ли он закладки между устройствами?** Нет. В Snug нет ни
синхронизации, ни облака. Чтобы перенести закладки в другой браузер или на
другой компьютер, экспортируйте файл и импортируйте его там.

**Мой браузер уже экспортирует HTML. Зачем Snug?** У встроенного экспорта нет
выбора папок, предпросмотра, отмены, расписания, проверки дубликатов и
дополнительных форматов. В Snug всё это есть.

**Перезапишет ли он мои текущие закладки?** Только если вы выберете «Заменить».
Сначала вы увидите предпросмотр, а замена сохраняет страховой снимок, который
можно восстановить.

**Сколько стоит Snug?** Ничего. Он бесплатный.

### ZH_CN

**Snug 会把我的书签发送到别处吗？**
不会。Snug 不发起任何网络请求。它在你的设备上读写浏览器的书签，源代码也是公开的，你可以自行核查。

**需要账号吗？** 不需要。安装后即可开始导出。

**它会在设备之间同步书签吗？**
不会。Snug 没有同步功能，也没有云端。要把书签转移到另一个浏览器或电脑，请导出文件，然后在那边导入。

**我的浏览器已经能导出 HTML，为什么还要用 Snug？**
浏览器内置的导出没有文件夹选择、预览、撤销、计划、重复项检查和额外格式。Snug 全都有。

**它会覆盖我现有的书签吗？**
只有在你选择“替换”时才会。你会先看到预览，而且替换会保存一份可恢复的安全快照。

**Snug 收费吗？** 不收费。它是免费的。

Sources: Context: Objections table (all five objections), Anti-persona,
Differentiation; Product: Capabilities and Constraints ("No sync, no cloud, no
account, no pricing").

---

## 8. Final call to action and footer

### EN

- **Footer links:** Source on GitHub, Privacy Policy, Chrome Web Store listing
- **Footer note:** Snug is open source under the MIT license.

### ES

- **Footer links:** Código en GitHub, Política de privacidad, Listado en la
  Chrome Web Store
- **Footer note:** Snug es de código abierto con licencia MIT.

### DE

- **Footer links:** Quellcode auf GitHub, Datenschutzerklärung, Eintrag im
  Chrome Web Store
- **Footer note:** Snug ist Open Source unter der MIT-Lizenz.

### FR

- **Footer links:** Code source sur GitHub, Politique de confidentialité, Fiche
  du Chrome Web Store
- **Footer note:** Snug est open source sous licence MIT.

### IT

- **Footer links:** Codice su GitHub, Informativa sulla privacy, Scheda del
  Chrome Web Store
- **Footer note:** Snug è open source con licenza MIT.

### JA

- **Footer links:**
  GitHub のソース、プライバシーポリシー、Chrome ウェブストアの掲載ページ
- **Footer note:** Snug は MIT ライセンスのオープンソースです。

### KO

- **Footer links:** GitHub 소스, 개인정보처리방침, Chrome 웹 스토어 등록 페이지
- **Footer note:** Snug는 MIT 라이선스의 오픈 소스예요.

### PT_BR

- **Footer links:** Código no GitHub, Política de Privacidade, Página na Chrome
  Web Store
- **Footer note:** O Snug é de código aberto sob a licença MIT.

### RU

- **Footer links:** Исходный код на GitHub, Политика конфиденциальности,
  Страница в Chrome Web Store
- **Footer note:** Snug распространяется с открытым исходным кодом по лицензии
  MIT.

### ZH_CN

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

## 10. Comparison pages

Copy for the Alternatives page (`/alternatives/`) and the three Comparison
pages. Source: `apps/site/src/content/comparisons/en.json`, which this section
mirrors. Numbers and dates are never written in the copy: `{users}`, `{rating}`,
`{date}`, `{languages}` and `{historyMonths}` are filled from
`apps/site/src/content/competitors.ts`, and `{name}` is the competitor name.
Every claim about another extension comes from its live Chrome Web Store
listing; absence is written as "Not listed".

### EN

#### Shared

- **Breadcrumb:** Snug / Alternatives (label: Breadcrumb)
- **In short heading:** In short
- **At a glance heading:** At a glance
- **As of label:** As of {date}
- **Absent value:** Not listed
- **Criteria:** Export formats; Import; Choose which folders to export;
  Scheduled export; Copies to online storage; Browsers; Languages; Users and
  rating; Data disclosure on the store listing
- **Card link:** Compare with Snug
- **Pick Snug heading:** Pick Snug if
- **Pick other heading:** Pick {name} if
- **Switching heading:** Switching to Snug
- **Checked note:** Checked against each Chrome Web Store listing on {date}.
  Listings change, so confirm on the listing before you decide.
- **CTA title:** Try Snug on your own bookmarks
- **CTA body:** Free and open source. No account, no network calls.
- **CTA button:** Add to Chrome

#### Alternatives page

- **Title:** Bookmark Export Extension Alternatives | Snug
- **Description:** Compare Snug with three other Chrome bookmark export and
  backup extensions on formats, import, scheduling, languages and data
  disclosures. Checked {date}.
- **Eyebrow:** Alternatives
- **Headline:** Bookmark export extensions for Chrome, compared
- **Lede:** This table puts Snug next to three other extensions that export or
  back up Chrome bookmarks, using only what each Chrome Web Store listing says
  on {date}. Where a listing does not mention something, the table says Not
  listed.
- **What to look for:**
  - Export formats. Check that the file type you need is on the list, and what
    the extension says it does not export.
  - Import. An export only helps if you can read it back in or another tool
    opens it.
  - Folder choice. Decide whether you need the whole tree or only some folders.
  - Scheduling. Decide whether you want exports to run on their own or only when
    you click.
  - Where copies go. Some extensions keep everything on the device, and some
    offer optional copies to online storage after you sign in.
  - The data disclosure. Every listing has a section that says what the
    developer declares it handles. Read it before you install.
- **Built-in option:** Chrome's built-in export. Chrome's bookmark manager
  exports all of your bookmarks to a single HTML file, with nothing to install.
  It is enough when you need that and nothing more.
- **Card, Selective Bookmarks Export Tool:** Pick it when you use Firefox as
  well, or when HTML is the only format you need.
- **Card, Maple Backup:** Pick it when you want optional copies in Google Drive,
  OneDrive or Dropbox, or an interface in one of {languages} languages.
- **Card, 101 Export:** Pick it when you need to export your browsing history as
  well as bookmarks.

#### Comparison page: Selective Bookmarks Export Tool

- **Title:** Snug vs Selective Bookmarks Export Tool | Snug
- **Description:** Snug and Selective Bookmarks Export Tool compared on export
  formats, import, scheduling and data disclosure, from the live store listings.
  Checked {date}.
- **Eyebrow:** Comparison
- **Headline:** Snug vs Selective Bookmarks Export Tool
- **In short:** Selective Bookmarks Export Tool exports chosen bookmarks to HTML
  and is also available for Firefox and Edge. Snug exports to more formats than
  HTML, imports with a preview, and runs Auto-export on a schedule. As of {date}
  its listing shows {users} users and a {rating} rating, and does not list
  import or scheduling.
- **Why people look for an alternative:** The listing describes export to HTML.
  Import and scheduling are not listed as of {date}. Someone who needs a
  different file format, or exports that run on their own, will need another
  tool for those parts.
- **Pick Snug if:**
  - You need a format other than HTML, such as JSON.
  - You want to import a file back, with a preview and a choice of Merge,
    Replace or New folder.
  - You want Auto-export to run on a schedule, to Downloads or to a folder you
    choose.
  - You want a Duplicates page to find repeated bookmarks.
  - You want an extension that makes no network calls and needs no account.
- **Pick Selective Bookmarks Export Tool if:**
  - You use Firefox as well, because the extension is also available there.
  - HTML is the only format you need.
  - You want a keyword filter or a dark mode in the export tool itself.
- **Switching to Snug:**
  1. Install Snug from the Chrome Web Store.
  2. Open Snug and export in the format you need. Snug reads the bookmarks
     already in your browser, so there is nothing to convert.
  3. If you have HTML files from earlier exports, choose Import and pick the
     file.
  4. Check the preview, then choose Merge, Replace or New folder. A Replace can
     be undone from the Safety snapshot.
  5. Turn on Auto-export if you want exports on a schedule.

#### Comparison page: Maple Backup

- **Title:** Snug vs Maple Backup | Snug
- **Description:** Snug and Maple Backup compared on snapshots, optional copies
  to online storage, languages and data disclosure, from the live store
  listings. Checked {date}.
- **Eyebrow:** Comparison
- **Headline:** Snug vs Maple Backup
- **In short:** Maple Backup takes automatic daily or scheduled snapshots stored
  on the device, with optional copies to Google Drive, OneDrive or Dropbox after
  sign-in. Snug exports to files you keep, imports with a preview, and makes no
  network calls. As of {date} its listing shows {users} users and a {rating}
  rating.
- **Why people look for an alternative:** As of {date}, the Maple Backup listing
  declares that it handles personally identifiable information, authentication
  information and website content, and its optional copies use a sign-in.
  Someone who wants a tool with no account and no network calls may look
  elsewhere.
- **Pick Snug if:**
  - You want a tool with no account and no network calls.
  - You want export files in several formats that other browsers and tools can
    open.
  - You want to import with a preview and choose Merge, Replace or New folder.
  - You want an open source extension whose code you can read.
- **Pick Maple Backup if:**
  - You want optional copies in Google Drive, OneDrive or Dropbox.
  - You want to restore from any stored snapshot.
  - You want an interface in one of {languages} languages.
  - You want automatic daily snapshots without setting a destination.
- **Switching to Snug:**
  1. Install Snug from the Chrome Web Store.
  2. Open Snug and export your bookmarks in the format you need. Snug reads the
     bookmarks already in your browser, so there is nothing to convert.
  3. Turn on Auto-export to get files on a schedule, in Downloads or in a folder
     you choose.
  4. Remove Maple Backup from the extensions page when you no longer need it.

#### Comparison page: 101 Export

- **Title:** Snug vs 101 Export History/Bookmarks | Snug
- **Description:** Snug and 101 Export History/Bookmarks compared on export
  formats, history export and data disclosure, from the live store listings.
  Checked {date}.
- **Eyebrow:** Comparison
- **Headline:** Snug vs 101 Export History/Bookmarks
- **In short:** 101 Export exports Chrome history and bookmarks as JSON. Its own
  notice says it does not export to CSV or XLS. Snug exports bookmarks only, in
  more formats, and also imports. As of {date} its listing shows {users} users
  and a {rating} rating.
- **Why people look for an alternative:** The store title mentions CSV and XLS,
  and the extension's own notice says it does not export to either. Converting
  needs the 101editor desktop app. Chrome limits history to {historyMonths}
  months. As of {date} the listing is in English only.
- **Pick Snug if:**
  - You need bookmarks in a format other than JSON, without a desktop app.
  - You want to import a file back, with a preview and a choice of Merge,
    Replace or New folder.
  - You want Auto-export on a schedule.
  - You want the interface in a language other than English.
- **Pick 101 Export if:**
  - You need to export your browsing history as well as bookmarks.
  - JSON is the only format you need.
  - You want one extension for both history and bookmarks.
- **Switching to Snug:**
  1. Install Snug from the Chrome Web Store.
  2. Open Snug and export your bookmarks in the format you need. Snug reads the
     bookmarks already in your browser, so there is nothing to convert.
  3. Keep 101 Export installed if you still need to export history, because Snug
     exports bookmarks only.
  4. Turn on Auto-export if you want exports on a schedule.

Sources: Product: Positioning, Capabilities and Constraints; each competitor's
Chrome Web Store listing, checked 2026-10-10.

---

## 11. How-to pages

Copy for the How-to pages (`/how-to/<slug>/`). Source:
`apps/site/src/content/how-to/<slug>/<locale>.json` for each page and
`apps/site/src/content/how-to/shared/<locale>.json` for the shared strings. This
section holds the rules every How-to page follows and mirrors the English copy
of the first page. Browser facts are never written in the copy.
`{fromExportPath}`, `{fromExportFile}`, `{toImportPath}`, `{toImportPlacement}`,
`{fromHtmlKeeps}`, `{fromHtmlDrops}`, `{fromName}`, `{toName}` and `{date}` are
filled from `apps/site/src/content/browser-facts.ts`, where each fact has an
official source URL, a verified date and the browser version checked. A fact the
help pages do not state is written as "Not listed".

### Rules

- **Order:** the browser's built-in method comes first and carries the page.
  Snug appears only after it, where Snug adds something: Preview, choosing
  folders, an import mode, Skip duplicates, Safety snapshot.
- **Direct answer first:** the first paragraph after the question answers it in
  one to three sentences, with the verified date, so it can be quoted alone.
- **H1:** a question in the reader's words ("How do I move my bookmarks from
  Firefox to Chrome?"). It ends with a question mark.
- **Meta title:** keyword first, at most 60 visual columns, ending with " |
  Snug", never starting with "Snug". Names the task and both browsers.
- **Meta description:** 140 to 160 characters for Latin scripts, names Chrome,
  ends with the verified date through `{date}`. No "free", no "best".
- **Product terms:** the labels in `apps/extension/locales/<locale>.json`
  (Create folder, Restore — merge, Restore — replace, Skip duplicates, Preview,
  Safety snapshot, Duplicates). Never "Merge" alone, which is not a label.
- **Snug runs on Chromium only:** a migration page's destination is a Chromium
  browser. Snug is never offered as a way to run inside Firefox or Safari.
- **Never imply:** cloud, sync, an account, pricing, or a format or capability
  Snug does not ship. Snug imports HTML, JSON, CSV, XBEL, a Chrome profile
  `Bookmarks` file and a Safari export.
- **Sources:** every browser claim links to the official help page. Third-party
  tutorials are never a source. A missing fact stays "Not listed".
- **Voice:** calm and precise, as in `docs/brand/voice.md`. Steps are numbered
  and each does one thing. No exclamation points, no urgency.

### EN: Move bookmarks from Firefox to Chrome

- **Title:** Move Firefox Bookmarks to Chrome | Snug
- **Description:** Export Firefox bookmarks to an HTML file and import it into
  Chrome, step by step, with what to check afterwards. Menu paths verified
  {date}.
- **Headline:** How do I move my bookmarks from Firefox to Chrome?
- **Direct answer:** Export your bookmarks from Firefox to an HTML file with
  {fromExportPath}. Then import that file into Chrome with {toImportPath}.
  Chrome puts them in {toImportPlacement}. Menu paths checked {date}.
- **The built-in method:** Both browsers do this on their own. You need the HTML
  file and nothing else.
  1. In Firefox, open {fromExportPath}.
  2. Save the file. Firefox names it {fromExportFile} by default.
  3. In Chrome, open {toImportPath}.
  4. Choose the HTML file you saved and confirm.
- **What carries over:** The HTML file is the only thing that moves. Kept in the
  file, per {fromName}: {fromHtmlKeeps}. Left out of the file, per {fromName}:
  {fromHtmlDrops}. Where a help page does not say, this page says Not listed
  instead of guessing.
- **With Snug:** Snug runs in Chrome and other Chromium browsers, not in
  Firefox. Export the HTML file from Firefox as above, then use Snug in Chrome
  for the import. It adds a preview, a choice of what to bring in and a way
  back.
  1. Install Snug from the Chrome Web Store.
  2. Open Snug's Import page and choose the HTML file there, or drop it on the
     page. Do not use the popup for this: it imports at once, without a preview.
  3. The Preview shows the detected format, the bookmark count and the folder
     tree before anything changes.
  4. Use the checkboxes to pick single bookmarks or whole folders. Snug imports
     only what you select.
  5. Choose an import mode. Create folder adds everything to a new Imported
     Bookmarks folder. Restore — merge places bookmarks in their original
     locations next to your existing ones, when the file carries them.
  6. Leave Skip duplicates on. It leaves out any bookmark whose address is
     already in Chrome, and tells you how many it skipped.
  - Create folder and Restore — merge never clear your bookmarks. Before a
    Restore — replace, Snug saves a Safety snapshot to your Downloads and keeps
    a copy in Settings, so you can undo the import.
- **If something goes wrong:**
  - You cannot find the bookmarks after importing. Chrome places them in
    {toImportPlacement}.
  - Chrome does not accept the file. Check that you chose the HTML file Firefox
    saved, named {fromExportFile} by default, and not another file type.
  - A bookmark appears twice. Open Duplicates in Snug: it groups copies by
    address and removes only the copies you mark Delete.
  - Snug says nothing was imported. Every bookmark in the file is already in
    your browser. Turn off Skip duplicates to import them again.
- **Verified note:** Menu paths and file names were read from the official help
  pages of {fromName} and {toName} on {date}. Browser menus change between
  versions, so check the source if a path differs on your screen.

The other nine locales carry the same sections, claims and placeholders in
`apps/site/src/content/how-to/move-bookmarks-from-firefox-to-chrome/`, using the
product labels of each locale's extension file.

Sources: Product: Positioning, Capabilities and Constraints;
`docs/guide/importing.md`, `docs/guide/duplicates.md`; Firefox export help
(`support.mozilla.org/kb/export-firefox-bookmarks-to-backup-or-transfer`) and
Chrome bookmarks help (`support.google.com/chrome/answer/96816`), read
2026-10-11. Firefox's page did not load for automated reads, so its menu path
was taken from the search summary of the official page and should be
re-confirmed in a browser before launch.

### EN: Move bookmarks from Edge to Chrome

- **Title:** Move Edge Bookmarks to Chrome | Snug
- **Description:** Export your Edge favorites to an HTML file and import it into
  Chrome, step by step, with what to check afterwards. Menu paths verified
  {date}.
- **Headline:** How do I move my bookmarks from Edge to Chrome?
- **Direct answer:** Export your Edge favorites to an HTML file. Then import the
  file into Chrome with {toImportPath}. Chrome puts imported bookmarks in
  {toImportPlacement}. Menu paths checked {date}.
- **The built-in method:** Chrome's help lists these import sources:
  {toImportSources}. This page follows that documented route. Edge calls
  bookmarks favorites.
  1. In Edge, export your favorites to an HTML file.
  2. In Chrome, open {toImportPath}.
  3. Choose the HTML file you saved and confirm.
- **What carries over:** As on the Firefox page, from the facts module.
- **With Snug:** Snug runs in Edge and in Chrome, so the whole move happens
  inside the two browsers. It adds a preview, a choice of what to bring in and a
  way back.
  1. Install Snug from the Chrome Web Store in both Edge and Chrome.
  2. In Edge, open Snug's Export page. Check the bookmarks or folders you want
     to move, choose HTML and export.
  3. to 7. The Import page, Preview, selection, import mode and Skip duplicates
     steps of the Firefox page, with Chrome as the destination.
- **If something goes wrong:** Placement, a file Chrome does not accept (its own
  import takes a bookmarks HTML file), duplicates, nothing imported.

### EN: Move bookmarks from Chrome to Brave

- **Title:** Move Chrome Bookmarks to Brave | Snug
- **Description:** Import Chrome bookmarks into Brave from another browser or
  from an HTML file, step by step, with what to check afterwards. Menu paths
  verified {date}.
- **Headline:** How do I move my bookmarks from Chrome to Brave?
- **Direct answer:** In Brave, open {toImportPath}. Brave's help lists these
  import sources: {toImportSources}. To use a file, export it from Chrome first
  with {fromExportPath}. Menu paths checked {date}.
- **The built-in method:** Choose a browser detected on this computer to import
  straight from Chrome, or use a file. The file route also works when Chrome is
  on another computer. These steps cover the file route.
  1. In Chrome, open {fromExportPath}.
  2. Save the file. Chrome names it {fromExportFile} by default.
  3. In Brave, open {toImportPath}.
  4. Choose the HTML file you saved and confirm.
- **What carries over:** As on the Firefox page, from the facts module.
- **With Snug:** Snug runs in Chrome and in Brave. Use it in Chrome to export
  only the folders you pick, and in Brave to preview the import and undo a
  replace.
  1. Install Snug from the Chrome Web Store in both Chrome and Brave.
  2. In Chrome, open Snug's Export page. Check the folders or single bookmarks
     you want to move, choose HTML and export.
  3. to 5. The Import page, Preview and selection steps of the Firefox page.
  4. Choose an import mode, as on the Firefox page.
  5. Restore — replace clears the bookmarks in your Bookmarks Bar and Other
     Bookmarks first. Snug shows how many bookmarks it will remove and add, asks
     you to confirm, and works with one file at a time.
  6. Leave Skip duplicates on. It leaves out any bookmark whose address is
     already in Brave, and tells you how many it skipped.
  - Before a Restore — replace, Snug saves a Safety snapshot, as on the Firefox
    page.
- **If something goes wrong:** Placement (Brave's help does not list it, so the
  page says Not listed), a file Brave does not accept, duplicates, nothing
  imported.

The other nine locales of both pages carry the same sections, claims and
placeholders in
`apps/site/src/content/how-to/move-bookmarks-from-edge-to-chrome/` and
`apps/site/src/content/how-to/move-bookmarks-from-chrome-to-brave/`.

Sources: Product: Positioning, Capabilities and Constraints;
`docs/guide/importing.md`, `docs/guide/exporting.md`,
`docs/guide/duplicates.md`; Chrome bookmarks help
(`support.google.com/chrome/answer/96816`), Edge import help
(`support.microsoft.com/en-us/topic/eb26f747-ab82-c8fb-ad3b-c227f99ba8a4`) and
Brave import help
(`support.brave.app/hc/en-us/articles/360019782291-How-do-I-import-or-export-browsing-data`),
read 2026-10-11. Edge's help documents import only, so its export path is Not
listed. Brave's page did not load for automated reads, so its two import sources
were taken from the search summary of the official page and should be
re-confirmed in a browser before launch.

---

## 12. Landing v2 copy (EN final, other locales EN placeholders)

Copy for the redesigned landing page (AO-1908). It lives under the `landing` key
of each locale JSON; the v1 keys it replaced have been removed. Other locales
carry these same English strings as placeholders until the translation tickets
replace them. Page order: Hero, Stats strip, Browser marquee, Bento, Format
playground, Interface showcase, Video, Reviews, FAQ, Closing, Install dock.

Terms: Install dock and Format playground. Never sync, cloud or account.

### EN

- **Hero headline** (`landing.hero.headline`): One file. Six formats. Nothing
  leaves your device.
- **Hero subheadline:** Back up, export and import bookmarks. No network calls.
- **Hero button:** Add to Chrome
- **Hero chips:** Free, Open source, No account
- **Journey stages:** Your device (boundary), Your browser, One file, Another
  browser, Network calls: 0
- **Hero description (screen readers only):** Your bookmarks leave your browser
  as one file, in any of six formats, and open in another browser. Every step
  stays on your device.
- **Stats strip:** Users 5,000, Rating 4.8, Formats 6, Network calls 0
- **Browser marquee group labels:** Works in, Imports from
- **Bento:**
  - Export anything: Whole tree or chosen folders, in six formats.
  - Import with a preview: See what will be added, skipped or deleted first.
  - Back up on a schedule: Auto-export saves files on the schedule you set.
  - Drop files in the popup: Drop several files at once and Snug imports them.
- **Format playground:** Pick a format. Same bookmarks, six files. / See the
  same folder in each format. / Tabs: HTML, JSON, CSV, Markdown, OPML, XBEL
- **Interface showcase:** The real interface. / Tabs: Export, Import,
  Auto-export, Popup
- **Video:** reads the v1 heading "See it work" (`video.heading`)
- **Reviews:** What people say / Public Chrome Web Store reviews, written before
  the rename. The four quotes in section 6 are unchanged.
- **FAQ:** Questions / More questions. The six items kept on the landing page
  use their v1 text, selected by key: `network`, `account`, `sync`, `overwrite`,
  `builtin`, `cost`. The other six (`oneFile`, `permissions`, `browsers`,
  `formats`, `safe`, `folder`) move to the Guide FAQ page.
- **Closing panel:** Add Snug to Chrome. / Free and open source. / Add to Chrome
- **Install dock:** Add to Chrome, Source (screen reader label: Add Snug to
  Chrome)

### ES

- **Hero headline:** Un archivo. Seis formatos. Nada sale de tu dispositivo.
- **Hero subheadline:** Respalda, exporta e importa marcadores. Sin llamadas de
  red.
- **Hero button:** Añadir a Chrome
- **Hero chips:** Gratis, Código abierto, Sin cuenta
- **Journey stages:** Tu dispositivo, Tu navegador, Un archivo, Otro navegador,
  Llamadas de red: 0
- **Hero description (screen readers only):** Tus marcadores salen de tu
  navegador como un solo archivo, en cualquiera de seis formatos, y se abren en
  otro navegador. Cada paso ocurre en tu dispositivo.
- **Stats strip:** Usuarios 5,000, Valoración 4.8, Formatos 6, Llamadas de red 0
- **Browser marquee group labels:** Funciona en, Importa desde
- **Bento:**
  - Exporta lo que quieras: Todo el árbol o las carpetas que elijas, en seis
    formatos.
  - Importa con vista previa: Mira antes qué se añadirá, omitirá o eliminará.
  - Respalda con horario: La exportación automática guarda archivos según el
    horario que definas.
  - Suelta archivos en el popup: Suelta varios archivos a la vez y Snug los
    importa.
- **Format playground:** Elige un formato. Mismos marcadores, seis archivos. /
  Mira la misma carpeta en cada formato. / Tabs: HTML, JSON, CSV, Markdown,
  OPML, XBEL
- **Interface showcase:** La interfaz real. / Tabs: Exportar, Importar,
  Auto-export, Popup
- **Reviews:** Lo que dice la gente / Reseñas públicas de la Chrome Web Store,
  escritas antes del cambio de nombre.
- **FAQ:** Preguntas / Más preguntas
- **Closing panel:** Añade Snug a Chrome. / Gratis y de código abierto. / Añadir
  a Chrome
- **Install dock:** Añadir a Chrome, Código (screen reader label: Añadir Snug a
  Chrome)

### FR

- **Hero headline:** Un fichier. Six formats. Rien ne quitte votre appareil.
- **Hero subheadline:** Sauvegardez, exportez et importez vos favoris. Aucun
  appel réseau.
- **Hero button:** Ajouter à Chrome
- **Hero chips:** Gratuit, Open source, Sans compte
- **Journey stages:** Votre appareil, Votre navigateur, Un fichier, Un autre
  navigateur, Appels réseau : 0
- **Hero description (screen readers only):** Vos favoris quittent votre
  navigateur sous la forme d'un seul fichier, dans l'un des six formats, et
  s'ouvrent dans un autre navigateur. Chaque étape reste sur votre appareil.
- **Stats strip:** Utilisateurs 5,000, Note 4.8, Formats 6, Appels réseau 0
- **Browser marquee group labels:** Fonctionne dans, Importe depuis
- **Bento:**
  - Exportez ce que vous voulez: L'arborescence entière ou les dossiers de votre
    choix, en six formats.
  - Importez avec un aperçu: Voyez d'abord ce qui sera ajouté, ignoré ou
    supprimé.
  - Sauvegardez selon un planning: L'exportation automatique enregistre des
    fichiers au rythme que vous fixez.
  - Déposez des fichiers dans le popup: Déposez plusieurs fichiers d'un coup,
    Snug les importe.
- **Format playground:** Choisissez un format. Mêmes favoris, six fichiers. /
  Voyez le même dossier dans chaque format. / Tabs: HTML, JSON, CSV, Markdown,
  OPML, XBEL
- **Interface showcase:** La vraie interface. / Tabs: Export, Import,
  Auto-export, Popup
- **Reviews:** Ce qu'en disent les utilisateurs / Avis publics du Chrome Web
  Store, rédigés avant le changement de nom.
- **FAQ:** Questions / Plus de questions
- **Closing panel:** Ajoutez Snug à Chrome. / Gratuit et open source. / Ajouter
  à Chrome
- **Install dock:** Ajouter à Chrome, Code (screen reader label: Ajouter Snug à
  Chrome)

### IT

- **Hero headline:** Un file. Sei formati. Niente lascia il tuo dispositivo.
- **Hero subheadline:** Fai il backup, esporta e importa i segnalibri. Nessuna
  chiamata di rete.
- **Hero button:** Aggiungi a Chrome
- **Hero chips:** Gratis, Open source, Senza account
- **Journey stages:** Il tuo dispositivo, Il tuo browser, Un file, Un altro
  browser, Chiamate di rete: 0
- **Hero description (screen readers only):** I tuoi segnalibri lasciano il
  browser come un unico file, in uno dei sei formati, e si aprono in un altro
  browser. Ogni passaggio resta sul tuo dispositivo.
- **Stats strip:** Utenti 5,000, Valutazione 4.8, Formati 6, Chiamate di rete 0
- **Browser marquee group labels:** Funziona in, Importa da
- **Bento:**
  - Esporta quello che vuoi: L'albero intero o le cartelle che scegli, in sei
    formati.
  - Importa con un'anteprima: Prima vedi cosa verrà aggiunto, saltato o
    eliminato.
  - Backup pianificato: L'esportazione automatica salva i file con la
    pianificazione che imposti.
  - Trascina i file nel popup: Trascina più file insieme e Snug li importa.
- **Format playground:** Scegli un formato. Gli stessi segnalibri, sei file. /
  Guarda la stessa cartella in ogni formato. / Tabs: HTML, JSON, CSV, Markdown,
  OPML, XBEL
- **Interface showcase:** L'interfaccia reale. / Tabs: Esporta, Importa,
  Auto-export, Popup
- **Reviews:** Cosa dicono le persone / Recensioni pubbliche del Chrome Web
  Store, scritte prima del cambio di nome.
- **FAQ:** Domande / Altre domande
- **Closing panel:** Aggiungi Snug a Chrome. / Gratis e open source. / Aggiungi
  a Chrome
- **Install dock:** Aggiungi a Chrome, Codice (screen reader label: Aggiungi
  Snug a Chrome)

### PT_BR

- **Hero headline:** Um arquivo. Seis formatos. Nada sai do seu dispositivo.
- **Hero subheadline:** Faça backup, exporte e importe favoritos. Sem chamadas
  de rede.
- **Hero button:** Usar no Chrome
- **Hero chips:** Grátis, Código aberto, Sem conta
- **Journey stages:** Seu dispositivo, Seu navegador, Um arquivo, Outro
  navegador, Chamadas de rede: 0
- **Hero description (screen readers only):** Seus favoritos saem do navegador
  como um único arquivo, em qualquer um de seis formatos, e abrem em outro
  navegador. Cada etapa fica no seu dispositivo.
- **Stats strip:** Usuários 5,000, Nota 4.8, Formatos 6, Chamadas de rede 0
- **Browser marquee group labels:** Funciona em, Importa de
- **Bento:**
  - Exporte o que quiser: A árvore inteira ou as pastas que escolher, em seis
    formatos.
  - Importe com pré-visualização: Veja antes o que será adicionado, ignorado ou
    excluído.
  - Backup agendado: A exportação automática salva arquivos no horário que você
    definir.
  - Solte arquivos no pop-up: Solte vários arquivos de uma vez e o Snug os
    importa.
- **Format playground:** Escolha um formato. Mesmos favoritos, seis arquivos. /
  Veja a mesma pasta em cada formato. / Tabs: HTML, JSON, CSV, Markdown, OPML,
  XBEL
- **Interface showcase:** A interface real. / Tabs: Exportar, Importar,
  Auto-export, Pop-up
- **Reviews:** O que as pessoas dizem / Avaliações públicas da Chrome Web Store,
  escritas antes da mudança de nome.
- **FAQ:** Perguntas / Mais perguntas
- **Closing panel:** Adicione o Snug ao Chrome. / Grátis e de código aberto. /
  Usar no Chrome
- **Install dock:** Usar no Chrome, Código (screen reader label: Adicionar o
  Snug ao Chrome)

Visible EN word count of the page, with the verbatim review quotes (73 words)
and the six kept FAQ items counted: about 366, under the 380 ceiling. Without
the quotes: about 293.

### DE

- **Hero headline:** Eine Datei. Sechs Formate. Nichts verlässt dein Gerät.
- **Hero subheadline:** Lesezeichen sichern, exportieren und importieren. Ohne
  Netzwerkzugriff.
- **Hero button:** Zu Chrome hinzufügen
- **Hero chips:** Kostenlos, Open Source, Kein Konto
- **Journey stages:** Dein Gerät, Dein Browser, Eine Datei, Ein anderer Browser,
  Netzwerkaufrufe: 0
- **Hero description (screen readers only):** Deine Lesezeichen verlassen deinen
  Browser als eine Datei in einem von sechs Formaten und öffnen sich in einem
  anderen Browser. Jeder Schritt bleibt auf deinem Gerät.
- **Stats strip:** Nutzer 5.000, Bewertung 4,8, Formate 6, Netzwerkaufrufe 0
- **Browser marquee group labels:** Funktioniert in, Importiert aus
- **Bento:**
  - Alles exportieren: Den ganzen Baum oder ausgewählte Ordner, in sechs
    Formaten.
  - Import mit Vorschau: Sieh vorab, was hinzugefügt, übersprungen oder gelöscht
    wird.
  - Nach Zeitplan sichern: Auto-Export speichert Dateien nach dem Zeitplan, den
    du festlegst.
  - Dateien ins Popup ziehen: Ziehe mehrere Dateien auf einmal hinein, und Snug
    importiert sie.
- **Format playground:** Wähle ein Format. Dieselben Lesezeichen, sechs Dateien.
  / Sieh denselben Ordner in jedem Format.
- **Interface showcase:** Die echte Oberfläche. / Tabs: Export, Import,
  Auto-Export, Popup
- **Reviews:** Das sagen Nutzer / Öffentliche Rezensionen aus dem Chrome Web
  Store, vor der Umbenennung geschrieben.
- **FAQ:** Fragen / Weitere Fragen
- **Closing panel:** Snug zu Chrome hinzufügen. / Kostenlos und Open Source. /
  Zu Chrome hinzufügen
- **Install dock:** Zu Chrome hinzufügen, Quellcode (screen reader label: Snug
  zu Chrome hinzufügen)

### RU

- **Hero headline:** Один файл. Шесть форматов. Ничто не покидает устройство.
- **Hero subheadline:** Резервные копии, экспорт и импорт закладок. Без
  обращений к сети.
- **Hero button:** Установить в Chrome
- **Hero chips:** Бесплатно, Открытый код, Без аккаунта
- **Journey stages:** Ваше устройство, Ваш браузер, Один файл, Другой браузер,
  Обращений к сети: 0
- **Hero description (screen readers only):** Ваши закладки покидают браузер
  одним файлом в одном из шести форматов и открываются в другом браузере. Каждый
  шаг остаётся на вашем устройстве.
- **Stats strip:** Пользователи 5 000, Рейтинг 4,8, Форматы 6, Обращения к сети
  0
- **Browser marquee group labels:** Работает в, Импорт из
- **Bento:**
  - Экспорт любых данных: Всё дерево или выбранные папки, в шести форматах.
  - Импорт с предпросмотром: Сначала видно, что будет добавлено, пропущено или
    удалено.
  - Копии по расписанию: Автоэкспорт сохраняет файлы по заданному вами
    расписанию.
  - Файлы во всплывающем окне: Перетащите сразу несколько файлов, и Snug их
    импортирует.
- **Format playground:** Выберите формат. Те же закладки, шесть файлов. / Одна и
  та же папка в каждом формате.
- **Interface showcase:** Настоящий интерфейс. / Tabs: Экспорт, Импорт,
  Автоэкспорт, Всплывающее окно
- **Reviews:** Что говорят люди / Публичные отзывы из Chrome Web Store,
  написанные до переименования.
- **FAQ:** Вопросы / Ещё вопросы
- **Closing panel:** Установите Snug в Chrome. / Бесплатно, с открытым кодом. /
  Установить в Chrome
- **Install dock:** Установить в Chrome, Исходный код (screen reader label:
  Установить Snug в Chrome)

### JA

- **Hero headline:** 1 つのファイル。6 つの形式。データは端末の外に出ません。
- **Hero subheadline:**
  ブックマークのバックアップ、書き出し、読み込みに対応。ネットワーク通信はありません。
- **Hero button:** Chrome に追加
- **Hero chips:** 無料, オープンソース, アカウント不要
- **Journey stages:** お使いの端末, お使いのブラウザ,
  1 つのファイル, 別のブラウザ, ネットワーク通信：0 回
- **Hero description (screen readers only):**
  ブックマークは 1 つのファイルとして、6 つの形式のいずれかでブラウザの外に出て、別のブラウザで開けます。すべての手順は端末の中だけで行われます。
- **Stats strip:** ユーザー数 5,000, 評価 4.8, 形式 6, ネットワーク通信 0
- **Browser marquee group labels:** 対応ブラウザ, 読み込み元
- **Bento:**
  - 何でも書き出せる: ツリー全体も、選んだフォルダーだけも、6 つの形式で書き出せます。
  - プレビューしてから読み込む: 追加、スキップ、削除される項目を先に確認できます。
  - スケジュールでバックアップ: 自動書き出しが、設定したスケジュールでファイルを保存します。
  - ポップアップにファイルをドロップ: 複数のファイルをまとめてドロップすると、Snug が読み込みます。
- **Format playground:**
  形式を選ぶ。同じブックマークが 6 つのファイルに。 / 同じフォルダーを、形式ごとに見比べられます。
- **Interface showcase:** 実際の画面 /
  Tabs: 書き出し, 読み込み, 自動書き出し, ポップアップ
- **Reviews:** ユーザーの声 /
  Chrome ウェブストアに公開されているレビューです。名称変更前に書かれたものです。
- **FAQ:** よくある質問 / ほかの質問を見る
- **Closing panel:** Snug を Chrome に追加。 / 無料でオープンソースです。 /
  Chrome に追加
- **Install dock:** Chrome に追加, ソースコード (screen reader label:
  Snug を Chrome に追加)

### KO

- **Hero headline:** 파일 하나. 형식 여섯 가지. 기기 밖으로는 아무것도 나가지
  않아요.
- **Hero subheadline:** 북마크를 백업하고, 내보내고, 가져와요. 네트워크 호출은
  없어요.
- **Hero button:** Chrome에 추가
- **Hero chips:** 무료, 오픈 소스, 계정 없음
- **Journey stages:** 내 기기, 내 브라우저, 파일 하나, 다른 브라우저, 네트워크
  호출: 0
- **Hero description (screen readers only):** 북마크는 여섯 가지 형식 중 하나의
  파일로 브라우저 밖으로 나가 다른 브라우저에서 열려요. 모든 단계는 기기
  안에서만 이뤄져요.
- **Stats strip:** 사용자 5,000, 평점 4.8, 형식 6, 네트워크 호출 0
- **Browser marquee group labels:** 지원 브라우저, 가져오기 가능한 곳
- **Bento:**
  - 무엇이든 내보내기: 트리 전체나 고른 폴더를 여섯 가지 형식으로 내보내요.
  - 미리 보고 가져오기: 추가, 건너뜀, 삭제될 항목을 먼저 확인해요.
  - 일정에 맞춰 백업: 자동 내보내기가 정해 둔 일정에 맞춰 파일을 저장해요.
  - 팝업에 파일 놓기: 파일 여러 개를 한 번에 놓으면 Snug가 가져와요.
- **Format playground:** 형식을 고르세요. 같은 북마크, 여섯 개의 파일. / 같은
  폴더를 형식별로 비교해 보세요.
- **Interface showcase:** 실제 화면 / Tabs: 내보내기, 가져오기, 자동 내보내기,
  팝업
- **Reviews:** 사용자 후기 / Chrome 웹 스토어에 공개된 리뷰예요. 이름이 바뀌기
  전에 작성됐어요.
- **FAQ:** 자주 묻는 질문 / 질문 더 보기
- **Closing panel:** Snug를 Chrome에 추가하세요. / 무료이고 오픈 소스예요. /
  Chrome에 추가
- **Install dock:** Chrome에 추가, 소스 코드 (screen reader label: Snug를
  Chrome에 추가)

### ZH_CN

- **Hero headline:** 一个文件，六种格式，内容不会离开你的设备。
- **Hero subheadline:** 备份、导出和导入书签，不发起任何网络请求。
- **Hero button:** 添加至 Chrome
- **Hero chips:** 免费, 开源, 无需账号
- **Journey stages:** 你的设备, 你的浏览器, 一个文件, 另一个浏览器, 网络请求：0
- **Hero description (screen readers only):**
  你的书签会以一个文件的形式离开浏览器，格式可选六种，并可在另一个浏览器中打开。每一步都只在你的设备上完成。
- **Stats strip:** 用户 5,000, 评分 4.8, 格式 6, 网络请求 0
- **Browser marquee group labels:** 适用浏览器, 可导入自
- **Bento:**
  - 导出任何内容：整棵树或选定的文件夹，都可导出为六种格式。
  - 先预览再导入：先查看将要添加、跳过或删除的内容。
  - 按计划备份：自动导出会按你设定的计划保存文件。
  - 把文件拖入弹出窗口：一次拖入多个文件，Snug 会依次导入。
- **Format playground:**
  选一种格式，同样的书签，六个文件。 / 在每种格式中查看同一个文件夹。
- **Interface showcase:** 真实界面 / Tabs: 导出, 导入, 自动导出, 弹出窗口
- **Reviews:** 用户评价 / 来自 Chrome 应用商店的公开评价，写于更名之前。
- **FAQ:** 常见问题 / 更多问题
- **Closing panel:** 把 Snug 添加到 Chrome。 / 免费、开源。 / 添加至 Chrome
- **Install dock:** 添加至 Chrome, 源代码 (screen reader
  label: 把 Snug 添加到 Chrome)

---

## Claim sweep

- No sync, cloud, account or pricing claim anywhere, checked against Product:
  Capabilities and Constraints and Context: Words to avoid.
- No exclamation points, emoji, em dashes in short copy, or "seamless",
  "powerful", "effortless", "supercharge".
- Not claimed anywhere: customer logos, press, case studies, usage metrics
  beyond the store figures, a demo video of the current version (Product:
  Evidence on Hand).
- The eight added locales carry the same sections, claims and figures as the
  English source, with the real figures (5,000 users, 4.8 stars from 20 ratings)
  written in each locale's number format.
- How-to pages: no menu path, file name or placement written in the copy, only
  placeholders from `browser-facts.ts`. No cloud, sync, account or pricing
  wording. Snug is never described as running in Firefox or Safari. Product
  labels match the extension locale files. A browser fact with no official
  source is "Not listed".
