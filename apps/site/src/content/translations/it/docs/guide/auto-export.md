---
title: Esportazione automatica
sourceHash: 3b23ffc5e9f86ebd
---

Snug può esportare i tuoi segnalibri in modo pianificato, senza alcuna azione
manuale:

1. Apri la pagina **Esportazione automatica** dell'app.
2. Attiva l'esportazione automatica, scegli uno o più dei sei formati, un
   intervallo e, facoltativamente, un percorso di cartella per i file esportati.
   Gli intervalli sono ogni ora, ogni 12 ore, ogni giorno, ogni 3 giorni o ogni
   settimana. Le esecuzioni giornaliere, ogni 3 giorni e settimanali avvengono a
   un orario preferito; in quelle settimanali puoi scegliere anche il giorno. Le
   esecuzioni orarie e ogni 12 ore ignorano l'orario.
3. Da quel momento l'estensione esporta i tuoi segnalibri secondo quella
   pianificazione e salva i file direttamente nella cartella Download, senza
   finestre di salvataggio né altre richieste. Se il browser era chiuso o
   l'estensione non era disponibile quando era prevista un'esportazione
   pianificata, questa viene recuperata automaticamente poco dopo il successivo
   avvio del browser, senza aspettare la pianificazione successiva.

**Mantieni le ultime N esecuzioni** (Conservazione, predefinito 10) limita
quante esportazioni si accumulano: dopo ogni esecuzione riuscita, Snug elimina i
file delle proprie esecuzioni più vecchie oltre N (tutti i formati di
un'esecuzione mantenuta restano) e le relative voci nella cronologia dei
download del browser. Rimuove solo i file salvati da Snug, mai altri file nella
cartella, e un file che hai già eliminato o spostato viene semplicemente
saltato. Un'esecuzione non riuscita non elimina nulla. Imposta 0 per conservare
tutto.

**Avvisami quando un'esportazione non riesce** (attivo per impostazione
predefinita) mostra una notifica di sistema, intitolata "Snug · Esportazione
automatica non riuscita" e con il motivo, quando un'esecuzione fallisce. Facendo
clic si apre la pagina Esportazione automatica. Le esecuzioni riuscite non
notificano mai, e gli errori ripetuti sostituiscono la notifica precedente
invece di accumularsi. Un'esecuzione pianificata o di recupero non riuscita
aggiunge anche un badge "!" sull'icona della barra degli strumenti finché
un'esecuzione non riesce.

Le modifiche nella pagina **Esportazione automatica** vengono salvate
automaticamente. La sua scheda di stato mostra sempre lo stato reale della
pianificazione, indipendentemente da eventuali modifiche non salvate sotto di
essa:

- **Ultima esecuzione** — quando l'esportazione automatica è stata eseguita
  l'ultima volta, con il suo esito e, in caso di errore, il messaggio di errore
  salvato. Il popup mostra anche la prossima esecuzione, o un avviso di errore,
  nella sua riga di stato dell'esportazione automatica.
- **Prossima esecuzione** — quando è prevista, oppure "L'esportazione automatica
  è disattivata" se l'esportazione automatica è disattivata.

**Esporta ora** avvia subito un'esportazione con i formati e il percorso
attualmente visibili a schermo, anche se l'interruttore Attiva è disattivato.
Mostra uno spinner durante l'esecuzione e un breve messaggio di successo o di
errore al termine; la riga "Ultima esecuzione" della scheda di stato si aggiorna
di conseguenza. Eseguirla non modifica mai la pianificazione automatica né la
prossima scadenza.
