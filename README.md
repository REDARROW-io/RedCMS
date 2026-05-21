# RedCMS

**RedCMS** est un CMS propriétaire intégré à Astro, conçu pour permettre aux clients non-techniques d'éditer leurs sites web via une interface drag & drop intuitive.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Astro](https://img.shields.io/badge/Astro-5.1-orange)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Fonctionnalités

- 🎨 **Éditeur visuel** : Interface drag & drop pour construire des pages
- 📝 **Blog intégré** : Gestion des articles avec éditeur WYSIWYG
- 🖼️ **Médiathèque** : Upload et gestion des images
- 🔍 **SEO optimisé** : Meta tags, sitemap, Schema.org
- 📱 **Responsive** : Design adapté mobile/tablette/desktop
- 🔐 **Sécurisé** : Authentification Supabase + RLS
- 🚀 **Performant** : Build statique avec Astro (SSG)

## 📦 Stack technique

- **Frontend** : Astro 5, React 19
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Admin** : React + dnd-kit + Lucide Icons
- **Styling** : CSS vanilla (personnalisable)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Compte Supabase

### Installation

```bash
# Cloner le projet
git clone https://github.com/redarrow/redcms.git mon-site
cd mon-site

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm run dev
```

### Configuration Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Exécuter le script `supabase/migrations/installation.sql`
3. Créer un bucket Storage nommé `media`
4. Créer un utilisateur admin dans Authentication

## 📁 Structure du projet

```
redcms/
├── src/
│   ├── pages/           # Pages Astro (routes)
│   ├── layouts/         # Layouts réutilisables
│   ├── components/      # Composants Astro
│   └── sections/        # Sections visuelles (16 sections)
├── redcms/
│   ├── core/            # Types, config, Supabase client
│   ├── admin/           # Interface d'administration React
│   ├── sections/        # Définitions des sections (schémas)
│   └── api/             # Utilitaires API
├── supabase/
│   └── migrations/      # Script SQL d'installation
├── docs/                # Documentation
└── public/              # Assets statiques
```

## 📖 Documentation

- [Guide Utilisateur](./docs/GUIDE_UTILISATEUR.md) - Pour les clients
- [Guide de Déploiement](./docs/DEPLOIEMENT.md) - Pour les développeurs
- [Création de Sections](./docs/CREATION_SECTIONS.md) - Pour étendre RedCMS

## 🎯 Sections disponibles (V1)

| Catégorie | Sections |
|-----------|----------|
| **Hero** | Hero Principal, Hero Slider |
| **Contenu** | Texte + Image, FAQ/Accordéon |
| **Visuels** | Galerie Photos, Carrousel |
| **Preuve sociale** | Témoignages, Logos Clients, Chiffres Clés |
| **Présentation** | Équipe, À propos |
| **Services** | Liste Services, Grille Produits |
| **Conversion** | CTA Complet |
| **Contact** | Contact Complet |
| **Blog** | Liste Articles |

## 🔧 Scripts disponibles

```bash
npm run dev      # Lancer en développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

## 🔄 Mises à jour

RedCMS intègre un système de mise à jour :

1. Accédez à l'admin
2. Dashboard > Vérifier les mises à jour
3. Appliquez si disponible

Ou manuellement :
```bash
git pull origin main
npm install
npm run build
```

## 🛠️ Personnalisation

### Configuration du site

Éditez `redcms/core/siteConfig.ts` pour :
- Nom et URL du site
- SEO par défaut
- Informations LocalBusiness
- Réseaux sociaux

### Sections activées

Éditez `redcms/config.ts` pour activer/désactiver des sections.

### Header & Footer

Éditez `src/layouts/Layout.astro` pour personnaliser la structure globale.

## 📄 Licence

Propriétaire - Red Arrow © 2025

---

Créé avec ❤️ par **Red Arrow**
