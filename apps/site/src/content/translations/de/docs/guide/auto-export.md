---
title: Auto-Export
sourceHash: f658d7e50cc058b1
description:
  'Plane den automatischen Export deiner Lesezeichen in Chrome. Wähle Formate,
  Intervall und Ordner, Snug speichert die Dateien ohne Speicherdialog.'
seoTitle: 'Automatischen Lesezeichen-Export in Chrome planen'
---

Snug kann deine Lesezeichen nach Zeitplan exportieren, ganz ohne manuelles
Zutun:

1. Öffne die Seite **Auto-Export** der App.
2. Aktiviere den automatischen Export und wähle eines oder mehrere der sechs
   Formate, wo sie gespeichert werden (Downloads oder ein eigener Ordner), ein
   Intervall und optional einen Unterordnerpfad für die exportierten Dateien.
   Die Intervalle sind stündlich, alle 12 Stunden, täglich, alle 3 Tage oder
   wöchentlich. Tägliche, 3-Tage- und wöchentliche Läufe finden zu einer
   bevorzugten Uhrzeit statt; bei wöchentlichen Läufen kannst du außerdem den
   Tag wählen. Stündliche und 12-Stunden-Läufe ignorieren die Uhrzeit.
3. Von da an exportiert die Erweiterung deine Lesezeichen nach diesem Zeitplan
   und speichert die Dateien direkt am gewählten Ort, standardmäßig in Downloads
   – ohne Speichern-Dialog und ohne zusätzliche Rückfragen. Wenn der Browser
   geschlossen oder die Erweiterung nicht verfügbar war, als ein geplanter
   Export fällig wurde, holt sie ihn kurz nach dem nächsten Start des Browsers
   automatisch nach, statt auf den nächsten geplanten Zeitpunkt zu warten.

Snug bittet in drei Fällen um Zugriff auf Downloads: wenn du den automatischen
Export mit Downloads als Ziel einschaltest, wenn du bei **Speichern unter** auf
**Downloads** wechselst und wenn du **Jetzt exportieren** ohne diesen Zugriff
ausführst. Der Browser zeigt dazu seine eigene Berechtigungsabfrage. Lehnst du
ab, wird nichts gespeichert: Der automatische Export bleibt aus, das Ziel bleibt
unverändert, und der Export läuft nicht. Die Seite zeigt dann „Der automatische
Export bleibt aus, weil die Berechtigung nicht erteilt wurde. Du kannst ihn
jederzeit wieder einschalten.“, „Das Ziel bleibt unverändert, weil die
Berechtigung nicht erteilt wurde.“ bzw. „Jetzt exportieren braucht die
Erlaubnis, in Downloads zu speichern, und sie wurde nicht erteilt.“ Das Popup
zeigt den automatischen Export weiterhin als aus an.

Ist der automatische Export bereits mit Downloads als Ziel eingeschaltet und
fehlt der Zugriff später, etwa weil du ihn in den Browsereinstellungen entzogen
hast, zeigt die Seite **Auto-Export** einen Hinweis mit dem Titel „Snug braucht
die Erlaubnis, in Downloads zu speichern“. Die Beschreibung lautet „Der
automatische Export kann erst laufen, wenn du es erlaubst. Bereits gespeicherte
Dateien sind nicht betroffen.“ Wähle **Zugriff erlauben**, um den Zugriff erneut
zu erteilen. Das Popup zeigt dann „Erlaube den Zugriff auf Downloads, um weiter
zu sichern“ mit der Schaltfläche **Automatischen Export öffnen**, die dich zur
Seite zurückbringt.

**Speichern unter** legt das Ziel fest. **Downloads** (Standard) speichert im
Downloads-Ordner deines Browsers. **Eigener Ordner** speichert in einem Ordner,
den du an beliebiger Stelle auf deinem Computer auswählst: Wähle **Ordner
auswählen…** und später **Ordner ändern**, um einen anderen zu wählen. Wähle
jederzeit wieder **Downloads**, um zurückzuwechseln. Der Unterordnerpfad ist
relativ zum Ziel, benennt also einen Ordner innerhalb des gewählten Ordners.
Existiert bereits eine Datei mit demselben Namen, hängt Snug das Suffix „ (1)“
an und überschreibt sie nie.

