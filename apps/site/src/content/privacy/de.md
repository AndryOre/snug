---
englishLastUpdated: November 3, 2026
---

# Datenschutzerklärung von Snug

Zuletzt aktualisiert: 3. November 2026

## Einleitung

Snug verpflichtet sich, deine Privatsphäre zu schützen. Diese
Datenschutzerklärung beschreibt, wie wir mit den Informationen umgehen, die wir
über unsere Browser-Erweiterung erhalten, und wie wir sie erheben, verwenden und
weitergeben.

## Erhebung und Verwendung von Informationen

Snug erhebt, speichert oder überträgt keine personenbezogenen Daten seiner
Nutzer. Unsere Erweiterung läuft vollständig in deinem Browser und sendet weder
deine Lesezeichen noch deine Einstellungen an externe Server. Der einzige
Netzwerkkontakt ist die optionale Abschiedsseite, die unter
„Deinstallationsseite“ weiter unten beschrieben wird.

### Lesezeichendaten

- Die Erweiterung greift nur auf die Lesezeichen deines Browsers zu, um sie in
  HTML-, JSON-, CSV-, Markdown-, OPML- oder XBEL-Dateien zu exportieren oder um
  sie aus HTML-, JSON-, CSV- oder XBEL-Dateien, einer `Bookmarks`-Datei eines
  Chrome-Profils oder einem Safari-Export zu importieren. Die Seite Duplikate
  liest deine Lesezeichen außerdem, um Kopien derselben Adresse zu finden, und
  entfernt sie nur, wenn du das bestätigst.
- Dieser Zugriff erfolgt nur, wenn du einen Import oder Export ausdrücklich
  startest oder wenn ein von dir eingerichteter geplanter automatischer Export
  läuft (siehe „Automatischer Export“ weiter unten).
- Deine Lesezeichendaten werden lokal auf deinem Gerät verarbeitet und weder an
  uns noch an Dritte übertragen.

### Favicons

- Um Website-Symbole neben deinen Lesezeichen anzuzeigen, liest die Erweiterung
  Favicons über die im Browser integrierte `_favicon`-API. Diese Abfrage sucht
  nach Favicons, die dein Browser bereits im Cache hat, und stellt keine
  Netzwerkanfrage an uns oder an die gespeicherten Websites.

### Automatischer Export

- Du kannst optional den geplanten automatischen Export deiner Lesezeichen
  aktivieren. Ist er aktiviert, exportiert die Erweiterung deine Lesezeichen im
  von dir festgelegten Intervall und speichert die entstandenen Dateien, ohne
  einen Dialog zur Wahl des Speicherorts anzuzeigen. Standardmäßig landen sie
  über die Download-Funktion des Browsers direkt im Download-Ordner deines
  Geräts. Wenn du einen benutzerdefinierten Ordner wählst, werden sie
  stattdessen über die File System Access API des Browsers in einen Ordner
  geschrieben, den du auf deinem Computer ausgewählt hast.
- Das geschieht nur, wenn du den automatischen Export ausdrücklich aktivierst
  und einen Zeitplan festlegst; standardmäßig ist er deaktiviert.
- Aufbewahrung: Nach jedem erfolgreichen automatischen Export löscht Snug seine
  eigenen ältesten exportierten Dateien, die über die von dir festgelegte Anzahl
  hinausgehen (standardmäßig 10; 0 behält alle). Es löscht nur Dateien, die es
  selbst gespeichert hat, im Download-Ordner oder in deinem benutzerdefinierten
  Ordner, und berührt nie andere Dateien.
- Benutzerdefinierter Ordner: Der Ordner, den du auswählst, wird auf deinem
  Gerät gespeichert, damit automatische Exporte weiter dorthin schreiben können.
  Der Browser kann dich bitten, den Zugriff erneut zu bestätigen. Dateien werden
  nie an einen Server gesendet, und die Wahl eines Ordners erfordert keine
  zusätzliche Berechtigung.
