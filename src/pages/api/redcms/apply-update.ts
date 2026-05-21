import type { APIRoute } from 'astro';
import { applyUpdate, checkForUpdate, createBackup } from '@redcms/core/updater';

/**
 * API Endpoint: POST /api/redcms/apply-update
 * Applique une mise à jour après confirmation
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier qu'une mise à jour est disponible
    const updateInfo = await checkForUpdate();

    if (!updateInfo.hasUpdate) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Aucune mise à jour disponible',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Créer un backup
    const backupName = await createBackup();

    // Appliquer la mise à jour
    const success = await applyUpdate(updateInfo);

    return new Response(
      JSON.stringify({
        success,
        message: success 
          ? `Mise à jour vers ${updateInfo.latestVersion} réussie` 
          : 'Échec de la mise à jour',
        backup: backupName,
        previousVersion: updateInfo.currentVersion,
        newVersion: updateInfo.latestVersion,
      }),
      {
        status: success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la mise à jour',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
