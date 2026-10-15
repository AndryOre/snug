---
title: FAQ
sourceHash: 304e0622b68c13d7
description:
  'Antworten auf häufige Fragen zu Snug: mehrere Dateien importieren,
  Berechtigungen, unterstützte Formate und Browser, Sicherheit und
  Backup-Ordner.'
seoTitle: 'Snug-FAQ: Formate, Browser, Sicherheit und Backups'
---

Kurze Antworten auf die Fragen, die zu Snug am häufigsten gestellt werden.

## Kann ich mehrere Dateien gleichzeitig importieren?

Ja. Wähle auf der Importseite oder im Popup der Symbolleiste mehrere Dateien aus
oder ziehe sie dorthin, und Snug importiert sie in einem Durchgang.

## Warum braucht es Zugriff auf alle meine Lesezeichen?

Sie zu lesen und zu schreiben ist die einzige Möglichkeit, wie eine Erweiterung
sie exportieren und importieren kann. Snug stellt keine Netzwerkverbindungen
her, deshalb kann nichts von dem, was es liest, dein Gerät verlassen.

## Welche Formate unterstützt es?

Export als HTML, JSON, CSV, Markdown, OPML oder XBEL. Import von HTML, JSON, CSV
oder XBEL, einer „Bookmarks“-Datei eines Chrome-Profils oder einem
Safari-Export.

## In welchen Browsern funktioniert es?

In Chrome und anderen Chromium-Browsern wie Edge, Brave und Opera.

## Ist es sicher, die Erweiterung eines Einzelentwicklers zu installieren?

Der Quellcode ist öffentlich, CodeQL scannt ihn, das Projekt hat
OpenSSF-Scorecard- und Best-Practices-Badges, und die CI läuft mit festgelegten
Versionen. Urteile selbst auf GitHub.

## Können Backups in einem anderen Ordner als Downloads landen?

Ja. Wähle auf der Seite [Auto-Export](auto-export.md) einen Eigenen Ordner. Nach
einem Neustart bittet Chrome einmalig darum, den Zugriff zu bestätigen; wähle
„Bei jedem Besuch zulassen“, damit unbeaufsichtigte Läufe weiterlaufen. Fehlt
der Zugriff, warnt Snug dich, und der Lauf schlägt fehl, statt woanders zu
speichern.
