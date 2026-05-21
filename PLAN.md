# RedCMS - Plan de Refonte

## Vision

**RedCMS** = CMS permettant au développeur de créer des sites Astro, et au client final de modifier le contenu (textes, images, listes) via une interface admin simple.

```
Développeur → Code les pages Astro + Définit les schemas (ce qui est éditable)
Client      → Modifie uniquement le contenu via l'admin
```

---

## Architecture Cible

### Structure du projet client

```
site-client/
├── src/
│   ├── pages/               # Pages Astro (codées par le dev)
│   │   ├── index.astro
│   │   ├── services.astro
│   │   └── contact.astro
│   ├── schemas/             # Définition des champs éditables
│   │   ├── accueil.schema.ts
│   │   ├── services.schema.ts
│   │   └── contact.schema.ts
│   └── layouts/
│       └── Layout.astro
├── redcms.config.ts         # Configuration (Supabase, etc.)
└── package.json             # Dépend de @redcms/core
```

### Le package @redcms/core

```
@redcms/core/
├── admin/                   # Interface React
│   ├── components/
│   │   ├── AdminApp.tsx
│   │   ├── PagesList.tsx    # Liste des pages éditables
│   │   ├── PageEditor.tsx   # Éditeur de contenu
│   │   └── fields/          # Composants de champs
│   │       ├── TextField.tsx
│   │       ├── TextareaField.tsx
│   │       ├── ImageField.tsx
│   │       ├── ArrayField.tsx
│   │       └── ...
│   └── styles/
├── core/
│   ├── supabase.ts          # Client Supabase
│   ├── content.ts           # getPageContent(), savePageContent()
│   └── types.ts             # Types TypeScript
└── integration/             # Routes API Astro
    └── api/
```

---

## Base de données

### Table: `page_content`

```sql
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL UNIQUE,      -- 'accueil', 'services', 'contact'
  content JSONB NOT NULL DEFAULT '{}', -- Contenu de la page
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide
CREATE INDEX idx_page_content_slug ON page_content(page_slug);
```

**Exemple de contenu JSON :**
```json
{
  "hero_titre": "Bienvenue chez BTP Expert",
  "hero_description": "Spécialiste de la rénovation depuis 20 ans",
  "hero_image": "https://...",
  "services": [
    {
      "nom": "Menuiserie",
      "description": "Portes, fenêtres, escaliers...",
      "image": "https://..."
    },
    {
      "nom": "Plomberie",
      "description": "Installation et réparation",
      "image": "https://..."
    }
  ]
}
```

---

## Schemas (Définition des champs)

### Exemple: `src/schemas/accueil.schema.ts`

```typescript
import { defineSchema } from '@redcms/core';

export default defineSchema({
  slug: 'accueil',
  label: 'Page d\'accueil',
  fields: [
    // Champs simples
    { 
      name: 'hero_titre', 
      type: 'text', 
      label: 'Titre principal' 
    },
    { 
      name: 'hero_description', 
      type: 'textarea', 
      label: 'Description' 
    },
    { 
      name: 'hero_image', 
      type: 'image', 
      label: 'Image de fond' 
    },
    
    // Champ répétable (liste)
    { 
      name: 'services', 
      type: 'array', 
      label: 'Nos services',
      itemFields: [
        { name: 'nom', type: 'text', label: 'Nom du service' },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'image', type: 'image', label: 'Image' },
        { name: 'icone', type: 'icon', label: 'Icône' },
      ]
    },
    
    // Champs additionnels
    {
      name: 'temoignages',
      type: 'array',
      label: 'Témoignages clients',
      itemFields: [
        { name: 'nom', type: 'text', label: 'Nom du client' },
        { name: 'texte', type: 'textarea', label: 'Témoignage' },
        { name: 'note', type: 'number', label: 'Note /5' },
      ]
    }
  ]
});
```

### Types de champs supportés

