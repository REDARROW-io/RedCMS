/**
 * API: GET /api/schemas
 * 
 * Logique inversée :
 * 1. Scanne /src/pages/*.astro pour trouver les pages
 * 2. Pour chaque page, cherche le schema correspondant
 * 3. Retourne toutes les pages avec indication si schema manquant
 * 
 * Convention: 
 * - Page: src/pages/produits.astro → slug: "produits"
 * - Page: src/pages/index.astro → slug: "accueil"
 * - Schema: src/schemas/produits.schema.ts
 */

import type { APIRoute } from 'astro';
import type { PageSchema } from '@redcms/core/schema';

export const prerender = false;

interface PageInfo extends Partial<PageSchema> {
  slug: string;
  label: string;
  hasSchema: boolean;
  pagePath: string;
}

// Pages à ignorer (admin, api, etc.)
const IGNORED_PAGES = ['admin', 'api', 'blog', 'robots.txt', 'sitemap.xml'];
const IGNORED_PATTERNS = [/^\[.*\]$/, /^_/]; // [slug], _hidden

export const GET: APIRoute = async () => {
  try {
    const pages: PageInfo[] = [];
    
    // 1. Charger tous les schemas disponibles
    const schemaModules = import.meta.glob('/src/schemas/*.schema.ts', { eager: true });
    const schemasMap = new Map<string, PageSchema>();
    
    for (const path in schemaModules) {
      const module = schemaModules[path] as { default: PageSchema };
      if (module.default) {
        schemasMap.set(module.default.slug, module.default);
      }
    }
    
    // 2. Scanner les pages Astro
    const pageModules = import.meta.glob('/src/pages/*.astro');
    
    for (const pagePath of Object.keys(pageModules)) {
      // Extraire le nom du fichier: /src/pages/produits.astro → produits
      const match = pagePath.match(/^\/src\/pages\/([^/]+)\.astro$/);
      if (!match) continue;
      
      const fileName = match[1];
      
      // Ignorer certaines pages
      if (IGNORED_PAGES.some(ignored => fileName.startsWith(ignored))) continue;
      if (IGNORED_PATTERNS.some(pattern => pattern.test(fileName))) continue;
      
      // Déterminer le slug
      const slug = fileName === 'index' ? 'accueil' : fileName;
      
      // Chercher le schema correspondant
      const schema = schemasMap.get(slug);
      
      if (schema) {
        // Page avec schema
        pages.push({
          ...schema,
          hasSchema: true,
          pagePath,
        });
      } else {
        // Page sans schema (non éditable mais affichée)
        pages.push({
          slug,
          label: formatLabel(fileName),
          icon: '📄',
          description: '⚠️ Aucun schema défini - Page non éditable',
          fields: [],
          hasSchema: false,
          pagePath,
        });
      }
    }
    
    // Trier : pages avec schema d'abord, puis par label
    pages.sort((a, b) => {
      if (a.hasSchema !== b.hasSchema) return a.hasSchema ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
    
    return new Response(JSON.stringify(pages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error loading pages:', error);
    return new Response(JSON.stringify({ error: 'Failed to load pages', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Formatte un nom de fichier en label lisible
 * produits → Produits
 * nos-services → Nos Services
 */
function formatLabel(fileName: string): string {
  if (fileName === 'index') return 'Accueil';
  return fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
