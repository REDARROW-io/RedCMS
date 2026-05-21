import type { APIRoute } from 'astro';
import { checkForUpdate, getCurrentVersion } from '@redcms/core/updater';

/**
 * API Endpoint: GET /api/redcms/check-update
 * Vérifie si une mise à jour est disponible
 */
export const GET: APIRoute = async () => {
  try {
    const updateInfo = await checkForUpdate();

    return new Response(JSON.stringify(updateInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la vérification des mises à jour',
        currentVersion: getCurrentVersion(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
