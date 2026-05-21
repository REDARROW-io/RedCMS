import type { APIRoute } from 'astro';
import { siteConfig } from '@redcms/core/siteConfig';
import { supabase } from '@redcms/core/supabase';

export const GET: APIRoute = async () => {
  // Récupérer toutes les pages publiées
  const { data: pages } = await supabase
    .from('pages')
    .select('slug, updated_at')
    .eq('status', 'published');

  // Récupérer tous les articles publiés
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published');

  const baseUrl = siteConfig.siteUrl;
  const now = new Date().toISOString();

  let urls = `
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>`;

  // Ajouter les pages
  if (pages) {
    for (const page of pages) {
      urls += `
    <url>
      <loc>${baseUrl}/${page.slug}</loc>
      <lastmod>${page.updated_at}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
    }
  }

  // Ajouter les articles
  if (articles) {
    for (const article of articles) {
      urls += `
    <url>
      <loc>${baseUrl}/blog/${article.slug}</loc>
      <lastmod>${article.updated_at}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`;
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
