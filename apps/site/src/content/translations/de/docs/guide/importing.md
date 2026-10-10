---
title: Lesezeichen importieren
sourceHash: 4c537c8e1b7a7231
---

1. Schnellimport, aus dem Popup:
   - Ändere bei Bedarf den Standard-Importmodus (siehe
     [**Einstellungen**](settings.md)) – er steht anfangs auf **Wiederherstellen
     – zusammenführen**.
   - Klicke auf „Dateien auswählen…“ und wähle eine oder mehrere
     Lesezeichendateien aus (siehe **Importquellen** unten) oder ziehe sie auf
     den Importbereich des Popups. Beim Ziehen erscheint ein Overlay „Dateien
     zum Importieren ablegen“. Dateien, die abgelegt werden, während ein Import
     läuft, werden ignoriert.
   - Die Erweiterung erkennt jedes Format automatisch und importiert die
     Lesezeichen sofort mit dem Standard-Importmodus. Eine CSV-Datei – oder jede
     andere Datei ohne Daten zu Lesezeichenleiste oder Weiteren Lesezeichen –
     wird unabhängig vom Standardmodus immer in einen neuen Ordner „Importierte
     Lesezeichen“ importiert.
   - Mehrere Dateien werden gemeinsam als ein **Importstapel** importiert (siehe
     unten). Eine Datei, die Snug nicht lesen kann, wird ausgelassen. Die
     Warnung listet bis zu drei übersprungene Dateien als `name: reason` auf,
     dann „und N weitere“.
   - Wenn der Standardmodus **Wiederherstellen – ersetzen** ist, zeigt das Popup
     nur eine Inline-Warnung, dass deine vorhandenen Lesezeichen ersetzt werden.
     Wenn du eine Datei auswählst, öffnet sich die Seite **Import** der App, wo
     du das Ersetzen prüfst und bestätigst (zuvor wird ein Sicherheits-Snapshot
     gespeichert, damit du es rückgängig machen kannst). Auch sehr große Importe
     öffnen die Seite **Import**.
2. Erst die Vorschau, von der Seite **Import** der App:
   - Ziehe eine oder mehrere Lesezeichendateien hierher oder wähle sie aus. Jede
     Datei erhält eine Zeile mit ihrem erkannten Format und der Anzahl der
     Lesezeichen oder dem Grund, warum sie nicht gelesen werden kann. Du kannst
     eine Datei entfernen oder mit **Dateien hinzufügen** weitere hinzufügen.
   - Eine detaillierte Vorschau zeigt den Lesezeichenbaum so, wie er importiert
     würde. Lesezeichen, die Duplikate überspringen auslassen würde, tragen das
     Badge `Duplikat · übersprungen`, sodass du die Datei beurteilen kannst,
     bevor sich etwas ändert.
   - Wähle einen Importmodus (aus deinem Standard vorausgewählt):
     - **Ordner erstellen**: legt jedes Lesezeichen in einem neuen Ordner
       „Importierte Lesezeichen“ ab. Verfügbar für jede Datei, auch CSV (die
       keine Ordnerstruktur zum Wiederherstellen hat).
     - **Wiederherstellen – zusammenführen**: legt Lesezeichen an ihren
       ursprünglichen Orten neben deinen vorhandenen ab. Nur für JSON-/HTML-
       Dateien verfügbar, die Ortsdaten enthalten.
     - **Wiederherstellen – ersetzen**: leert zuerst deine aktuelle
       Lesezeichenleiste und Weitere Lesezeichen und stellt dann die Lesezeichen
       an ihren ursprünglichen Orten wieder her. Nur für Dateien verfügbar, die
       Ortsdaten enthalten, und nur für jeweils eine Datei.
   - Wenn du „Wiederherstellen – ersetzen“ wählst, wird angezeigt, wie viele
     Lesezeichen das Ersetzen entfernt und hinzufügt, die zu löschenden
     Lesezeichen werden aufgelistet, und vor dem Import muss ein Warndialog
     bestätigt werden.
   - **Duplikate überspringen** (standardmäßig an) lässt jedes Lesezeichen aus,
     dessen URL in deinem Browser bereits vorhanden ist, und sagt dir, wie viele
     der ausgewählten Lesezeichen übersprungen werden. Es gilt für Ordner
     erstellen und Wiederherstellen – zusammenführen, nicht für Wiederherstellen
     – ersetzen. Der Schalter wird gemeinsam mit dem Schnellimport verwendet.

