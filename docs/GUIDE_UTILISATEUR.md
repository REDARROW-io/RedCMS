# Guide Utilisateur RedCMS

Bienvenue dans RedCMS ! Ce guide vous aidera à gérer le contenu de votre site web.

## Table des matières

1. [Connexion](#connexion)
2. [Dashboard](#dashboard)
3. [Gestion des Pages](#gestion-des-pages)
4. [Gestion des Articles](#gestion-des-articles)
5. [Bibliothèque de Médias](#bibliothèque-de-médias)
6. [Catégories et Auteurs](#catégories-et-auteurs)

---

## Connexion

1. Accédez à l'interface d'administration : `https://votresite.com/admin`
2. Entrez votre email et mot de passe
3. Cliquez sur **Se connecter**

> 💡 Si vous avez oublié votre mot de passe, contactez votre administrateur.

---

## Dashboard

Le dashboard affiche un aperçu de votre site :

- **Nombre de pages** créées
- **Nombre d'articles** publiés
- **Nombre de médias** dans la bibliothèque
- **Version de RedCMS** installée

### Accès rapides

Depuis le dashboard, vous pouvez rapidement :
- Créer une nouvelle page
- Créer un nouvel article

---

## Gestion des Pages

### Liste des pages

La page **Pages** affiche toutes vos pages avec :
- Titre et URL (slug)
- Statut (Brouillon / Publié)
- Date de dernière modification

### Actions disponibles

| Icône | Action |
|-------|--------|
| ✏️ | Modifier la page |
| 📋 | Dupliquer la page |
| 👁️ | Voir la page (si publiée) |
| 🗑️ | Supprimer la page |

### Créer une nouvelle page

1. Cliquez sur **+ Nouvelle page**
2. L'éditeur s'ouvre avec une page vide

### Éditeur de page

L'éditeur est divisé en 3 zones :

#### 1. Bibliothèque de sections (gauche)

Liste de toutes les sections disponibles, organisées par catégorie :
- **Hero** : Bannières principales
- **Contenu** : Texte, FAQ
- **Visuels** : Galerie, Carrousel
- **Preuve sociale** : Témoignages, Logos clients
- **Présentation** : Équipe, À propos
- **Services** : Liste de services, Produits
- **Conversion** : Call-to-action
- **Contact** : Formulaire, coordonnées

Utilisez la barre de recherche pour trouver une section rapidement.

#### 2. Canvas (centre)

Zone où vous construisez votre page :
- **Cliquez** sur une section dans la bibliothèque pour l'ajouter
- **Glissez-déposez** les sections pour les réorganiser
- **Cliquez** sur une section pour la sélectionner et l'éditer

Chaque section affiche une barre d'outils :
- ⬆️⬇️ Monter/Descendre
- 📋 Dupliquer
- 🗑️ Supprimer

#### 3. Panneau d'édition (droite)

Quand une section est sélectionnée, ce panneau affiche tous ses champs éditables :
- Textes (titres, descriptions)
- Images
- Boutons et liens
- Options d'affichage

### Paramètres de la page

Cliquez sur l'icône ⚙️ **Paramètres** pour accéder à :

- **Titre** : Nom de la page
- **Slug** : URL de la page (ex: `/a-propos`)
- **SEO** :
  - Meta title (titre dans Google)
  - Meta description (description dans Google)
  - URL canonique
  - Option "Ne pas indexer"

### Sauvegarde et publication

- **Sauvegarder** : Enregistre vos modifications (reste en brouillon)
- **Publier** : Rend la page visible sur le site
- **Dépublier** : Repasse la page en brouillon

> 💡 L'auto-sauvegarde s'active toutes les 30 secondes pour ne rien perdre.

---

## Gestion des Articles

### Liste des articles

Affiche tous vos articles de blog avec :
- Titre et URL
- Catégorie
- Auteur
- Statut
- Date

### Créer un article

1. Cliquez sur **+ Nouvel article**
2. Remplissez les champs :

| Champ | Description |
|-------|-------------|
| **Titre** | Titre de l'article |
| **Slug** | URL de l'article |
| **Extrait** | Résumé court (affiché dans les listes) |
| **Contenu** | Corps de l'article (éditeur riche) |
| **Image mise en avant** | Image principale |
| **Catégorie** | Classement de l'article |
| **Auteur** | Qui a écrit l'article |
| **Tags** | Mots-clés (tapez et appuyez Entrée) |

### SEO de l'article

En bas de l'éditeur :
- **Meta title** : Titre pour Google
- **Meta description** : Description pour Google

---

## Bibliothèque de Médias

### Accéder aux médias

Menu **Médias** dans la barre latérale.

### Uploader des images

Deux méthodes :
1. Cliquez sur **+ Upload** et sélectionnez vos fichiers
2. Glissez-déposez directement dans la zone

### Gérer les médias

- **Recherche** : Filtrez par nom de fichier
- **Cliquez** sur une image pour voir ses détails :
  - Dimensions
  - Poids
  - Date d'ajout
  - Texte alternatif (important pour le SEO)

### Supprimer un média

1. Sélectionnez l'image
2. Cliquez sur 🗑️ **Supprimer**

> ⚠️ Vérifiez que l'image n'est pas utilisée avant de la supprimer.

---

## Catégories et Auteurs

### Catégories

Organisez vos articles par thème :

1. Menu **Catégories**
2. Cliquez sur **+ Nouvelle catégorie**
3. Remplissez :
   - Nom
   - Slug (URL)
   - Description (optionnel)

### Auteurs

Gérez les profils des rédacteurs :

1. Menu **Auteurs**
2. Cliquez sur **+ Nouvel auteur**
3. Remplissez :
   - Photo
   - Nom
   - Email
   - Bio
   - Réseaux sociaux (LinkedIn, Twitter, Site web)

---

## Astuces

### Raccourcis

- `Ctrl/Cmd + S` : Sauvegarder (dans l'éditeur)

### Bonnes pratiques SEO

1. **Titres** : Utilisez des titres descriptifs et uniques
2. **Meta descriptions** : 150-160 caractères max
3. **Images** : Remplissez toujours le texte alternatif
4. **URLs** : Gardez des slugs courts et lisibles

### En cas de problème

- **Page blanche** : Rafraîchissez avec `Ctrl/Cmd + R`
- **Modifications perdues** : L'auto-save devrait avoir sauvegardé
- **Bug** : Contactez votre développeur

---

## Support

Pour toute question, contactez votre administrateur ou l'équipe Red Arrow.

**RedCMS** - Créé avec ❤️ par Red Arrow
