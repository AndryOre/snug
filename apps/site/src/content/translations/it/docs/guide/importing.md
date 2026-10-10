---
title: Importare i segnalibri
sourceHash: 4c537c8e1b7a7231
---

1. Importazione rapida, dal popup:
   - Se vuoi, cambia la modalità di importazione predefinita (vedi
     [**Impostazioni**](settings.md)): parte da **Ripristina — unisci**.
   - Fai clic su "Scegli i file…" e seleziona uno o più file di segnalibri (vedi
     **Fonti di importazione** più sotto), oppure rilasciali sulla sezione
     Importa del popup. Mentre trascini compare una sovrapposizione "Rilascia i
     file per importarli". I file rilasciati mentre un'importazione è in corso
     vengono ignorati.
   - L'estensione rileva automaticamente ogni formato e importa subito i
     segnalibri con la modalità di importazione predefinita. Un file CSV — o
     qualsiasi altro file senza dati di Barra dei segnalibri/Altri segnalibri —
     viene sempre importato in una nuova cartella "Segnalibri importati",
     indipendentemente dalla modalità predefinita.
   - Più file vengono importati insieme come un unico **Lotto di importazione**
     (vedi sotto). Un file che Snug non riesce a leggere viene escluso. L'avviso
     elenca fino a tre file saltati come `nome: motivo`, poi "e altri N".
   - Se la modalità predefinita è **Ripristina — sostituisci**, il popup mostra
     solo un avviso in linea che i tuoi segnalibri esistenti verranno
     sostituiti. Scegliere un file apre poi la pagina **Importa** dell'app, dove
     controlli la sostituzione e la confermi (prima viene salvata un'istantanea
     di sicurezza, così puoi annullarla). Anche le importazioni molto grandi
     aprono la pagina **Importa**.
2. Prima l'anteprima, dalla pagina **Importa** dell'app:
   - Rilascia o seleziona uno o più file di segnalibri. Ogni file ha una riga
     con il formato rilevato e il numero di segnalibri, oppure il motivo per cui
     non può essere letto. Puoi rimuovere un file o usare **Aggiungi file** per
     aggiungerne altri.
   - Un'anteprima dettagliata mostra l'albero dei segnalibri come verrebbe
     importato. I segnalibri che Salta i duplicati escluderebbe hanno un badge
     `Duplicato · saltato`, così puoi valutare il file prima che cambi qualcosa.
   - Scegli una modalità di importazione (preselezionata in base a quella
     predefinita):
     - **Crea cartella**: aggiunge tutti i segnalibri a una nuova cartella
       "Segnalibri importati". Disponibile per qualsiasi file, anche CSV (che
       non ha una struttura di cartelle da ripristinare).
     - **Ripristina — unisci**: inserisce i segnalibri nelle loro posizioni
       originali, insieme a quelli esistenti. Disponibile solo per file
       JSON/HTML che contengono dati sulla posizione.
     - **Ripristina — sostituisci**: svuota prima la tua Barra dei segnalibri e
       Altri segnalibri, poi ripristina i segnalibri nelle loro posizioni
       originali. Disponibile solo per file che contengono dati sulla posizione
       e per un file alla volta.
   - Selezionando "Ripristina — sostituisci" viene mostrato quanti segnalibri la
     sostituzione rimuoverà e aggiungerà, vengono elencati i segnalibri che
     saranno eliminati, ed è necessario confermare una finestra di avviso prima
     che l'importazione venga eseguita.
   - **Salta i duplicati** (attivo per impostazione predefinita) esclude
     qualsiasi segnalibro il cui URL esiste già nel tuo browser e ti dice quanti
     dei segnalibri selezionati salterà. Si applica a Crea cartella e Ripristina
     — unisci, non a Ripristina — sostituisci. L'interruttore è condiviso con
     l'Importazione rapida.

## Selezione di importazione

In Crea cartella e Ripristina — unisci, l'albero dell'anteprima ha caselle di
controllo. Seleziona singoli segnalibri, intere cartelle o un mix, e Snug
importa solo la **Selezione di importazione**. Ripristina — sostituisci non ha
selezione: importa sempre tutto.

## Lotto di importazione

Più file importati insieme vengono eseguiti come un unico **Lotto di
importazione**: una modalità di importazione, un'anteprima e un avanzamento.
Snug controlla una sola volta gli URL esistenti, quindi Salta i duplicati
esclude anche un segnalibro che compare in due dei file.

- In Crea cartella con due o più file, ogni file va in una cartella propria con
  il nome del file (senza estensione). Un singolo file mantiene la cartella
  "Segnalibri importati", e i file CSV la usano sempre.
- Ripristina — sostituisci richiede esattamente un file. Con due o più file è
  disattivato, perché il secondo file cancellerebbe il primo.
- Un file che non può essere letto viene escluso al momento dell'anteprima ed
  elencato nel risultato.
- Annulla, o un errore a metà, rimette i tuoi segnalibri com'erano prima
  dell'inizio del lotto.

## Fonti di importazione

Snug rileva il formato dal tipo MIME del file, poi dall'estensione, poi dal
contenuto. Legge:

- Esportazioni di Snug e del browser: HTML (file di segnalibri Netscape), JSON,
  CSV e XBEL.
- Un file `Bookmarks` del profilo di Chrome (il file JSON grezzo nella cartella
  di un profilo di Chrome). Le sue cartelle finiscono nelle posizioni originali.
- Un'esportazione di Safari (HTML). Preferiti diventa la Barra dei segnalibri;
  l'Elenco di lettura e le altre cartelle di Safari restano in Altri segnalibri,
  con l'Elenco di lettura in una propria cartella.

## L'istantanea di sicurezza e Annulla

Prima di ogni Ripristina — sostituisci, Snug salva un'**istantanea di
sicurezza** della tua Barra dei segnalibri e di Altri segnalibri: un file JSON
nella cartella Download (`snug-safety-snapshot-<date>.json`), più una copia
conservata all'interno dell'estensione. La conferma della sostituzione te lo
comunica e rimanda alla scheda delle istantanee di sicurezza nelle Impostazioni.
Se l'istantanea non può essere salvata, non viene eliminato nulla.

- Dopo una sostituzione, **Annulla importazione** nel risultato ripristina
  l'istantanea.
- In **Impostazioni**, la scheda delle istantanee di sicurezza elenca le ultime
  cinque istantanee. Puoi ripristinarne o scaricarne una qualsiasi, dopo
  conferma, e crearne una nuova in qualsiasi momento.

Snug conserva le ultime cinque istantanee, quindi una sesta sostituisce la più
vecchia, tranne che l'istantanea più recente che contiene dei segnalibri non
viene mai eliminata. Ripristinare un'istantanea è a sua volta una sostituzione,
quindi Snug prima salva una nuova istantanea dei tuoi segnalibri attuali. Tutto
resta sul tuo dispositivo e Snug non effettua richieste di rete.
