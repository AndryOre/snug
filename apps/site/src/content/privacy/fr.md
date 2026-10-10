---
englishLastUpdated: October 10, 2026
---

# Politique de confidentialité de Snug

Dernière mise à jour : 10 octobre 2026

## Introduction

Snug s'engage à protéger votre vie privée. Cette Politique de confidentialité
explique nos pratiques en matière de collecte, d'utilisation et de divulgation
des informations que nous recevons par l'intermédiaire de notre extension de
navigateur.

## Collecte et utilisation des informations

Snug ne collecte, ne stocke et ne transmet aucune information personnelle sur
ses utilisateurs. Notre extension fonctionne entièrement dans votre navigateur
et n'envoie aucune donnée à des serveurs externes.

### Données des favoris

- L'extension accède aux favoris de votre navigateur uniquement pour les
  exporter vers des fichiers HTML, JSON, CSV, Markdown, OPML ou XBEL, ou pour
  les importer depuis des fichiers HTML, JSON, CSV ou XBEL, un fichier
  `Bookmarks` d'un profil Chrome ou un export Safari. La page Doublons lit
  également vos favoris pour trouver les copies d'une même adresse, et ne les
  supprime que lorsque vous le confirmez.
- Cet accès n'a lieu que lorsque vous lancez explicitement une opération
  d'import ou d'export, ou lorsqu'un export automatique planifié que vous avez
  configuré s'exécute (voir « Exportation automatique » ci-dessous).
- Les données de vos favoris sont traitées localement sur votre appareil et ne
  sont transmises ni à nous ni à des tiers.

### Favicons

- Pour afficher les icônes des sites à côté de vos favoris, l'extension lit les
  favicons via l'API `_favicon` intégrée au navigateur. Cette recherche porte
  sur des favicons déjà mis en cache par votre navigateur et n'effectue aucune
  requête réseau vers nous ni vers les sites enregistrés en favoris.

### Exportation automatique

- Vous pouvez activer, si vous le souhaitez, l'exportation automatique planifiée
  de vos favoris. Une fois activée, l'extension exporte vos favoris à
  l'intervalle que vous configurez et enregistre les fichiers obtenus sans
  afficher de fenêtre de choix de l'emplacement d'enregistrement. Par défaut,
  ils sont écrits directement dans le dossier Téléchargements de votre appareil
  à l'aide de la fonction de téléchargement du navigateur. Si vous choisissez un
  dossier personnalisé, ils sont écrits à la place dans un dossier que vous avez
  sélectionné sur votre ordinateur, via l'API File System Access du navigateur.
- Cela n'a lieu que si vous activez explicitement l'exportation automatique et
  configurez une planification ; elle est désactivée par défaut.
- Conservation : après chaque exportation automatique réussie, Snug supprime ses
  propres fichiers exportés les plus anciens au-delà du nombre que vous
  définissez (10 par défaut ; 0 conserve tout). Il ne supprime que les fichiers
  qu'il a lui-même enregistrés, dans le dossier Téléchargements ou dans votre
  dossier personnalisé, et ne touche jamais aux autres fichiers.
- Dossier personnalisé : le dossier que vous choisissez est mémorisé sur votre
  appareil afin que les exportations automatiques puissent continuer à y écrire.
  Le navigateur peut vous demander de confirmer à nouveau l'accès. Les fichiers
  ne sont jamais envoyés à un serveur, et le choix d'un dossier ne nécessite
  aucune autorisation supplémentaire.
- Notifications : si une exportation automatique échoue, Snug affiche une
  notification système sur votre appareil avec le motif. Vous pouvez la
  désactiver sur la page Exportation automatique. Les exportations réussies ne
  déclenchent jamais de notification, et aucun contenu des notifications ne
  quitte votre appareil.

## Stockage des données

- Snug ne stocke aucune donnée utilisateur, y compris les favoris, sur des
  serveurs externes.
- Les fichiers créés lors de l'export (manuel ou automatique) sont enregistrés
  directement sur votre appareil local : dans votre dossier Téléchargements via
  la fonction de téléchargement de votre navigateur ou, pour les exports
  automatiques, dans le dossier personnalisé que vous avez choisi via l'API File
  System Access du navigateur. Les exports manuels utilisent un lien standard
  `<a download>` et n'ont pas besoin de l'autorisation `downloads` ; les exports
  automatiques et le fichier d'instantané de sécurité utilisent l'autorisation
  `downloads`.
