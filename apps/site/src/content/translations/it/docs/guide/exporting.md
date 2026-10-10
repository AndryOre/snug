---
title: Esportare i segnalibri
sourceHash: 2c9f860aa372f840
---

1. Esportazione rapida: nel popup, scegli un formato e fai clic su "Esporta
   tutto" per esportare l'intero albero dei segnalibri.
2. Per controllare cosa viene esportato, apri la pagina **Esporta** dell'app:
   - Usa la casella di ricerca per trovare segnalibri specifici.
   - Seleziona singoli segnalibri o intere cartelle (oppure usa "Seleziona
     tutto").
   - Regola il pannello **Opzioni di esportazione** (favicon, date, nascondere
     cartelle, modello del nome file).
   - Scegli il formato di esportazione e fai clic su "Esporta N segnalibri".

## Formati di esportazione

Snug esporta sei formati:

| Formato  | Estensione | Ideale per                                                             |
| -------- | ---------- | ---------------------------------------------------------------------- |
| HTML     | `.html`    | Importare in qualsiasi browser (file di segnalibri Netscape).          |
| JSON     | `.json`    | Ripristinare in Snug con cartelle e posizioni radice intatte.          |
| CSV      | `.csv`     | Fogli di calcolo; una riga per segnalibro con una colonna `folder`.    |
| Markdown | `.md`      | Note e wiki; le cartelle diventano titoli ed elenchi.                  |
| OPML     | `.opml`    | Lettori di feed e outliner.                                            |
| XBEL     | `.xbel`    | Altri gestori di segnalibri che leggono il formato XML dei segnalibri. |

Markdown e OPML sono solo per l'esportazione: Snug non può reimportarli.

## Avanzamento e Annulla

Un'esportazione o un'importazione lunga mostra una scheda di avanzamento con un
conteggio progressivo. Fai clic su **Annulla** per interromperla.
Un'esportazione annullata non scarica alcun file. Un'importazione annullata
rimuove i segnalibri già aggiunti, e un Ripristina — sostituisci annullato
rimette i tuoi segnalibri precedenti dall'istantanea di sicurezza. Annulla su un
lotto di importazione rimette i tuoi segnalibri com'erano prima dell'inizio del
lotto.

## Dare un nome ai file esportati

Per impostazione predefinita, i file esportati si chiamano
`Bookmarks_<date>_<time>` (per esempio `Bookmarks_2026-10-03_14-05-09`). Per
personalizzarlo:

1. Apri la pagina **Esporta** dell'app (lo stesso pannello appare in
   **Esportazione automatica**).
2. In **Opzioni di esportazione**, modifica "Modello del nome file".
   Un'anteprima dal vivo mostra il nome file risultante mentre scrivi.
3. Usa questi segnaposto (senza distinzione tra maiuscole e minuscole) per
   includere la data e l'ora correnti:

   | Segnaposto | Valore   |
   | ---------- | -------- |
   | `%yyyy`    | Anno (4) |
   | `%yy`      | Anno (2) |
   | `%mm`      | Mese     |
   | `%dd`      | Giorno   |
   | `%hh`      | Ora      |
   | `%min`     | Minuto   |
   | `%sec`     | Secondo  |

   Per esempio, `%yyyy%mm%dd myPc` produce `20260930 myPc.html` (e l'estensione
   corrispondente per gli altri formati).

Il modello si applica ovunque venga generato un nome file: l'esportazione di
base dal popup, la pagina Esporta e l'Esportazione automatica. I caratteri non
consentiti nei nomi file (`/ \ : * ? " < > |`) vengono sostituiti con `_`, e un
modello che risulta vuoto torna a "Bookmarks".
