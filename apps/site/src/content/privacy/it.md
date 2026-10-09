---
englishLastUpdated: October 6, 2026
---

# Informativa sulla privacy di Snug

Ultimo aggiornamento: 6 ottobre 2026

## Introduzione

Snug si impegna a proteggere la tua privacy. La presente Informativa sulla
privacy illustra le nostre pratiche relative alla raccolta, all'uso e alla
divulgazione delle informazioni che riceviamo tramite la nostra estensione per
browser.

## Raccolta e uso delle informazioni

Snug non raccoglie, non memorizza e non trasmette alcuna informazione personale
sui propri utenti. La nostra estensione funziona interamente all'interno del tuo
browser e non invia alcun dato a server esterni.

### Dati dei segnalibri

- L'estensione accede ai segnalibri del tuo browser esclusivamente per
  esportarli in file HTML, JSON, CSV, Markdown, OPML o XBEL, oppure per
  importarli da file HTML, JSON, CSV o XBEL, da un file `Bookmarks` di un
  profilo Chrome o da un'esportazione di Safari. La pagina Duplicati legge
  inoltre i tuoi segnalibri per trovare copie dello stesso indirizzo, e li
  elimina solo quando lo confermi.
- Questo accesso avviene solo quando avvii esplicitamente un'operazione di
  importazione o esportazione, oppure quando viene eseguita un'esportazione
  automatica pianificata che hai configurato (vedi "Esportazione automatica" più
  sotto).
- I dati dei tuoi segnalibri vengono elaborati localmente sul tuo dispositivo e
  non vengono trasmessi a noi né a terzi.

### Favicon

- Per mostrare le icone dei siti accanto ai tuoi segnalibri, l'estensione legge
  i favicon tramite l'API `_favicon` integrata nel browser. Questa ricerca
  riguarda i favicon già presenti nella cache del browser e non effettua alcuna
  richiesta di rete verso di noi né verso i siti salvati nei segnalibri.

### Esportazione automatica

- Puoi attivare, se lo desideri, l'esportazione automatica pianificata dei tuoi
  segnalibri. Una volta attivata, l'estensione esporta i tuoi segnalibri con
  l'intervallo che configuri e scrive i file risultanti direttamente nella
  cartella Download del tuo dispositivo usando la funzione di download del
  browser, senza mostrare una finestra per scegliere dove salvare.
- Questo avviene solo se attivi esplicitamente l'esportazione automatica e
  configuri una pianificazione; è disattivata per impostazione predefinita.
- Conservazione: dopo ogni esportazione automatica riuscita, Snug elimina i
  propri file esportati più vecchi oltre il numero che imposti (10 per
  impostazione predefinita; 0 li conserva tutti). Rimuove solo i file che ha
  salvato lui stesso e non tocca mai gli altri file nella tua cartella Download.
- Notifiche: se un'esportazione automatica non riesce, Snug mostra una notifica
  di sistema sul tuo dispositivo con il motivo. Puoi disattivarla nella pagina
  Esportazione automatica. Le esportazioni riuscite non generano mai notifiche e
  nessun contenuto delle notifiche lascia il tuo dispositivo.

## Archiviazione dei dati

- Snug non memorizza alcun dato dell'utente, inclusi i segnalibri, su server
  esterni.
- Tutti i file creati durante l'esportazione (manuale o automatica) vengono
  salvati direttamente sul tuo dispositivo locale tramite la funzione di
  download del browser. Le esportazioni manuali usano un normale link
  `<a download>` e non richiedono il permesso `downloads`; le esportazioni
  automatiche e il file dell'istantanea di sicurezza usano il permesso
  `downloads`.
- L'estensione memorizza le tue preferenze e impostazioni locali — come il tema,
  le opzioni di visualizzazione, le opzioni di esportazione, il modello del nome
  del file e la configurazione dell'esportazione automatica — usando
  l'archiviazione locale del browser (`storage.local`). Questi dati restano sul
  tuo dispositivo e non vengono mai trasmessi da nessuna parte.
- Snug può mostrare nel popup una scheda unica e chiudibile che ti invita a
  recensire l'estensione sullo store da cui è stata installata (Chrome Web Store
  o Microsoft Edge Add-ons) dopo la tua prima esportazione riuscita. Per
  mostrarla una sola volta, Snug memorizza due timestamp locali in
  `storage.local`: quando la scheda è diventata disponibile e quando l'hai
  chiusa. Non contengono contenuti dei segnalibri, informazioni personali né
  identificatori e non vengono mai trasmessi da nessuna parte. La scheda è solo
  un link: aprire la pagina dello store è una tua scelta e Snug stesso non
  effettua alcuna richiesta di rete per questo.
- Prima di ogni importazione con "Ripristina — sostituisci", e ogni volta che
  scegli di crearne una nelle Impostazioni, Snug salva un'istantanea di
  sicurezza della tua barra dei preferiti e di Altri segnalibri, così
  l'importazione può essere annullata. Questo memorizza il contenuto dei tuoi
  segnalibri (titoli, indirizzi e struttura delle cartelle) localmente
  nell'archiviazione locale del browser, conservando le ultime cinque
  istantanee, e salva inoltre ciascuna come file nella tua cartella Download.
  Non lascia mai il tuo dispositivo.

## Permessi

Snug richiede i seguenti permessi del browser, ciascuno usato esclusivamente per
lo scopo descritto:

| Permesso           | Scopo                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Leggere e scrivere i segnalibri del tuo browser per supportare l'importazione e l'esportazione.                                                                                     |
| `favicon`          | Mostrare le icone dei siti accanto ai segnalibri tramite l'API `_favicon` integrata nel browser.                                                                                    |
| `storage`          | Salvare le tue preferenze e impostazioni locali sul tuo dispositivo.                                                                                                                |
| `alarms`           | Pianificare e avviare le esportazioni automatiche dei segnalibri con l'intervallo configurato.                                                                                      |
| `downloads`        | Salvare sul tuo dispositivo le esportazioni automatiche e i file delle istantanee di sicurezza, ed eliminare i vecchi file di esportazione automatica di Snug (Conservazione).      |
| `notifications`    | Mostrare una notifica sul tuo dispositivo quando un'esportazione automatica non riesce. Puoi disattivarla.                                                                          |
| `unlimitedStorage` | Conservare sul tuo dispositivo le ultime cinque istantanee di sicurezza dei tuoi segnalibri, che possono essere grandi per le raccolte voluminose.                                  |
| `offscreen`        | Creare un documento nascosto di breve durata affinché un'esportazione automatica possa essere trasformata in un file scaricabile. Non ha interfaccia e non carica contenuti remoti. |

## Servizi di terze parti

La nostra estensione non si integra con alcun servizio di terze parti né
strumento di analisi, e non ne utilizza.

## Modifiche alla presente Informativa sulla privacy

Potremmo aggiornare la nostra Informativa sulla privacy di tanto in tanto. Ti
informeremo di eventuali modifiche pubblicando la nuova Informativa sulla
privacy in questa pagina e aggiornando la data di "Ultimo aggiornamento" in cima
a questa informativa.

## Contattaci

Se hai domande sulla presente Informativa sulla privacy, contattaci:

- Via e-mail: hello@andryore.dev
- Aprendo una issue nel nostro repository GitHub:
  https://github.com/AndryOre/snug/issues

## Consenso

Usando Snug, acconsenti alla nostra Informativa sulla privacy e ne accetti i
termini.
