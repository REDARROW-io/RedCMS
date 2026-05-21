/**
 * Utilitaires SEO pour générer les meta tags et données structurées
 */

import { siteConfig } from './siteConfig';

export interface PageSEO {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

/**
 * Génère le titre complet de la page avec le template
 */
export function getPageTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.defaultTitle;
  return siteConfig.titleTemplate.replace('%s', pageTitle);
}

/**
 * Génère les meta tags HTML pour une page
 */
export function generateMetaTags(seo: PageSEO = {}): string {
  const title = getPageTitle(seo.title);
  const description = seo.description || siteConfig.defaultDescription;
  const ogImage = seo.ogImage || siteConfig.defaultOgImage;
  const canonical = seo.canonical;
  
  const robots: string[] = [];
  if (seo.noindex) robots.push('noindex');
  if (seo.nofollow) robots.push('nofollow');
  
  let tags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage.startsWith('http') ? ogImage : siteConfig.siteUrl + ogImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${siteConfig.defaultLocale}" />
    <meta property="og:site_name" content="${escapeHtml(siteConfig.siteName)}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage.startsWith('http') ? ogImage : siteConfig.siteUrl + ogImage}" />
  `;
  
  if (robots.length > 0) {
    tags += `\n    <meta name="robots" content="${robots.join(', ')}" />`;
  }
  
  if (canonical) {
    tags += `\n    <link rel="canonical" href="${canonical}" />`;
  }
  
  if (siteConfig.twitter) {
    tags += `\n    <meta name="twitter:site" content="${siteConfig.twitter}" />`;
  }
  
  return tags;
}

/**
 * Génère le Schema.org LocalBusiness JSON-LD
 */
export function generateLocalBusinessSchema(): string | null {
  if (!siteConfig.business) return null;
  
  const { business } = siteConfig;
  
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': business.type,
    name: business.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
  };
  
  if (business.phone) schema.telephone = business.phone;
  if (business.email) schema.email = business.email;
  if (business.openingHours) schema.openingHours = business.openingHours;
  
  if (business.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    };
  }
  
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Génère le Schema.org FAQ pour une section FAQ
 */
export function generateFAQSchema(items: { question: string; answer: string }[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Génère le Schema.org Review/Testimonial
 */
export function generateReviewSchema(reviews: {
  author: string;
  rating: number;
  text: string;
  date?: string;
}[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.siteName,
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.text,
      ...(review.date && { datePublished: review.date }),
    })),
  };
  
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Génère le Schema.org Article pour les articles de blog
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  url: string;
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || siteConfig.defaultOgImage,
    author: {
      '@type': 'Person',
      name: article.author || siteConfig.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
  
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Échappe les caractères HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default {
  getPageTitle,
  generateMetaTags,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateReviewSchema,
  generateArticleSchema,
};