- Benachrichtigungen: Schlägt ein automatischer Export fehl, zeigt Snug auf
  deinem Gerät eine Systembenachrichtigung mit dem Grund an. Du kannst sie auf
  der Seite Auto-Export deaktivieren. Erfolgreiche Exporte benachrichtigen nie,
  und kein Inhalt der Benachrichtigungen verlässt dein Gerät.
- Optionale Berechtigungen: Die Berechtigungen `downloads` und `notifications`
  sind optional. Snug fordert `downloads` an, wenn du den automatischen Export
  mit dem Ziel Downloads aktivierst, wenn du das Ziel auf Downloads umstellst
  oder wenn du „Jetzt exportieren“ ohne Zugriff auf Downloads verwendest, und
  `notifications` nur, wenn du Benachrichtigungen bei Fehlern aktivierst. Lehnst
  du ab, bleibt die Funktion ausgeschaltet und sonst ändert sich nichts.

### Deinstallationsseite

- Wenn du Snug deinstallierst, öffnet dein Browser eine Abschiedsseite unter
  `https://snug.andryore.dev/goodbye/`. Die Adresse, die Snug dafür hinterlegt,
  enthält drei Werte: die Version der Erweiterung, deine Sprache und ob geplante
  Backups aktiviert sind (`?lang=<code>&v=<version>&ae=<0|1>`). Sie enthält
  keine Kennung und keine deiner Lesezeichen.
- Die Abschiedsseite verwendet Umami, einen Analysedienst ohne Cookies, um den
  Besuch und den Grund zu zählen, auf den du klickst. Sie setzt keine Cookies.
  Einen Grund auszuwählen ist freiwillig.

## Datenspeicherung

- Snug speichert keine Nutzerdaten, einschließlich Lesezeichen, auf externen
  Servern.
- Dateien, die beim Export entstehen (manuell oder automatisch), werden direkt
  auf deinem lokalen Gerät gespeichert: in deinem Download-Ordner über die
  Download-Funktion deines Browsers oder, bei automatischen Exporten, in dem
  benutzerdefinierten Ordner, den du gewählt hast, über die File System Access
  API des Browsers. Manuelle Exporte und die Sicherheits-Snapshot-Datei
  verwenden einen Standard-Link `<a download>` und benötigen die Berechtigung
  `downloads` nicht; nur automatische Exporte, die in deinem Download-Ordner
  gespeichert werden, verwenden die Berechtigung `downloads`, die optional ist
  und wie oben beschrieben angefordert wird.
- Die Erweiterung speichert deine lokalen Einstellungen und Präferenzen, etwa
  das Design, Anzeigeoptionen, Exportoptionen, die Dateinamenvorlage und deine
  Einstellungen für den automatischen Export, im lokalen Speicher des Browsers
  (`storage.local`). Diese Daten bleiben auf deinem Gerät und werden
  nirgendwohin übertragen.
- Wenn du für automatische Exporte einen benutzerdefinierten Ordner wählst,
  speichert Snug den Verweis des Browsers auf diesen Ordner (ein Ordner-Handle,
  nicht deine Lesezeichen oder den Inhalt des Ordners) im lokalen
  Browser-Speicher der Erweiterung (IndexedDB). Er bleibt auf deinem Gerät und
  wird nie an irgendeine Stelle übertragen.
- Snug kann im Popup nach deinem ersten erfolgreichen Export einmalig eine Karte
  anzeigen, die du schließen kannst und die dich einlädt, die Erweiterung in dem
  Store zu bewerten, aus dem sie installiert wurde (Chrome Web Store oder
  Microsoft Edge Add-ons). Damit sie nur einmal erscheint, speichert Snug zwei
  lokale Zeitstempel in `storage.local`: wann die Karte verfügbar wurde und wann
  du sie geschlossen hast. Sie enthalten keine Lesezeicheninhalte, keine
  persönlichen Informationen und keine Kennungen und werden nirgendwohin
  übertragen. Die Karte ist nur ein Link: Ob du die Store-Seite öffnest,
  entscheidest du, und Snug selbst stellt dafür keine Netzwerkanfrage.
