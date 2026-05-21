/**
 * API: GET /api/content/all
 * Retourne les métadonnées de toutes les pages
 */

import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from('page_content')
    .select('page_slug, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data || []), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