- L'extension stocke vos préférences et réglages locaux — tels que le thème, les
  options d'affichage, les options d'export, le modèle de nom de fichier et
  votre configuration d'exportation automatique — dans le stockage local du
  navigateur (`storage.local`). Ces données restent sur votre appareil et ne
  sont jamais transmises nulle part.
- Si vous choisissez un dossier personnalisé pour les exportations automatiques,
  Snug conserve la référence du navigateur vers ce dossier (un descripteur de
  dossier, et non vos favoris ni le contenu du dossier) dans le stockage local
  du navigateur de l'extension (IndexedDB). Elle reste sur votre appareil et
  n'est jamais transmise nulle part.
- Snug peut afficher dans la fenêtre contextuelle une carte unique et masquable
  vous invitant à évaluer l'extension sur la boutique d'où elle a été installée
  (Chrome Web Store ou Microsoft Edge Add-ons) après votre première exportation
  réussie. Pour ne l'afficher qu'une seule fois, Snug stocke deux horodatages
  locaux dans `storage.local` : le moment où la carte est devenue disponible et
  celui où vous l'avez masquée. Ils ne contiennent aucun contenu de favoris,
  aucune information personnelle et aucun identifiant, et ne sont jamais
  transmis nulle part. La carte n'est qu'un lien : ouvrir la page de la boutique
  relève de votre choix, et Snug lui-même n'effectue aucune requête réseau pour
  cela.
- Avant chaque import avec « Restaurer — remplacer », et chaque fois que vous
  choisissez d'en créer un dans les Paramètres, Snug enregistre un instantané de
  sécurité de votre barre de favoris et des Autres favoris afin que l'import
  puisse être annulé. Cela stocke le contenu de vos favoris (titres, adresses et
  structure des dossiers) localement dans le stockage local du navigateur, en
  conservant les cinq derniers instantanés, et enregistre aussi chacun d'eux
  sous forme de fichier dans votre dossier Téléchargements. Il ne quitte jamais
  votre appareil.

## Autorisations

Snug demande les autorisations de navigateur suivantes, chacune utilisée
uniquement pour la finalité décrite :

| Autorisation       | Finalité                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bookmarks`        | Lire et écrire les favoris de votre navigateur pour prendre en charge l'import et l'export.                                                                                                |
| `favicon`          | Afficher les icônes des sites à côté des favoris via l'API `_favicon` intégrée au navigateur.                                                                                              |
| `storage`          | Enregistrer vos préférences et réglages locaux sur votre appareil.                                                                                                                         |
| `alarms`           | Planifier et déclencher les exportations automatiques de favoris à l'intervalle configuré.                                                                                                 |
| `downloads`        | Enregistrer sur votre appareil les exportations automatiques et les fichiers d'instantané de sécurité, et supprimer les anciens fichiers d'exportation automatique de Snug (Conservation). |
| `notifications`    | Afficher une notification sur votre appareil lorsqu'une exportation automatique échoue. Vous pouvez la désactiver.                                                                         |
| `unlimitedStorage` | Conserver sur votre appareil les cinq derniers instantanés de sécurité de vos favoris, qui peuvent être volumineux pour les grandes bibliothèques.                                         |
| `offscreen`        | Créer un document masqué de courte durée afin qu'une exportation automatique puisse être transformée en fichier téléchargeable. Il n'a pas d'interface et ne charge aucun contenu distant. |

## Services tiers

Notre extension ne s'intègre à aucun service tiers ni outil d'analyse, et n'en
utilise aucun.

## Modifications de cette Politique de confidentialité

Nous pouvons mettre à jour notre Politique de confidentialité de temps à autre.
Nous vous informerons de tout changement en publiant la nouvelle Politique de
confidentialité sur cette page et en mettant à jour la date de « Dernière mise à
jour » en haut de cette politique.

## Nous contacter

Si vous avez des questions sur cette Politique de confidentialité, veuillez nous
contacter :

- Par e-mail : hello@andryore.dev
- En ouvrant une issue sur notre dépôt GitHub :
  https://github.com/AndryOre/snug/issues

## Consentement

En utilisant Snug, vous consentez à notre Politique de confidentialité et
acceptez ses conditions.
