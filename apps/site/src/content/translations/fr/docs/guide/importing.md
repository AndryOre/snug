---
title: Importer des favoris
sourceHash: 4c537c8e1b7a7231
---

1. Importation rapide, depuis la fenêtre contextuelle :
   - Si vous le souhaitez, modifiez le mode d'importation par défaut (voir
     [**Paramètres**](settings.md)) — il démarre sur **Restaurer — fusionner**.
   - Cliquez sur « Choisir des fichiers… » et sélectionnez un ou plusieurs
     fichiers de favoris (voir **Sources d'importation** ci-dessous), ou
     déposez-les sur la section Importer de la fenêtre contextuelle. Une
     superposition « Déposez les fichiers pour les importer » apparaît pendant
     le glisser. Les fichiers déposés pendant qu'une importation est en cours
     sont ignorés.
   - L'extension détecte automatiquement chaque format et importe aussitôt les
     favoris avec le mode d'importation par défaut. Un fichier CSV — ou tout
     autre fichier sans données de Barre de favoris ou d'Autres favoris —
     s'importe toujours dans un nouveau dossier « Favoris importés », quel que
     soit le mode par défaut.
   - Plusieurs fichiers sont importés ensemble comme un seul **lot
     d'importation** (voir ci-dessous). Un fichier que Snug ne peut pas lire est
     écarté. L'avertissement liste jusqu'à trois fichiers ignorés sous la forme
     `nom : motif`, puis « et N autres ».
   - Si le mode par défaut est **Restaurer — remplacer**, la fenêtre
     contextuelle affiche seulement un avertissement indiquant que vos favoris
     existants seront remplacés. Choisir un fichier ouvre alors la page
     **Importer** de l'application, où vous vérifiez le remplacement et le
     confirmez (un instantané de sécurité est d'abord enregistré, pour que vous
     puissiez l'annuler). Les très grosses importations ouvrent aussi la page
     **Importer**.
2. Aperçu d'abord, depuis la page **Importer** de l'application :
   - Déposez ou sélectionnez un ou plusieurs fichiers de favoris. Chaque fichier
     obtient une ligne avec son format détecté et son nombre de favoris, ou la
     raison pour laquelle il ne peut pas être lu. Vous pouvez retirer un fichier
     ou utiliser **Ajouter des fichiers** pour en ajouter.
   - Un aperçu détaillé affiche l'arborescence telle qu'elle serait importée.
     Les favoris que Ignorer les doublons laisserait de côté portent un badge
     `Doublon · ignoré`, ce qui vous permet de juger le fichier avant que quoi
     que ce soit ne change.
   - Choisissez un mode d'importation (présélectionné d'après votre mode par
     défaut) :
     - **Créer un dossier** : ajoute chaque favori dans un nouveau dossier «
       Favoris importés ». Disponible pour tout fichier, y compris CSV (qui n'a
       pas de structure de dossiers à restaurer).
     - **Restaurer — fusionner** : place les favoris à leur emplacement
       d'origine, à côté des vôtres. Disponible uniquement pour les fichiers
       JSON/HTML qui contiennent des données d'emplacement.
     - **Restaurer — remplacer** : vide d'abord votre Barre de favoris et vos
       Autres favoris, puis restaure les favoris à leur emplacement d'origine.
       Disponible uniquement pour les fichiers qui contiennent des données
       d'emplacement, et pour un seul fichier à la fois.
   - Sélectionner « Restaurer — remplacer » indique combien de favoris le
     remplacement va supprimer et ajouter, liste les favoris qui seront
     supprimés, et exige de confirmer une boîte de dialogue d'avertissement
     avant l'exécution de l'importation.
   - **Ignorer les doublons** (activé par défaut) laisse de côté tout favori
     dont l'URL existe déjà dans votre navigateur, et vous indique combien des
     favoris sélectionnés il va ignorer. Cela s'applique à Créer un dossier et à
     Restaurer — fusionner, pas à Restaurer — remplacer. L'interrupteur est
     partagé avec l'importation rapide.

## Sélection d'importation

Dans Créer un dossier et Restaurer — fusionner, l'arborescence d'aperçu a des
cases à cocher. Cochez des favoris isolés, des dossiers entiers, ou un mélange,
et Snug n'importe que la **sélection d'importation**. Restaurer — remplacer n'a
pas de sélection : il importe toujours tout.

## Lot d'importation

Plusieurs fichiers importés en une fois forment un seul **lot d'importation** :
un mode d'importation, un aperçu et une progression. Snug vérifie les URL
existantes une seule fois, donc Ignorer les doublons laisse aussi de côté un
favori présent dans deux des fichiers.

- Dans Créer un dossier avec deux fichiers ou plus, chaque fichier va dans son
  propre dossier, nommé d'après le fichier (sans son extension). Un fichier
  unique conserve le dossier « Favoris importés », et les fichiers CSV
  l'utilisent toujours.
- Restaurer — remplacer exige exactement un fichier. Avec deux fichiers ou plus,
  il est désactivé, car le second fichier effacerait le premier.
- Un fichier qui ne peut pas être lu est écarté au moment de l'aperçu et listé
  dans le résultat.
- Annuler, ou un échec en cours de route, remet vos favoris dans l'état où ils
  étaient avant le début du lot.

## Sources d'importation

Snug détecte le format d'après le type MIME du fichier, puis son extension, puis
son contenu. Il lit :

- Les exportations de Snug et des navigateurs : HTML (fichier de favoris
  Netscape), JSON, CSV et XBEL.
- Un fichier `Bookmarks` de profil Chrome (le fichier JSON brut situé dans un
  dossier de profil Chrome). Ses dossiers retrouvent leur emplacement d'origine.
- Une exportation Safari (HTML). Favoris devient la Barre de favoris ; la Liste
  de lecture et les autres dossiers Safari restent dans Autres favoris, la Liste
  de lecture ayant son propre dossier.

## L'instantané de sécurité et Annuler

Avant chaque Restaurer — remplacer, Snug enregistre un **instantané de
sécurité** de votre Barre de favoris et de vos Autres favoris : un fichier JSON
dans votre dossier Téléchargements (`snug-safety-snapshot-<date>.json`), plus
une copie conservée dans l'extension. La confirmation du remplacement vous
l'indique et renvoie vers la carte des instantanés de sécurité dans les
Paramètres. Si l'instantané ne peut pas être enregistré, rien n'est supprimé.

- Après un remplacement, **Annuler l'importation** dans le résultat restaure
  l'instantané.
- Dans les **Paramètres**, la carte des instantanés de sécurité liste les cinq
  derniers. Vous pouvez restaurer ou télécharger n'importe lequel, après
  confirmation, et en créer un nouveau à tout moment.

Snug conserve les cinq derniers instantanés, donc un sixième remplace le plus
ancien, sauf que l'instantané le plus récent contenant des favoris n'est jamais
supprimé. Restaurer un instantané est lui-même un remplacement : Snug enregistre
donc d'abord un nouvel instantané de vos favoris actuels. Tout reste sur votre
appareil et Snug n'effectue aucune requête réseau.
