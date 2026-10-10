---
title: Exportation automatique
sourceHash: 5eb2acaa2e4867cc
---

Snug peut exporter vos favoris selon un calendrier, sans action manuelle :

1. Ouvrez la page **Exportation automatique** de l'application.
2. Activez l'exportation automatique, choisissez un ou plusieurs des six
   formats, l'emplacement d'enregistrement (Téléchargements ou un dossier
   personnalisé), un intervalle et, si vous le souhaitez, un chemin de
   sous-dossier pour les fichiers exportés. Les intervalles sont toutes les
   heures, toutes les 12 heures, tous les jours, tous les 3 jours ou toutes les
   semaines. Les exécutions quotidiennes, tous les 3 jours et hebdomadaires ont
   lieu à une heure souhaitée ; les exécutions hebdomadaires permettent aussi de
   choisir le jour. Les exécutions toutes les heures et toutes les 12 heures
   ignorent l'heure.
3. Dès lors, l'extension exporte vos favoris selon ce calendrier et enregistre
   les fichiers directement à l'emplacement choisi, Téléchargements par défaut,
   sans boîte de dialogue d'enregistrement ni invite supplémentaire. Si le
   navigateur était fermé ou l'extension indisponible au moment d'une
   exportation planifiée, elle se rattrape automatiquement peu après le prochain
   démarrage du navigateur, au lieu d'attendre l'heure planifiée suivante.

**Enregistrer dans** définit la destination. **Téléchargements** (par défaut)
enregistre dans le dossier Téléchargements du navigateur. **Dossier
personnalisé** enregistre dans un dossier que vous choisissez n'importe où sur
votre ordinateur : sélectionnez **Choisir un dossier…**, puis **Changer de
dossier** pour en choisir un autre. Sélectionnez de nouveau **Téléchargements**
à tout moment pour revenir en arrière. Le chemin de sous-dossier est relatif à
la destination : il désigne un dossier à l'intérieur du dossier choisi. Si un
fichier du même nom existe déjà, Snug ajoute le suffixe « (1) » et ne l'écrase
jamais.

Après le premier redémarrage du navigateur, Chrome demande une fois de confirmer
l'accès au dossier personnalisé. Choisissez « Autoriser à chaque visite » pour
que les exécutions sans surveillance continuent de fonctionner.

Si l'accès au dossier manque, Snug vous avertit au démarrage du navigateur. La
fenêtre contextuelle et la page **Exportation automatique** affichent alors «
Accès au dossier requis » avec un bouton **Autoriser l'accès**. Tant que vous
n'autorisez pas l'accès, les exécutions échouent et rien n'est enregistré dans
Téléchargements à la place.

**Conserver les N dernières exécutions** (Conservation, 10 par défaut) limite le
nombre d'exportations qui s'accumulent : après chaque exécution réussie, Snug
conserve les N exécutions les plus récentes dans Téléchargements et le dossier
personnalisé confondus, et supprime les fichiers de ses propres exécutions plus
anciennes (tous les formats d'une exécution conservée restent). Les fichiers
enregistrés dans Téléchargements perdent aussi leurs entrées dans l'historique
des téléchargements du navigateur. Il ne supprime que les fichiers que Snug a
lui-même enregistrés, jamais d'autres fichiers du dossier, et un fichier que
vous avez déjà supprimé ou déplacé est simplement ignoré. Si vous changez de
dossier, les fichiers de l'ancien dossier sont laissés tels quels. Une exécution
échouée ne supprime rien. Indiquez 0 pour tout conserver.

**Me prévenir en cas d'échec d'un export** (activé par défaut) affiche une
notification système, intitulée « Snug · Échec de l'export automatique » avec le
motif, lorsqu'une exécution échoue. Cliquer dessus ouvre la page Exportation
automatique. Les exécutions réussies ne notifient jamais, et les échecs répétés
remplacent la notification précédente au lieu de s'empiler. Une exécution
planifiée ou de rattrapage échouée affiche aussi un badge « ! » sur l'icône de
la barre d'outils jusqu'à ce qu'une exécution réussisse.

Les modifications de la page **Exportation automatique** sont enregistrées
automatiquement. Sa carte d'état affiche toujours l'état réel du calendrier,
indépendamment des modifications non enregistrées en dessous :

- **Dernière exécution** — la dernière fois que l'exportation automatique s'est
  exécutée, avec son résultat et, en cas d'échec, le message d'erreur
  enregistré. La fenêtre contextuelle affiche aussi la prochaine exécution, ou
  un avis d'échec, sur sa ligne d'état de l'exportation automatique.
- **Prochaine exécution** — la date à laquelle elle est due, ou « L'exportation
  automatique est désactivée » si l'exportation automatique est désactivée.

**Exporter maintenant** lance immédiatement une exportation avec les formats et
le chemin actuellement affichés à l'écran, même si l'interrupteur Activer est
désactivé. Il affiche un indicateur de chargement pendant l'exécution, puis un
bref message de réussite ou d'erreur ; la ligne « Dernière exécution » de la
carte d'état se met à jour en conséquence. Cette action ne modifie jamais votre
calendrier automatique ni sa prochaine échéance.