| Type | Description | Interface admin |
|------|-------------|-----------------|
| `text` | Texte court | Input simple |
| `textarea` | Texte long | Textarea |
| `richtext` | Texte formaté | Éditeur WYSIWYG |
| `image` | Image | Sélecteur média |
| `number` | Nombre | Input number |
| `boolean` | Oui/Non | Toggle |
| `select` | Choix unique | Select/Dropdown |
| `color` | Couleur | Color picker |
| `url` | Lien | Input URL |
| `email` | Email | Input email |
| `array` | Liste répétable | Liste avec +/- |

---

## Usage côté pages Astro

### `src/pages/index.astro`

```astro
---
import { getPageContent } from '@redcms/core';
import Layout from '@/layouts/Layout.astro';

const content = await getPageContent('accueil');
---

<Layout title="Accueil">
  <!-- Hero -->
  <section class="hero">
    <img src={content.hero_image} alt="" />
    <h1>{content.hero_titre}</h1>
    <p>{content.hero_description}</p>
  </section>

  <!-- Services -->
  <section class="services">
    <h2>Nos Services</h2>
    <div class="grid">
      {content.services?.map(service => (
        <div class="card">
          <img src={service.image} alt={service.nom} />
          <h3>{service.nom}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  </section>

  <!-- Témoignages -->
  <section class="temoignages">
    {content.temoignages?.map(t => (
      <blockquote>
        <p>"{t.texte}"</p>
        <cite>{t.nom} - {t.note}/5</cite>
      </blockquote>
    ))}
  </section>
</Layout>
```

---

## Interface Admin

### Liste des pages

```
┌─────────────────────────────────────────────────────┐
│  📄 Pages                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🏠 Page d'accueil                      [✏️] │   │
│  │    Dernière modification: il y a 2 heures   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔧 Services                            [✏️] │   │
│  │    Dernière modification: hier              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📞 Contact                             [✏️] │   │
│  │    Dernière modification: 3 jours           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Éditeur de page

```
┌─────────────────────────────────────────────────────┐
│  ← Retour    Page d'accueil           [Sauvegarder] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TITRE PRINCIPAL                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ Bienvenue chez BTP Expert                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  DESCRIPTION                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ Spécialiste de la rénovation depuis 20 ans  │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  IMAGE DE FOND                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📷 hero-bg.jpg                    [Changer]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  NOS SERVICES                                  [+]  │
│  ┌─────────────────────────────────────────────┐   │
│  │ ≡  Menuiserie                    [✏️] [🗑️] │   │
│  │ ≡  Plomberie                     [✏️] [🗑️] │   │
│  │ ≡  Électricité                   [✏️] [🗑️] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Modal d'édition d'item (Array)

```
┌─────────────────────────────────────────────────────┐
│  Modifier: Menuiserie                          [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  NOM DU SERVICE                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Menuiserie                                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  DESCRIPTION                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ Fabrication et pose de menuiseries sur      │   │
│  │ mesure : portes, fenêtres, escaliers...     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  IMAGE                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │  📷 menuiserie.jpg                 [Changer]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                              [Annuler] [Enregistrer]│
└─────────────────────────────────────────────────────┘
```

---

## Plan d'implémentation

### Phase 1: Core & API (Jour 1)

- [ ] 1.1 Nouvelle migration SQL `page_content`
- [ ] 1.2 `@redcms/core/content.ts` - getPageContent(), savePageContent()
- [ ] 1.3 `defineSchema()` helper + types TypeScript
- [ ] 1.4 API routes: GET/PUT `/api/pages/[slug]`
- [ ] 1.5 API route: GET `/api/schemas` (liste des schemas)

### Phase 2: Admin - Structure (Jour 2)

- [ ] 2.1 Nettoyer PageEditor.tsx (supprimer preview sections)
- [ ] 2.2 Nouveau `PagesList.tsx` - Liste les pages depuis schemas
- [ ] 2.3 Nouveau `ContentEditor.tsx` - Éditeur basé sur schema
- [ ] 2.4 Router admin: `/admin/pages`, `/admin/pages/[slug]`

