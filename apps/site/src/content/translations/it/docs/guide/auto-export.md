---
title: Esportazione automatica
sourceHash: 5eb2acaa2e4867cc
---

Snug può esportare i tuoi segnalibri in modo pianificato, senza alcuna azione
manuale:

1. Apri la pagina **Esportazione automatica** dell'app.
2. Attiva l'esportazione automatica, scegli uno o più dei sei formati, dove
   salvarli (Download o una cartella personalizzata), un intervallo e,
   facoltativamente, un percorso di sottocartella per i file esportati. Gli
   intervalli sono ogni ora, ogni 12 ore, ogni giorno, ogni 3 giorni o ogni
   settimana. Le esecuzioni giornaliere, ogni 3 giorni e settimanali avvengono a
   un orario preferito; in quelle settimanali puoi scegliere anche il giorno. Le
   esecuzioni orarie e ogni 12 ore ignorano l'orario.
3. Da quel momento l'estensione esporta i tuoi segnalibri secondo quella
   pianificazione e salva i file direttamente nel luogo scelto, per impostazione
   predefinita Download, senza finestre di salvataggio né altre richieste. Se il
   browser era chiuso o l'estensione non era disponibile quando era prevista
   un'esportazione pianificata, questa viene recuperata automaticamente poco
   dopo il successivo avvio del browser, senza aspettare la pianificazione
   successiva.

**Salva in** imposta la destinazione. **Download** (predefinito) salva nella
cartella Download del browser. **Cartella personalizzata** salva in una cartella
che scegli in qualsiasi punto del computer: seleziona **Scegli cartella…** e, in
seguito, **Cambia cartella** per sceglierne un'altra. Seleziona di nuovo
**Download** in qualsiasi momento per tornare indietro. Il percorso della
sottocartella è relativo alla destinazione, quindi indica una cartella dentro
quella scelta. Se esiste già un file con lo stesso nome, Snug aggiunge il
suffisso " (1)" e non lo sovrascrive mai.

Dopo il primo riavvio del browser, Chrome chiede una sola volta di confermare
l'accesso alla cartella personalizzata. Scegli "Consenti a ogni visita" per
mantenere attive le esecuzioni non presidiate.

Se manca l'accesso alla cartella, Snug ti avvisa all'avvio del browser. Il popup
e la pagina **Esportazione automatica** mostrano allora "Accesso alla cartella
necessario" con un pulsante **Consenti accesso**. Finché non consenti l'accesso,
le esecuzioni non riescono e non viene salvato nulla in Download al suo posto.

**Mantieni le ultime N esecuzioni** (Conservazione, predefinito 10) limita
quante esportazioni si accumulano: dopo ogni esecuzione riuscita, Snug mantiene
le N esecuzioni più recenti tra Download e cartella personalizzata ed elimina i
file delle proprie esecuzioni più vecchie (tutti i formati di un'esecuzione
mantenuta restano). I file salvati in Download perdono anche le relative voci
nella cronologia dei download del browser. Rimuove solo i file salvati da Snug,
mai altri file nella cartella, e un file che hai già eliminato o spostato viene
semplicemente saltato. Se cambi cartella, i file nella vecchia cartella non
vengono toccati. Un'esecuzione non riuscita non elimina nulla. Imposta 0 per
conservare tutto.

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
