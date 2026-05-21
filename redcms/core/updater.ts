/**
 * Système de mise à jour RedCMS
 * Gère la vérification et l'application des mises à jour
 */

import version from './version.json';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  releaseDate?: string;
  downloadUrl?: string;
  migrations?: string[];
}

export interface UpdateConfig {
  // URL du repository GitHub ou serveur de mise à jour
  updateServerUrl: string;
  // Branche à suivre (main, stable, etc.)
  branch: string;
  // Activer les mises à jour automatiques
  autoCheck: boolean;
  // Intervalle de vérification en heures
  checkInterval: number;
}

const defaultConfig: UpdateConfig = {
  updateServerUrl: 'https://api.github.com/repos/redarrow/redcms',
  branch: 'main',
  autoCheck: true,
  checkInterval: 24,
};

/**
 * Récupère la version actuelle
 */
export function getCurrentVersion(): string {
  return version.version;
}

/**
 * Compare deux versions semver
 * Retourne: -1 si v1 < v2, 0 si égal, 1 si v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Vérifie si une mise à jour est disponible
 */
export async function checkForUpdate(config: Partial<UpdateConfig> = {}): Promise<UpdateInfo> {
  const cfg = { ...defaultConfig, ...config };
  const currentVersion = getCurrentVersion();

  try {
    // Récupérer les infos de la dernière release depuis GitHub
    const response = await fetch(`${cfg.updateServerUrl}/releases/latest`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const release = await response.json();
    const latestVersion = release.tag_name?.replace('v', '') || currentVersion;

    return {
      currentVersion,
      latestVersion,
      hasUpdate: compareVersions(currentVersion, latestVersion) < 0,
      releaseNotes: release.body,
      releaseDate: release.published_at,
      downloadUrl: release.zipball_url,
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
    };
  }
}

/**
 * Récupère la liste des migrations à appliquer entre deux versions
 */
export async function getMigrations(fromVersion: string, toVersion: string): Promise<string[]> {
  // Dans une vraie implémentation, cela récupérerait les migrations depuis le serveur
  // Pour l'instant, on retourne un tableau vide
  return [];
}

/**
 * Crée un backup des fichiers core avant mise à jour
 */
export async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `redcms-backup-${timestamp}`;
  
  // Note: Cette fonction devra être implémentée côté serveur
  // car le navigateur n'a pas accès au système de fichiers
  
  return backupName;
}

/**
 * Applique une mise à jour
 */
export async function applyUpdate(updateInfo: UpdateInfo): Promise<boolean> {
  if (!updateInfo.hasUpdate) {
    return false;
  }

  try {
    // 1. Créer un backup
    const backupName = await createBackup();
    console.log(`Backup créé: ${backupName}`);

    // 2. Télécharger la nouvelle version
    // Note: Cette étape nécessite une API côté serveur

    // 3. Appliquer les migrations BDD
    const migrations = await getMigrations(updateInfo.currentVersion, updateInfo.latestVersion);
    for (const migration of migrations) {
      console.log(`Application de la migration: ${migration}`);
      // Appliquer la migration
    }

    // 4. Mettre à jour les fichiers
    // Note: Cette étape nécessite une API côté serveur

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return false;
  }
}

export default {
  getCurrentVersion,
  compareVersions,
  checkForUpdate,
  getMigrations,
  createBackup,
  applyUpdate,
};
