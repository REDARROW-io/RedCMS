import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  
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
  
  // Filter by key
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
};

export const PUT: APIRoute = async ({ params, request }) => {
  const key = params.key;
  const body = await request.json();
  const { value } = body;
  
  if (!value) {
    return new Response(JSON.stringify({ error: 'Missing value' }), {
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