### Phase 3: Admin - Champs (Jour 3)

- [ ] 3.1 `TextField` - Input texte simple
- [ ] 3.2 `TextareaField` - Textarea multiligne
- [ ] 3.3 `ImageField` - Sélecteur d'image (MediaLibrary)
- [ ] 3.4 `NumberField` - Input numérique
- [ ] 3.5 `BooleanField` - Toggle on/off
- [ ] 3.6 `SelectField` - Dropdown avec options

### Phase 4: Admin - ArrayField (Jour 4)

- [ ] 4.1 `ArrayField` - Composant conteneur
- [ ] 4.2 Liste des items avec drag & drop
- [ ] 4.3 Modal d'édition d'item
- [ ] 4.4 Ajouter / Supprimer items
- [ ] 4.5 Validation des sous-champs

### Phase 5: Intégration & Tests (Jour 5)

- [ ] 5.1 Créer un site exemple "BTP Demo"
- [ ] 5.2 3 pages: Accueil, Services, Contact
- [ ] 5.3 Tester ajout/modification/suppression
- [ ] 5.4 Documentation utilisateur
- [ ] 5.5 Préparer le packaging npm

---

## Fichiers à créer/modifier

### Nouveaux fichiers

```
redcms/core/content.ts           # getPageContent, savePageContent
redcms/core/schema.ts            # defineSchema, types
src/pages/api/content/[slug].ts  # API CRUD contenu
src/pages/api/schemas.ts         # API liste schemas
redcms/admin/components/ContentEditor.tsx
```

### Fichiers à modifier

```
redcms/admin/components/PagesList.tsx   # Afficher pages depuis schemas
redcms/admin/components/AdminApp.tsx    # Routes
redcms/admin/components/fields/*        # Améliorer ArrayField
```

### Fichiers à supprimer

```
- Ancien PageEditor avec preview sections (remplacer)
- LayoutEditor (garder pour Header/Footer si besoin)
- Tout ce qui concerne les "sections dynamiques"
```

---

## Configuration

### `redcms.config.ts`

```typescript
import { defineConfig } from '@redcms/core';

export default defineConfig({
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  schemas: [
    './src/schemas/accueil.schema.ts',
    './src/schemas/services.schema.ts',
    './src/schemas/contact.schema.ts',
  ],
  media: {
    bucket: 'media',
    maxSize: 5 * 1024 * 1024, // 5MB
  },
});
```

---

## Décisions prises

1. **Header/Footer** → ✅ Garder le LayoutEditor actuel (gestion des liens)
2. **Blog** → ⏳ On modifiera plus tard
3. **SEO** → ✅ Modifiable dans l'admin (onglet SEO par page)
4. **Multilingue** → ⏳ Plus tard
5. **Versioning** → ⏳ Plus tard

---

## SEO - Intégration

Chaque page aura automatiquement un onglet/section SEO dans l'admin :

```typescript
// Champs SEO ajoutés automatiquement à chaque page
{
  seo_title: string,        // Titre pour Google
  seo_description: string,  // Meta description
  seo_image: string,        // Image Open Graph
  seo_noindex: boolean,     // Masquer des moteurs
}
```

**Interface admin :**
```
┌─────────────────────────────────────────────────────┐
│  Page d'accueil                                     │
├─────────────────────────────────────────────────────┤
│  [Contenu]  [SEO]                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TITRE SEO (balise title)                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ BTP Expert - Rénovation à Paris             │   │
│  └─────────────────────────────────────────────┘   │
│  60 caractères max                                  │
│                                                     │
│  DESCRIPTION SEO (meta description)                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Entreprise de rénovation spécialisée...     │   │
│  └─────────────────────────────────────────────┘   │
│  160 caractères max                                 │
│                                                     │
│  IMAGE DE PARTAGE (Open Graph)                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📷 og-image.jpg                   [Changer]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ☐ Ne pas indexer cette page                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Prochaine étape

Valide ce plan, puis on commence par la **Phase 1** : Core & API.