Nach dem ersten Neustart des Browsers bittet Chrome einmalig darum, den Zugriff
auf den eigenen Ordner zu bestätigen. Wähle „Bei jedem Besuch zulassen“, damit
unbeaufsichtigte Läufe weiter funktionieren.

Fehlt der Zugriff auf den Ordner, warnt dich Snug beim Start des Browsers. Das
Popup und die Seite **Auto-Export** zeigen dann „Ordnerzugriff erforderlich“ mit
der Schaltfläche **Zugriff erlauben**. Bis du den Zugriff erlaubst, schlagen
Läufe fehl, und es wird nichts stattdessen in Downloads gespeichert.

**Die letzten N Durchläufe behalten** (Aufbewahrung, Standard 10) begrenzt, wie
viele Exporte sich ansammeln: Nach jedem erfolgreichen Lauf behält Snug die
neuesten N Durchläufe über Downloads und den eigenen Ordner hinweg und löscht
die Dateien seiner eigenen älteren Durchläufe (alle Formate eines behaltenen
Durchlaufs bleiben erhalten). Dateien in Downloads verlieren außerdem ihre
Einträge im Download-Verlauf des Browsers. Es entfernt immer nur Dateien, die
Snug selbst gespeichert hat, niemals andere Dateien im Ordner, und eine Datei,
die du bereits gelöscht oder verschoben hast, wird einfach übersprungen. Nach
einem Ordnerwechsel bleiben die Dateien im alten Ordner unberührt. Ein
fehlgeschlagener Lauf löscht nichts. Mit 0 bleibt alles erhalten.

**Benachrichtigen, wenn ein Export fehlschlägt** (standardmäßig an) zeigt eine
Systembenachrichtigung mit dem Titel „Snug · Auto-Export fehlgeschlagen“ und dem
Grund, wenn ein Lauf fehlschlägt. Ein Klick darauf öffnet die Seite Auto-Export.
Erfolgreiche Läufe benachrichtigen nie, und wiederholte Fehler ersetzen die
vorherige Benachrichtigung, statt sich zu stapeln. Ein fehlgeschlagener
geplanter oder nachgeholter Lauf setzt außerdem ein „!“-Badge auf das
Symbolleistensymbol, bis ein Lauf erfolgreich ist. Beim Einschalten wird die
Berechtigung für Benachrichtigungen angefragt. Lehnst du ab, bleibt der Schalter
aus, und die Seite zeigt „Benachrichtigungen bleiben aus. Ein fehlgeschlagener
Lauf erscheint weiterhin im Status.“

Änderungen auf der Seite **Auto-Export** werden automatisch gespeichert. Ihre
Statuskarte zeigt immer den tatsächlichen Zustand des Zeitplans, unabhängig von
ungespeicherten Änderungen darunter:

- **Letzter Lauf** – wann der Auto-Export zuletzt lief, mit seinem Ergebnis und
  bei einem Fehler der gespeicherten Fehlermeldung. Das Popup zeigt in seiner
  Auto-Export-Statuszeile außerdem den nächsten Lauf oder einen Fehlerhinweis.
- **Nächster Lauf** – wann er als Nächstes fällig ist, oder „Auto-Export ist
  aus“, wenn der automatische Export derzeit deaktiviert ist.

**Jetzt exportieren** führt sofort einen Export mit den Formaten und dem Pfad
aus, die gerade auf dem Bildschirm eingestellt sind, auch wenn der Schalter
Aktivieren aus ist. Während des Laufs zeigt es einen Spinner und nach dem
Abschluss kurz eine Erfolgs- oder Fehlermeldung; die Zeile „Letzter Lauf“ der
Statuskarte wird entsprechend aktualisiert. Dadurch ändern sich dein
automatischer Zeitplan und sein nächster Fälligkeitszeitpunkt nie.
