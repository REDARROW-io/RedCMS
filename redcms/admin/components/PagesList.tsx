/**
 * PagesList - Liste des pages du site
 * Ouvre le VisualEditor pour éditer
 */

import { useState, useEffect } from 'react';
import { Edit2, FileText, Clock, Loader2, AlertTriangle, ExternalLink, Home, ShoppingBag, Mail, Info, Users, Settings, Newspaper, FolderOpen } from 'lucide-react';
import type { PageSchema } from '@redcms/core/schema';
import { VisualEditor } from './VisualEditor';

interface PageInfo extends PageSchema {
  hasSchema: boolean;
  pagePath: string;
  updated_at?: string;
}

export function PagesList() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageInfo | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const pagesRes = await fetch('/api/schemas');
      const pagesData: PageInfo[] = await pagesRes.json();
      
      const contentRes = await fetch('/api/content/all');
      const contentData = await contentRes.json();
      const contentMap = new Map(
        (contentData || []).map((p: any) => [p.page_slug, p.updated_at])
      );
      
      const combined = pagesData.map(page => ({
        ...page,
        updated_at: contentMap.get(page.slug),
      }));
      
      setPages(combined);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
    setLoading(false);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Jamais modifié';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageUrl = (slug: string) => {
    return slug === 'accueil' ? '/' : `/${slug}`;
  };

  const getPageIcon = (slug: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'accueil': <Home size={24} />,
      'home': <Home size={24} />,
      'produits': <ShoppingBag size={24} />,
      'products': <ShoppingBag size={24} />,
      'contact': <Mail size={24} />,
      'about': <Info size={24} />,
      'a-propos': <Info size={24} />,
      'equipe': <Users size={24} />,
      'team': <Users size={24} />,
      'blog': <Newspaper size={24} />,
      'articles': <Newspaper size={24} />,
      'services': <Settings size={24} />,
    };
    return iconMap[slug] || <FileText size={24} />;
  };

  // Récupérer tous les schemas (pages avec hasSchema: true)
  const allSchemas = pages.filter(p => p.hasSchema);

  // Éditeur visuel plein écran
  if (editingPage) {
    return (
      <VisualEditor
        schema={editingPage}
        allSchemas={allSchemas}
        onBack={() => {
          setEditingPage(null);
          loadPages();
        }}
        onPageChange={(newSchema) => {
          // Trouver le PageInfo correspondant
          const pageInfo = pages.find(p => p.slug === newSchema.slug);
          if (pageInfo) {
            setEditingPage(pageInfo);
          }
        }}
      />
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Pages</h1>
            <p className="admin-text-muted admin-mt-sm">
              Modifiez visuellement le contenu de vos pages
            </p>
          </div>
        </div>
      </div>

      <div className="pages-list">
        {loading ? (
          <div className="pages-list__loading">
            <Loader2 className="admin-spinner" size={32} />
            <p>Chargement...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="pages-list__empty">
            <FileText size={48} />
            <h3>Aucune page détectée</h3>
            <p>Créez des fichiers .astro dans src/pages/</p>
          </div>
        ) : (
          <div className="pages-list__grid">
            {pages.map((page) => (
              <div
                key={page.slug}
                className={`page-card ${!page.hasSchema ? 'page-card--warning' : ''}`}
                onClick={() => page.hasSchema && setEditingPage(page)}
              >
                <div className={`page-card__icon ${!page.hasSchema ? 'page-card__icon--warning' : ''}`}>
                  {page.hasSchema ? (
                    getPageIcon(page.slug)
                  ) : (
                    <AlertTriangle size={24} />
                  )}
                </div>

                <div className="page-card__content">
                  <div className="page-card__header">
                    <h3 className="page-card__title">{page.label}</h3>
                    <a
                      href={getPageUrl(page.slug)}
                      target="_blank"
                      className="page-card__link"
                      onClick={(e) => e.stopPropagation()}
                      title="Voir la page"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>

                  {page.hasSchema ? (
                    <>
                      {page.description && (
                        <p className="page-card__desc">{page.description}</p>
                      )}
                      <div className="page-card__meta">
                        <Clock size={14} />
                        <span>{formatDate(page.updated_at)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="page-card__warning">
                      <p>Schema manquant</p>
                      <code>src/schemas/{page.slug}.schema.ts</code>
                    </div>
                  )}
                </div>

                {page.hasSchema && (
                  <div className="page-card__action">
                    <Edit2 size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pages-list__loading,
        .pages-list__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          color: var(--admin-text-muted);
        }

        .pages-list__empty h3 {
          margin: 16px 0 8px;
          color: var(--admin-text);
        }

        .pages-list__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .page-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--admin-card-bg, #fff);
          border: 1px solid var(--admin-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-card:hover:not(.page-card--warning) {
          border-color: var(--admin-primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
          transform: translateY(-2px);
        }

        .page-card--warning {
          background: #fffbeb;
          border-color: #fbbf24;
          cursor: default;
        }

        .page-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: var(--admin-bg);
          border-radius: 12px;
          font-size: 1.75rem;
          flex-shrink: 0;
        }

        .page-card__icon--warning {
          background: #fbbf24;
          color: white;
        }

        .page-card__content {
          flex: 1;
          min-width: 0;
        }

        .page-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-card__title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--admin-text);
          margin: 0;
        }

        .page-card__link {
          color: var(--admin-text-muted);
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .page-card__link:hover {
          color: var(--admin-primary);
          background: var(--admin-bg);
        }

        .page-card__desc {
          font-size: 0.875rem;
          color: var(--admin-text-muted);
          margin: 4px 0 0;
        }

        .page-card__meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--admin-text-muted);
        }

        .page-card__warning {
          margin-top: 6px;
        }

        .page-card__warning p {
          font-size: 0.875rem;
          color: #b45309;
          margin: 0 0 4px;
          font-weight: 500;
        }

        .page-card__warning code {
          font-size: 0.75rem;
          color: #92400e;
          background: rgba(251, 191, 36, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .page-card__action {
          color: var(--admin-text-muted);
          transition: color 0.2s;
        }

        .page-card:hover:not(.page-card--warning) .page-card__action {
          color: var(--admin-primary);
        }
      `}</style>
    </div>
  );
}

export default PagesList;
