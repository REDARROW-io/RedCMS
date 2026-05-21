import type { APIRoute } from 'astro';
import { siteConfig } from '@redcms/core/siteConfig';
import { supabase } from '@redcms/core/supabase';

export const GET: APIRoute = async () => {
  const robotsTxt = `# Robots.txt généré par RedCMS

User-agent: *
Allow: /

# Bloquer l'accès à l'admin
Disallow: /admin/

# Sitemap
Sitemap: ${siteConfig.siteUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
