import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';
import fs from 'fs';
import path from 'path';

interface PageInfo {
  id: string;
  title: string;
  slug: string;
  type: 'cms' | 'file';
  status: 'published' | 'draft';
  filePath?: string;
  updatedAt?: string;
}

// Scan /src/pages for .astro files (excluding admin, api, dynamic routes)
function scanAstroPages(dir: string, baseDir: string = dir): PageInfo[] {
  const pages: PageInfo[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      // Skip admin, api, and hidden directories
      if (entry.isDirectory()) {
        if (['admin', 'api', '_', '.'].some(skip => entry.name.startsWith(skip))) {
          continue;
        }
        // Recursively scan subdirectories
        pages.push(...scanAstroPages(fullPath, baseDir));
      } else if (entry.name.endsWith('.astro')) {
        // Skip dynamic routes like [slug].astro
        if (entry.name.includes('[')) continue;
        
        // Skip special files
        if (['404.astro', '500.astro'].includes(entry.name)) continue;
        
        // Generate slug from file path
        let slug = relativePath
          .replace(/\.astro$/, '')
          .replace(/index$/, '')
          .replace(/\\/g, '/');
        
        if (slug === '') slug = '/';
        else if (!slug.startsWith('/')) slug = '/' + slug;
        if (slug.endsWith('/') && slug !== '/') slug = slug.slice(0, -1);
        
        // Generate title from filename
        const fileName = entry.name.replace('.astro', '');
        const title = fileName === 'index' 
          ? (relativePath.includes('/') ? path.dirname(relativePath).split('/').pop() : 'Accueil')
          : fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/-/g, ' ');
        
        // Get file stats for date
        const stats = fs.statSync(fullPath);
        
        pages.push({
          id: `file:${relativePath}`,
          title: title || 'Page',
          slug,
          type: 'file',
          status: 'published',
          filePath: relativePath,
          updatedAt: stats.mtime.toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error scanning pages:', error);
  }
  
  return pages;
}

export const GET: APIRoute = async () => {
  const pages: PageInfo[] = [];
  
  // 1. Get CMS pages from Supabase
  const { data: cmsPages, error } = await supabase
    .from('pages')
    .select('id, title, slug, status, updated_at')
    .order('updated_at', { ascending: false });
  
  if (cmsPages) {
    for (const page of cmsPages) {
      pages.push({
        id: page.id,
        title: page.title,
        slug: page.slug.startsWith('/') ? page.slug : '/' + page.slug,
        type: 'cms',
        status: page.status,
        updatedAt: page.updated_at,
      });
    }
  }
  
  // 2. Scan file-based pages
  const pagesDir = path.resolve(process.cwd(), 'src/pages');
  const filePages = scanAstroPages(pagesDir);
  
  // Merge, avoiding duplicates (CMS pages take priority over file pages with same slug)
  const cmsSlugSet = new Set(pages.map(p => p.slug));
  for (const filePage of filePages) {
    if (!cmsSlugSet.has(filePage.slug)) {
      pages.push(filePage);
    }
  }
  
  // Sort by updatedAt
  pages.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return new Response(JSON.stringify(pages), {
    headers: { 'Content-Type': 'application/json' },
  });
};
