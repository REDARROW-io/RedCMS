/**
 * RedCMS - Schema Definition
 * Permet de définir les champs éditables d'une page
 */

// Types de champs supportés
export type FieldType = 
  | 'text'      // Texte court (input)
  | 'textarea'  // Texte long (textarea)
  | 'richtext'  // Éditeur WYSIWYG
  | 'image'     // Sélecteur d'image
  | 'number'    // Nombre
  | 'boolean'   // Toggle
  | 'select'    // Dropdown
  | 'color'     // Color picker
  | 'url'       // Lien
  | 'email'     // Email
  | 'array';    // Liste répétable

// Définition d'un champ
export interface FieldDefinition {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  default?: any;
  // Pour select
  options?: { value: string; label: string }[];
  // Pour array
  itemFields?: FieldDefinition[];
  // Pour number
  min?: number;
  max?: number;
  step?: number;
  // Pour text/textarea
  maxLength?: number;
}

// Définition d'un schema de page
export interface PageSchema {
  slug: string;
  label: string;
  icon?: string;
  description?: string;
  fields: FieldDefinition[];
}

// Contenu SEO
export interface SEOContent {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

// Contenu d'une page
export interface PageContent {
  page_slug: string;
  content: Record<string, any>;
  seo: SEOContent;
  updated_at?: string;
  created_at?: string;
}

/**
 * Helper pour définir un schema de page
 */
export function defineSchema(schema: PageSchema): PageSchema {
  return schema;
}

/**
 * Champs SEO par défaut (ajoutés automatiquement)
 */
export const seoFields: FieldDefinition[] = [
  {
    name: 'title',
    type: 'text',
    label: 'Titre SEO',
    placeholder: 'Titre pour les moteurs de recherche',
    maxLength: 60,
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Description SEO',
    placeholder: 'Description pour les moteurs de recherche',
    maxLength: 160,
  },
  {
    name: 'image',
    type: 'image',
    label: 'Image de partage (Open Graph)',
  },
  {
    name: 'noindex',
    type: 'boolean',
    label: 'Ne pas indexer cette page',
    default: false,
  },
];
