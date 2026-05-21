/**
 * Configuration SEO globale du site
 * Ce fichier doit être édité par le développeur pour chaque client
 */

export interface SiteConfig {
  // Informations générales
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  
  // SEO par défaut
  defaultTitle: string;
  titleTemplate: string; // ex: "%s | Mon Site"
  defaultDescription: string;
  defaultOgImage: string;
  
  // Favicon et icônes
  favicon: string;
  appleTouchIcon?: string;
  
  // Réseaux sociaux
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  
  // SEO Local (LocalBusiness)
  business?: {
    name: string;
    type: string; // ex: "LocalBusiness", "Restaurant", "Store"
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    phone?: string;
    email?: string;
    openingHours?: string[]; // ex: ["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"]
    geo?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Options
  generateSitemap: boolean;
  generateRobotsTxt: boolean;
}

export const siteConfig: SiteConfig = {
  // À personnaliser pour chaque client
  siteName: 'Mon Site',
  siteUrl: 'https://example.com',
  defaultLocale: 'fr-FR',
  
  defaultTitle: 'Mon Site',
  titleTemplate: '%s | Mon Site',
  defaultDescription: 'Description par défaut du site pour les moteurs de recherche.',
  defaultOgImage: '/og-image.jpg',
  
  favicon: '/favicon.ico',
  appleTouchIcon: '/apple-touch-icon.png',
  
  // Réseaux sociaux (optionnel)
  // twitter: '@monsite',
  // facebook: 'monsite',
  // instagram: 'monsite',
  // linkedin: 'company/monsite',
  
  // SEO Local (optionnel)
  // business: {
  //   name: 'Mon Entreprise',
  //   type: 'LocalBusiness',
  //   address: {
  //     street: '123 Rue Exemple',
  //     city: 'Paris',
  //     postalCode: '75001',
  //     country: 'FR',
  //   },
  //   phone: '+33 1 23 45 67 89',
  //   email: 'contact@example.com',
  //   openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-16:00'],
  //   geo: {
  //     latitude: 48.8566,
  //     longitude: 2.3522,
  //   },
  // },
  
  generateSitemap: true,
  generateRobotsTxt: true,
};

export default siteConfig;
