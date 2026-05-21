/**
 * API: GET/PUT /api/content/[slug]
 * Gère le contenu d'une page spécifique
 */

import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';

export const prerender = false;

// GET - Récupérer le contenu d'une page
export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug requis' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Si pas de données, retourner un objet vide
  const result = data || {
    page_slug: slug,
    content: {},
    seo: {},
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// PUT - Mettre à jour le contenu d'une page
export const PUT: APIRoute = async ({ params, request }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug requis' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { content, seo } = body;

    const { data, error } = await supabase
      .from('page_content')
      .upsert(
        {
          page_slug: slug,
          content: content || {},
          seo: seo || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug' }
      )
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