## Importauswahl

Bei Ordner erstellen und Wiederherstellen – zusammenführen hat der Vorschaubaum
Kontrollkästchen. Wähle einzelne Lesezeichen, ganze Ordner oder eine Mischung
aus, und Snug importiert nur die **Importauswahl**. Wiederherstellen – ersetzen
hat keine Auswahl: Es importiert immer alles.

## Importstapel

Mehrere gleichzeitig importierte Dateien laufen als ein **Importstapel**: ein
Importmodus, eine Vorschau und ein Fortschritt. Snug prüft die vorhandenen URLs
nur einmal, sodass Duplikate überspringen auch ein Lesezeichen auslässt, das in
zwei der Dateien vorkommt.

- Bei Ordner erstellen mit zwei oder mehr Dateien landet jede Datei in einem
  eigenen Ordner, der nach der Datei benannt ist (ohne ihre Endung). Eine
  einzelne Datei behält den Ordner „Importierte Lesezeichen“, und CSV-Dateien
  verwenden ihn immer.
- Wiederherstellen – ersetzen braucht genau eine Datei. Bei zwei oder mehr
  Dateien ist es deaktiviert, weil die zweite Datei die erste löschen würde.
- Eine Datei, die nicht gelesen werden kann, wird bei der Vorschau ausgelassen
  und im Ergebnis aufgelistet.
- Abbrechen oder ein Fehler mittendrin stellt deine Lesezeichen so wieder her,
  wie sie vor Beginn des Stapels waren.

## Importquellen

Snug erkennt das Format am MIME-Typ der Datei, dann an ihrer Endung und zuletzt
an ihrem Inhalt. Es liest:

- Exporte von Snug und Browsern: HTML (Netscape-Lesezeichendatei), JSON, CSV und
  XBEL.
- Die Datei `Bookmarks` eines Chrome-Profils (die rohe JSON-Datei im
  Chrome-Profilordner). Ihre Ordner landen an ihren ursprünglichen Orten.
- Einen Safari-Export (HTML). Favoriten wird zur Lesezeichenleiste; die
  Leseliste und die übrigen Safari-Ordner bleiben in Weiteren Lesezeichen, wobei
  die Leseliste in einem eigenen Ordner liegt.

## Der Sicherheits-Snapshot und Rückgängig

Vor jedem Wiederherstellen – ersetzen speichert Snug einen
**Sicherheits-Snapshot** deiner Lesezeichenleiste und Weiterer Lesezeichen: eine
JSON-Datei in deinem Downloads-Ordner (`snug-safety-snapshot-<date>.json`) sowie
eine Kopie innerhalb der Erweiterung. Die Bestätigung des Ersetzens weist darauf
hin und verlinkt auf die Karte für Sicherheits-Snapshots in den Einstellungen.
Wenn der Snapshot nicht gespeichert werden kann, wird nichts gelöscht.

- Nach einem Ersetzen stellt **Import rückgängig machen** im Ergebnis den
  Snapshot wieder her.
- In den **Einstellungen** listet die Karte für Sicherheits-Snapshots die
  neuesten fünf Snapshots auf. Du kannst jeden davon nach einer Bestätigung
  wiederherstellen oder herunterladen und jederzeit einen neuen erstellen.

Snug behält die neuesten fünf Snapshots, ein sechster ersetzt also den ältesten,
mit der Ausnahme, dass der neueste Snapshot mit Lesezeichen nie verworfen wird.
Das Wiederherstellen eines Snapshots ist selbst ein Ersetzen, deshalb speichert
Snug zuerst einen neuen Snapshot deiner aktuellen Lesezeichen. Alles bleibt auf
deinem Gerät, und Snug stellt keine Netzwerkanfragen.
