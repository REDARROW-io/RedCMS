# Guide de Création de Sections

Ce guide explique comment créer de nouvelles sections pour RedCMS.

## Architecture des sections

Une section RedCMS se compose de deux parties :

1. **Définition** (`redcms/sections/`) : Schéma des champs éditables
2. **Composant** (`src/sections/`) : Rendu visuel Astro

---

## 1. Définir le schéma de la section

### 1.1 Fichier de définition

Ajoutez votre section dans `redcms/sections/registry.ts` ou créez un fichier séparé.

### 1.2 Structure du schéma

```typescript
'ma-section': {
  name: 'Ma Section',           // Nom affiché dans l'admin
  description: 'Description',   // Tooltip
  icon: '🎯',                   // Emoji pour l'icône
  category: 'Contenu',          // Catégorie de regroupement
  fields: [
    // Définition des champs...
  ],
},
```

### 1.3 Types de champs disponibles

#### `string` - Texte court

```typescript
{
  name: 'titre',
  label: 'Titre',
  type: 'string',
  required: true,
  placeholder: 'Entrez un titre...',
  default: 'Titre par défaut',
}
```

#### `text` - Texte long

```typescript
{
  name: 'description',
  label: 'Description',
  type: 'text',
}
```

#### `richtext` - Éditeur WYSIWYG

```typescript
{
  name: 'contenu',
  label: 'Contenu',
  type: 'richtext',
  required: true,
}
```

#### `number` - Nombre

```typescript
{
  name: 'colonnes',
  label: 'Nombre de colonnes',
  type: 'number',
  default: 3,
  min: 1,
  max: 6,
}
```

#### `boolean` - Toggle On/Off

```typescript
{
  name: 'afficherBouton',
  label: 'Afficher le bouton',
  type: 'boolean',
  default: true,
}
```

#### `select` - Liste déroulante

```typescript
{
  name: 'alignement',
  label: 'Alignement',
  type: 'select',
  default: 'center',
  options: [
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ],
}
```

#### `image` - Sélecteur d'image

```typescript
{
  name: 'image',
  label: 'Image de fond',
  type: 'image',
  required: true,
}
```

#### `color` - Sélecteur de couleur

```typescript
{
  name: 'couleurFond',
  label: 'Couleur de fond',
  type: 'color',
  default: '#ffffff',
}
```

#### `url` - Lien

```typescript
{
  name: 'lien',
  label: 'URL du lien',
  type: 'url',
}
```

#### `email` - Email

```typescript
{
  name: 'email',
  label: 'Email de contact',
  type: 'email',
}
```

#### `array` - Liste répétable

```typescript
{
  name: 'items',
  label: 'Éléments',
  type: 'array',
  items: [
    { name: 'titre', label: 'Titre', type: 'string', required: true },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'description', label: 'Description', type: 'text' },
  ],
}
```

---

## 2. Créer le composant Astro

### 2.1 Fichier du composant

Créez `src/sections/MaSection.astro` :

```astro
---
/**
 * Ma Section - Description
 */

export interface Props {
  data: {
    titre?: string;
    description?: string;
    items?: Array<{
      titre: string;
      image?: string;
    }>;
    // ... autres champs
  };
}

const { data } = Astro.props;

// Valeurs par défaut
const titre = data.titre || 'Titre par défaut';
const items = data.items || [];
---

<section class="ma-section">
  <div class="container">
    {titre && <h2>{titre}</h2>}
    
    {data.description && (
      <p class="description">{data.description}</p>
    )}
    
    {items.length > 0 && (
      <div class="items-grid">
        {items.map((item) => (
          <div class="item">
            {item.image && <img src={item.image} alt={item.titre} />}
            <h3>{item.titre}</h3>
          </div>
        ))}
      </div>
    )}
  </div>
</section>

<style>
  .ma-section {
    padding: 4rem 0;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .description {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .item {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .item img {
    width: 100%;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .item h3 {
    font-size: 1.25rem;
  }
</style>
```

### 2.2 Enregistrer dans le SectionRenderer

Éditez `src/sections/SectionRenderer.astro` :

```astro
---
// Ajouter l'import
import MaSection from './MaSection.astro';

// Ajouter dans le mapping
const components: Record<string, any> = {
  // ... sections existantes
  'ma-section': MaSection,
};
---
```

---

## 3. Exemple complet : Section "Bannière Promo"

### 3.1 Définition du schéma

