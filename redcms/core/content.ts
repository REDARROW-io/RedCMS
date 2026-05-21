/**
 * RedCMS - Content API
 * Fonctions pour récupérer et sauvegarder le contenu des pages
 */

import { supabase } from './supabase';
import type { PageContent, SEOContent } from './schema';

/**
 * Récupère le contenu d'une page par son slug
 */
export async function getPageContent<T = Record<string, any>>(
  slug: string
): Promise<{ content: T; seo: SEOContent } | null> {
  const { data, error } = await supabase
    .from('page_content')
    .select('content, seo')
    .eq('page_slug', slug)
    .single();

  if (error || !data) {
    // Si la page n'existe pas, retourner un contenu vide
    if (error?.code === 'PGRST116') {
      return { content: {} as T, seo: {} };
    }
    console.error('Error fetching page content:', error);
    return null;
  }

  return {
    content: (data.content || {}) as T,
    seo: (data.seo || {}) as SEOContent,
  };
}

/**
 * Sauvegarde le contenu d'une page
 */
export async function savePageContent(
  slug: string,
  content: Record<string, any>,
  seo?: SEOContent
): Promise<boolean> {
  const { error } = await supabase
    .from('page_content')
    .upsert(
      {
        page_slug: slug,
        content,
        seo: seo || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_slug' }
    );

  if (error) {
    console.error('Error saving page content:', error);
    return false;
  }

  return true;
}

/**
 * Récupère la liste de toutes les pages avec leur date de modification
 */
export async function getAllPagesContent(): Promise<
  Array<{ page_slug: string; updated_at: string }>
> {
  const { data, error } = await supabase
    .from('page_content')
    .select('page_slug, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all pages:', error);
    return [];
  }

  return data || [];
}

/**
 * Supprime le contenu d'une page
 */
export async function deletePageContent(slug: string): Promise<boolean> {
  const { error } = await supabase
    .from('page_content')
    .delete()
    .eq('page_slug', slug);

  if (error) {
    console.error('Error deleting page content:', error);
    return false;
  }

  return true;
}
