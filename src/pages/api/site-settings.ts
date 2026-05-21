import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';

// GET /api/site-settings?key=header
export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('key');
  
  // Get all settings first
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (key) {
    // Filter by key manually
    const setting = data?.find(s => s.key === key);
    
    if (!setting) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(setting), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// PUT /api/site-settings
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { key, value } = body;
  
  if (!key || !value) {
    return new Response(JSON.stringify({ error: 'Missing key or value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
