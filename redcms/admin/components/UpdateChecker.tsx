import { useState, useEffect } from 'react';
import { RefreshCw, Download, Check, AlertCircle } from 'lucide-react';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  releaseDate?: string;
}

export function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUpdate();
  }, []);

  async function checkUpdate() {
    setChecking(true);
    setError(null);

    try {
      const res = await fetch('/api/redcms/check-update');
      const data = await res.json();
      setUpdateInfo(data);
    } catch (err) {
      setError('Impossible de vérifier les mises à jour');
    } finally {
      setChecking(false);
    }
  }

  async function applyUpdate() {
    if (!updateInfo?.hasUpdate) return;

    if (!confirm(`Mettre à jour vers la version ${updateInfo.latestVersion} ?\n\nUn backup sera créé automatiquement.`)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const res = await fetch('/api/redcms/apply-update', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        alert(`Mise à jour réussie ! La page va se recharger.`);
        window.location.reload();
      } else {
        setError(data.message || 'Échec de la mise à jour');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Mises à jour RedCMS</h3>
        <button
          className="admin-btn admin-btn-secondary"
          onClick={checkUpdate}
          disabled={checking}
          style={{ padding: '6px 12px' }}
        >
          <RefreshCw size={14} className={checking ? 'spin' : ''} />
          {checking ? 'Vérification...' : 'Vérifier'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: 12,
          background: 'var(--admin-danger-light)',
          color: 'var(--admin-danger)',
          borderRadius: 6,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {updateInfo && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: 'var(--admin-text-muted)' }}>Version actuelle:</span>
              <strong>{updateInfo.currentVersion}</strong>
            </div>

            {updateInfo.hasUpdate ? (
              <div style={{
                padding: 16,
                background: 'var(--admin-success-light)',
                borderRadius: 8,
                border: '1px solid var(--admin-success)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Download size={18} style={{ color: 'var(--admin-success)' }} />
                  <strong style={{ color: 'var(--admin-success)' }}>
                    Version {updateInfo.latestVersion} disponible
                  </strong>
                </div>

                {updateInfo.releaseDate && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: 12 }}>
                    Publiée le {new Date(updateInfo.releaseDate).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {updateInfo.releaseNotes && (
                  <div style={{
                    background: 'white',
                    padding: 12,
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    marginBottom: 16,
                    maxHeight: 150,
                    overflow: 'auto',
                  }}>
                    <strong>Notes de version:</strong>
                    <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {updateInfo.releaseNotes}
                    </div>
                  </div>
                )}

                <button
                  className="admin-btn admin-btn-primary"
                  onClick={applyUpdate}
                  disabled={updating}
                >
                  {updating ? 'Mise à jour en cours...' : 'Installer la mise à jour'}
                </button>
              </div>
            ) : (
              <div style={{
                padding: 16,
                background: 'var(--admin-bg)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--admin-text-muted)',
              }}>
                <Check size={18} style={{ color: 'var(--admin-success)' }} />
                RedCMS est à jour
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default UpdateChecker;