- Vor jedem Import mit „Wiederherstellen – ersetzen“ und immer dann, wenn du in
  den Einstellungen selbst einen anlegst, speichert Snug einen
  Sicherheits-Snapshot deiner Lesezeichenleiste und der übrigen Lesezeichen,
  damit sich der Import rückgängig machen lässt. Dabei werden deine
  Lesezeicheninhalte (Titel, Adressen und Ordnerstruktur) lokal im lokalen
  Speicher des Browsers abgelegt, wobei die fünf neuesten Snapshots behalten
  werden, und jeder Snapshot wird zusätzlich als Datei in deinem Download-Ordner
  gespeichert. Das verlässt nie dein Gerät.

## Berechtigungen

Snug fordert die folgenden Browser-Berechtigungen an, die jeweils nur für den
beschriebenen Zweck verwendet werden:

| Berechtigung       | Zweck                                                                                                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Die Lesezeichen deines Browsers lesen und schreiben, um Import und Export zu ermöglichen.                                                                                                                                                                                                                        |
| `favicon`          | Website-Symbole neben den Lesezeichen über die im Browser integrierte `_favicon`-API anzeigen.                                                                                                                                                                                                                   |
| `storage`          | Deine lokalen Einstellungen und Präferenzen auf deinem Gerät speichern.                                                                                                                                                                                                                                          |
| `alarms`           | Automatische Lesezeichen-Exporte im konfigurierten Intervall planen und auslösen.                                                                                                                                                                                                                                |
| `downloads`        | Optional. Wird angefordert, wenn du den automatischen Export mit dem Ziel Downloads aktivierst, das Ziel auf Downloads umstellst oder „Jetzt exportieren“ ohne Zugriff auf Downloads verwendest. Automatische Exporte im Download-Ordner speichern und alte Auto-Export-Dateien von Snug löschen (Aufbewahrung). |
| `notifications`    | Optional. Wird nur angefordert, wenn du Benachrichtigungen bei Fehlern aktivierst. Eine Benachrichtigung auf deinem Gerät anzeigen, wenn ein automatischer Export fehlschlägt. Du kannst sie deaktivieren.                                                                                                       |
| `unlimitedStorage` | Die fünf neuesten Sicherheits-Snapshots deiner Lesezeichen auf deinem Gerät behalten, die bei großen Bibliotheken umfangreich sein können.                                                                                                                                                                       |
| `offscreen`        | Ein kurzlebiges verstecktes Dokument erstellen, damit ein automatischer Export in eine herunterladbare Datei umgewandelt werden kann. Es hat keine Oberfläche und lädt keine Remote-Inhalte.                                                                                                                     |

## Dienste von Drittanbietern

Unsere Erweiterung bindet keine Dienste oder Analysetools von Drittanbietern ein
und verwendet sie nicht. Die einzige Ausnahme ist die Abschiedsseite auf unserer
Website, die Umami (ohne Cookies) verwendet, wie oben unter
„Deinstallationsseite“ beschrieben.

## Änderungen dieser Datenschutzerklärung

Wir können unsere Datenschutzerklärung von Zeit zu Zeit aktualisieren. Über
Änderungen informieren wir dich, indem wir die neue Datenschutzerklärung auf
dieser Seite veröffentlichen und das Datum „Zuletzt aktualisiert“ am Anfang
dieser Erklärung anpassen.

## Kontakt

Wenn du Fragen zu dieser Datenschutzerklärung hast, kannst du uns kontaktieren:

- Per E-Mail: hello@andryore.dev
- Indem du in unserem GitHub-Repository ein Issue eröffnest:
  https://github.com/AndryOre/snug/issues

## Einwilligung

Mit der Nutzung von Snug stimmst du unserer Datenschutzerklärung zu und
akzeptierst ihre Bedingungen.
