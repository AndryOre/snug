---
title: Lesezeichen exportieren
sourceHash: 2c9f860aa372f840
---

1. Schnellexport: Wähle im Popup ein Format und klicke auf „Alle exportieren“,
   um deinen gesamten Lesezeichenbaum zu exportieren.
2. Für mehr Kontrolle darüber, was exportiert wird, öffne die Seite **Export**
   der App:
   - Finde mit dem Suchfeld bestimmte Lesezeichen.
   - Wähle einzelne Lesezeichen oder ganze Ordner aus (oder nutze „Alle
     auswählen“).
   - Passe das Panel **Exportoptionen** an (Favicons, Datumsangaben, Ordner
     ausblenden, Dateinamenvorlage).
   - Wähle das Exportformat und klicke auf „N Lesezeichen exportieren“.

## Exportformate

Snug exportiert sechs Formate:

| Format   | Endung  | Geeignet für                                                           |
| -------- | ------- | ---------------------------------------------------------------------- |
| HTML     | `.html` | Import in jeden Browser (Netscape-Lesezeichendatei).                   |
| JSON     | `.json` | Wiederherstellung in Snug mit Ordnern und Stammpositionen intakt.      |
| CSV      | `.csv`  | Tabellenkalkulationen; eine Zeile pro Lesezeichen mit Spalte `folder`. |
| Markdown | `.md`   | Notizen und Wikis; Ordner werden zu Überschriften und Listen.          |
| OPML     | `.opml` | Feedreader und Outliner.                                               |
| XBEL     | `.xbel` | Andere Lesezeichen-Manager, die das XML-Lesezeichenformat lesen.       |

Markdown und OPML sind nur für den Export gedacht: Snug kann sie nicht wieder
importieren.

## Fortschritt und Abbrechen

Ein langer Export oder Import zeigt eine Fortschrittskarte mit einem laufenden
Zähler. Klicke auf **Abbrechen**, um zu stoppen. Ein abgebrochener Export lädt
keine Datei herunter. Ein abgebrochener Import entfernt die Lesezeichen, die er
bereits hinzugefügt hatte, und ein abgebrochenes Wiederherstellen – Ersetzen
spielt deine vorherigen Lesezeichen aus dem Sicherheits-Snapshot zurück. Wenn du
einen Importstapel abbrichst, sind deine Lesezeichen wieder so, wie sie vor
Beginn des Stapels waren.

## Exportierte Dateien benennen

Standardmäßig heißen exportierte Dateien `Bookmarks_<date>_<time>` (zum Beispiel
`Bookmarks_2026-10-03_14-05-09`). So passt du das an:

1. Öffne die Seite **Export** der App (dasselbe Panel erscheint bei
   **Auto-Export**).
2. Bearbeite unter **Exportoptionen** die „Dateinamenvorlage“. Eine
   Live-Vorschau zeigt beim Tippen den resultierenden Dateinamen.
3. Mit diesen Platzhaltern (ohne Beachtung der Groß- und Kleinschreibung) fügst
   du das aktuelle Datum und die Uhrzeit ein:

   | Platzhalter | Wert     |
   | ----------- | -------- |
   | `%yyyy`     | Jahr (4) |
   | `%yy`       | Jahr (2) |
   | `%mm`       | Monat    |
   | `%dd`       | Tag      |
   | `%hh`       | Stunde   |
   | `%min`      | Minute   |
   | `%sec`      | Sekunde  |

   Zum Beispiel ergibt `%yyyy%mm%dd myPc` den Namen `20260930 myPc.html` (und
   die passende Endung bei den anderen Formaten).

Die Vorlage gilt überall, wo ein Dateiname erzeugt wird: beim einfachen Export
aus dem Popup, auf der Exportseite und beim Auto-Export. Zeichen, die in
Dateinamen nicht erlaubt sind (`/ \ : * ? " < > |`), werden durch `_` ersetzt,
und eine Vorlage, die am Ende leer ist, fällt auf „Bookmarks“ zurück.
