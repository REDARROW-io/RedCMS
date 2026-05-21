import { useState, useEffect } from 'react';
import { FileText, Newspaper, Image, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@redcms/core/supabase';
import version from '@redcms/core/version.json';

interface Stats {
  pages: number;
  articles: number;
  media: number;
  published: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ pages: 0, articles: 0, media: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [recentPages, setRecentPages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Récupérer le nombre de schemas (pages)
      const schemasRes = await fetch('/api/schemas');
      const schemas = schemasRes.ok ? await schemasRes.json() : [];
      
      const [articlesRes, mediaRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('media').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        pages: schemas.length || 0,
        articles: articlesRes.count || 0,
        media: mediaRes.count || 0,
        published: schemas.length || 0, // Toutes les pages sont publiées
      });
      setRecentPages([]);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Bienvenue 👋</h1>
            <p className="admin-text-muted admin-mt-sm">
              Gérez votre site en toute simplicité
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="admin-badge admin-badge-info">
              v{version.version}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-grid admin-grid-4 admin-mb-lg">
        <a href="/admin/pages" className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FileText size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{loading ? '–' : stats.pages}</div>
            <div className="admin-stat-label">Pages</div>
          </div>
        </a>

        <a href="/admin/articles" className="admin-stat-card">
          <div className="admin-stat-icon green">
            <Newspaper size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{loading ? '–' : stats.articles}</div>
            <div className="admin-stat-label">Articles</div>
          </div>
        </a>

        <a href="/admin/media" className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <Image size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{loading ? '–' : stats.media}</div>
            <div className="admin-stat-label">Médias</div>
          </div>
        </a>

        <div className="admin-stat-card" style={{ cursor: 'default' }}>
          <div className="admin-stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{loading ? '–' : stats.published}</div>
            <div className="admin-stat-label">Publiées</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Pages */}
      <div className="admin-grid admin-grid-2">
        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Actions rapides</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="/admin/articles/new" className="admin-btn admin-btn-primary" style={{ justifyContent: 'flex-start' }}>
                <Plus size={18} />
                Écrire un nouvel article
              </a>
              <a href="/admin/media" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Image size={18} />
                Gérer les médias
              </a>
            </div>
          </div>
        </div>

        {/* Recent Pages */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Pages récentes</h3>
            <a href="/admin/pages" className="admin-btn admin-btn-ghost admin-btn-sm">
              Voir tout <ArrowRight size={14} />
            </a>
          </div>
          <div className="admin-card-body">
            {loading ? (
              <div className="admin-loading">
                <div className="admin-spinner"></div>
              </div>
            ) : recentPages.length === 0 ? (
              <div className="admin-empty">
                <p className="admin-text-muted">Aucune page créée</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentPages.map((page) => (
                  <a
                    key={page.id}
                    href={`/admin/pages/${page.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--admin-bg)',
                      borderRadius: 'var(--admin-radius)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all var(--admin-transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--admin-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--admin-bg)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{page.title}</div>
                      <div className="admin-text-small admin-text-muted">/{page.slug}</div>
                    </div>
                    <span className={`admin-badge ${page.status === 'published' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                      {page.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
