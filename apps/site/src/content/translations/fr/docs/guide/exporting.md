---
title: Exporter des favoris
sourceHash: 2c9f860aa372f840
---

1. Exportation rapide : dans la fenêtre contextuelle, choisissez un format et
   cliquez sur « Tout exporter » pour exporter toute votre arborescence de
   favoris.
2. Pour contrôler ce qui est exporté, ouvrez la page **Exporter** de
   l'application :
   - Utilisez la zone de recherche pour trouver des favoris précis.
   - Cochez des favoris individuels ou des dossiers entiers (ou utilisez «
     Sélectionner tous les favoris »).
   - Ajustez le panneau **Options d'exportation** (favicons, dates, masquage de
     dossiers, modèle de nom de fichier).
   - Choisissez le format d'exportation et cliquez sur « Exporter N favoris ».

## Formats d'exportation

Snug exporte six formats :

| Format   | Extension | Idéal pour                                                           |
| -------- | --------- | -------------------------------------------------------------------- |
| HTML     | `.html`   | L'importation dans n'importe quel navigateur (fichier Netscape).     |
| JSON     | `.json`   | La restauration dans Snug avec dossiers et emplacements racines.     |
| CSV      | `.csv`    | Les tableurs ; une ligne par favori avec une colonne `folder`.       |
| Markdown | `.md`     | Les notes et wikis ; les dossiers deviennent titres et listes.       |
| OPML     | `.opml`   | Les lecteurs de flux et les outils de plan.                          |
| XBEL     | `.xbel`   | Les autres gestionnaires de favoris lisant le format XML de favoris. |

Markdown et OPML sont réservés à l'exportation : Snug ne peut pas les
réimporter.

## Progression et Annuler

Une longue exportation ou importation affiche une carte de progression avec un
compteur. Cliquez sur **Annuler** pour arrêter. Une exportation annulée ne
télécharge aucun fichier. Une importation annulée supprime les favoris déjà
ajoutés, et une opération Restaurer — remplacer annulée remet vos anciens
favoris en place à partir de l'instantané de sécurité. Annuler sur un lot
d'importation remet vos favoris dans l'état où ils étaient avant le début du
lot.

## Nommer les fichiers exportés

Par défaut, les fichiers exportés s'appellent `Bookmarks_<date>_<time>` (par
exemple `Bookmarks_2026-10-03_14-05-09`). Pour personnaliser ce nom :

1. Ouvrez la page **Exporter** de l'application (le même panneau apparaît dans
   **Exportation automatique**).
2. Dans **Options d'exportation**, modifiez « Modèle de nom de fichier ». Un
   aperçu en direct affiche le nom de fichier obtenu pendant que vous saisissez.
3. Utilisez ces variables (insensibles à la casse) pour inclure la date et
   l'heure actuelles :

   | Variable | Valeur    |
   | -------- | --------- |
   | `%yyyy`  | Année (4) |
   | `%yy`    | Année (2) |
   | `%mm`    | Mois      |
   | `%dd`    | Jour      |
   | `%hh`    | Heure     |
   | `%min`   | Minute    |
   | `%sec`   | Seconde   |

   Par exemple, `%yyyy%mm%dd myPc` produit `20260930 myPc.html` (et l'extension
   correspondante pour les autres formats).

Le modèle s'applique partout où un nom de fichier est généré : l'exportation
rapide depuis la fenêtre contextuelle, la page Exporter et l'exportation
automatique. Les caractères interdits dans les noms de fichiers
(`/ \ : * ? " < > |`) sont remplacés par `_`, et un modèle qui finit vide
revient à « Bookmarks ».
