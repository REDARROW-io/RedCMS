import type { APIRoute } from 'astro';
import { supabase } from '@redcms/core/supabase';

const REDLINK_API_URL = import.meta.env.REDLINK_API_URL || 'https://redlink.redarrow.fr';

export const GET: APIRoute = async () => {
  // Get current user session (JWT is validated server-side by RedLink)
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Non authentifié' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Exchange the RedHosting Supabase JWT for a RedLink session token.
    // RedLink validates the JWT and verifies the RedLink subscription via check-access
    // — no shared API key needs to live in this app.
    const res = await fetch(`${REDLINK_API_URL}/auth/redhosting-exchange`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (res.status === 403) {
      return new Response(
        JSON.stringify({ error: "Aucun abonnement RedLink actif sur ce compte." }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Impossible d'accéder à RedLink" }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { token } = await res.json();

    // Redirect to RedLink dashboard with token
    return Response.redirect(`${REDLINK_API_URL}/dashboard/?token=${token}`, 302);
  } catch {
    return new Response(JSON.stringify({ error: 'Erreur de connexion à RedLink' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