```typescript
// Dans redcms/sections/registry.ts

'banniere-promo': {
  name: 'Bannière Promo',
  description: 'Bandeau promotionnel avec compte à rebours',
  icon: '🎉',
  category: 'Conversion',
  fields: [
    { name: 'texte', label: 'Texte', type: 'string', required: true },
    { name: 'lien', label: 'Lien', type: 'url' },
    { name: 'boutonTexte', label: 'Texte du bouton', type: 'string', default: 'En profiter' },
    { name: 'couleurFond', label: 'Couleur de fond', type: 'color', default: '#e11d48' },
    { name: 'couleurTexte', label: 'Couleur du texte', type: 'color', default: '#ffffff' },
    { name: 'afficherCompteRebours', label: 'Afficher compte à rebours', type: 'boolean', default: false },
    { name: 'dateFin', label: 'Date de fin (compte à rebours)', type: 'string' },
  ],
},
```

### 3.2 Composant Astro

```astro
---
// src/sections/BannierePromo.astro

export interface Props {
  data: {
    texte?: string;
    lien?: string;
    boutonTexte?: string;
    couleurFond?: string;
    couleurTexte?: string;
    afficherCompteRebours?: boolean;
    dateFin?: string;
  };
}

const { data } = Astro.props;

const texte = data.texte || 'Offre spéciale !';
const boutonTexte = data.boutonTexte || 'En profiter';
const couleurFond = data.couleurFond || '#e11d48';
const couleurTexte = data.couleurTexte || '#ffffff';
---

<div 
  class="banniere-promo"
  style={`background-color: ${couleurFond}; color: ${couleurTexte};`}
>
  <div class="container">
    <span class="texte">{texte}</span>
    
    {data.afficherCompteRebours && data.dateFin && (
      <span class="compte-rebours" data-date={data.dateFin}>
        <!-- JS pour le compte à rebours -->
      </span>
    )}
    
    {data.lien && (
      <a href={data.lien} class="bouton" style={`color: ${couleurFond};`}>
        {boutonTexte}
      </a>
    )}
  </div>
</div>

<style>
  .banniere-promo {
    padding: 0.75rem 0;
    text-align: center;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .texte {
    font-weight: 500;
  }
  
  .bouton {
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .bouton:hover {
    opacity: 0.9;
  }
</style>
```

### 3.3 Enregistrement

```astro
// src/sections/SectionRenderer.astro

import BannierePromo from './BannierePromo.astro';

const components = {
  // ...
  'banniere-promo': BannierePromo,
};
```

---

## 4. Bonnes pratiques

### Nommage

- **Schéma** : `ma-section` (kebab-case)
- **Composant** : `MaSection.astro` (PascalCase)
- **Champs** : `monChamp` (camelCase)

### Valeurs par défaut

Toujours prévoir des valeurs par défaut dans le composant pour éviter les erreurs si un champ n'est pas rempli.

### Responsive

Testez vos sections sur mobile, tablette et desktop.

### Performance

- Optimisez les images (lazy loading)
- Évitez le JavaScript inutile
- Utilisez des styles scopés

### Accessibilité

- Utilisez des balises sémantiques (`<section>`, `<article>`, `<nav>`)
- Ajoutez des attributs `alt` aux images
- Assurez un bon contraste des couleurs

### SEO

- Utilisez les bonnes balises de titre (`<h2>`, `<h3>`)
- Ajoutez des données structurées si pertinent (Schema.org)

---

## 5. Sections avec Schema.org

### Exemple : FAQ avec Schema.org

```astro
---
// src/sections/FAQ.astro
import { generateFAQSchema } from '@redcms/core/seo';

const { data } = Astro.props;
const items = data.items || [];

// Générer le Schema.org si activé
const faqSchema = data.schemaFAQ 
  ? generateFAQSchema(items.map(i => ({ question: i.question, answer: i.reponse })))
  : null;
---

<section class="faq">
  <!-- Contenu de la FAQ -->
</section>

{faqSchema && <Fragment set:html={faqSchema} />}
```

---

## 6. Debug

### Vérifier les données reçues

```astro
---
const { data } = Astro.props;
console.log('Section data:', JSON.stringify(data, null, 2));
---
```

### Section non reconnue

Si votre section affiche "Section non reconnue", vérifiez :
1. Le nom dans `registry.ts` correspond au type utilisé
2. Le composant est importé dans `SectionRenderer.astro`
3. Le mapping est correct

---

## Support

Questions ? Contactez l'équipe Red Arrow.

**RedCMS** - Créé avec ❤️ par Red Arrow
