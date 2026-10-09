---
englishLastUpdated: October 6, 2026
---

# Datenschutzerklärung von Snug

Zuletzt aktualisiert: 6. Oktober 2026

## Einleitung

Snug verpflichtet sich, deine Privatsphäre zu schützen. Diese
Datenschutzerklärung beschreibt, wie wir mit den Informationen umgehen, die wir
über unsere Browser-Erweiterung erhalten, und wie wir sie erheben, verwenden und
weitergeben.

## Erhebung und Verwendung von Informationen

Snug erhebt, speichert oder überträgt keine personenbezogenen Daten seiner
Nutzer. Unsere Erweiterung läuft vollständig in deinem Browser und sendet keine
Daten an externe Server.

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
  von dir festgelegten Intervall und schreibt die entstandenen Dateien über die
  Download-Funktion des Browsers direkt in den Download-Ordner deines Geräts,
  ohne einen Dialog zur Wahl des Speicherorts anzuzeigen.
- Das geschieht nur, wenn du den automatischen Export ausdrücklich aktivierst
  und einen Zeitplan festlegst; standardmäßig ist er deaktiviert.
- Aufbewahrung: Nach jedem erfolgreichen automatischen Export löscht Snug seine
  eigenen ältesten exportierten Dateien, die über die von dir festgelegte Anzahl
  hinausgehen (standardmäßig 10; 0 behält alle). Es löscht nur Dateien, die es
  selbst gespeichert hat, und berührt nie andere Dateien in deinem
  Download-Ordner.
- Benachrichtigungen: Schlägt ein automatischer Export fehl, zeigt Snug auf
  deinem Gerät eine Systembenachrichtigung mit dem Grund an. Du kannst sie auf
  der Seite Auto-Export deaktivieren. Erfolgreiche Exporte benachrichtigen nie,
  und kein Inhalt der Benachrichtigungen verlässt dein Gerät.

## Datenspeicherung

- Snug speichert keine Nutzerdaten, einschließlich Lesezeichen, auf externen
  Servern.
- Dateien, die beim Export entstehen (manuell oder automatisch), werden über die
  Download-Funktion deines Browsers direkt auf deinem lokalen Gerät gespeichert.
  Manuelle Exporte verwenden einen Standard-Link `<a download>` und benötigen
  die Berechtigung `downloads` nicht; automatische Exporte und die
  Sicherheits-Snapshot-Datei verwenden die Berechtigung `downloads`.
- Die Erweiterung speichert deine lokalen Einstellungen und Präferenzen, etwa
  das Design, Anzeigeoptionen, Exportoptionen, die Dateinamenvorlage und deine
  Einstellungen für den automatischen Export, im lokalen Speicher des Browsers
  (`storage.local`). Diese Daten bleiben auf deinem Gerät und werden
  nirgendwohin übertragen.
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

| Berechtigung       | Zweck                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Die Lesezeichen deines Browsers lesen und schreiben, um Import und Export zu ermöglichen.                                                                                                    |
| `favicon`          | Website-Symbole neben den Lesezeichen über die im Browser integrierte `_favicon`-API anzeigen.                                                                                               |
| `storage`          | Deine lokalen Einstellungen und Präferenzen auf deinem Gerät speichern.                                                                                                                      |
| `alarms`           | Automatische Lesezeichen-Exporte im konfigurierten Intervall planen und auslösen.                                                                                                            |
| `downloads`        | Automatische Exporte und Sicherheits-Snapshot-Dateien auf deinem Gerät speichern und alte Auto-Export-Dateien von Snug löschen (Aufbewahrung).                                               |
| `notifications`    | Eine Benachrichtigung auf deinem Gerät anzeigen, wenn ein automatischer Export fehlschlägt. Du kannst sie deaktivieren.                                                                      |
| `unlimitedStorage` | Die fünf neuesten Sicherheits-Snapshots deiner Lesezeichen auf deinem Gerät behalten, die bei großen Bibliotheken umfangreich sein können.                                                   |
| `offscreen`        | Ein kurzlebiges verstecktes Dokument erstellen, damit ein automatischer Export in eine herunterladbare Datei umgewandelt werden kann. Es hat keine Oberfläche und lädt keine Remote-Inhalte. |

## Dienste von Drittanbietern

Unsere Erweiterung bindet keine Dienste oder Analysetools von Drittanbietern ein
und verwendet sie nicht.

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
