import type { RedCMSConfig } from './core/types';

/**
 * Configuration RedCMS pour ce client
 * Personnalisable par projet
 */
export const config: RedCMSConfig = {
  // Nom du site
  siteName: 'Mon Site',
  
  // Sections activées pour ce client
  enabledSections: [
    'hero-principal',
    'hero-slider',
    'texte-image',
    'faq',
    'galerie',
    'carrousel',
    'temoignages',
    'logos-clients',
    'chiffres-cles',
    'equipe',
    'a-propos',
    'services',
    'produits',
    'cta',
    'contact',
    'liste-articles',
  ],
  
  // Options globales
  options: {
    // Activer le blog
    blogEnabled: true,
    
    // Nombre max de versions conservées par page
    maxVersions: 10,
  },
};

export default config;
