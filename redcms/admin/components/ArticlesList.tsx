import { useState, useEffect } from 'react';
import { Plus, Edit2, Copy, Trash2, ExternalLink, Search, Newspaper } from 'lucide-react';
import { supabase } from '@redcms/core/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  updated_at: string;
  category?: { name: string };
  author?: { name: string };
}

export function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*, category:categories(name), author:authors(name)')
      .order('updated_at', { ascending: false });

    setArticles(data || []);
    setLoading(false);
  }

  async function deleteArticle(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    await supabase.from('articles').delete().eq('id', id);
    setArticles(articles.filter((a) => a.id !== id));
  }

  async function duplicateArticle(article: Article) {
    const { data } = await supabase
      .from('articles')
      .insert({
        title: `${article.title} (copie)`,
        slug: `${article.slug}-copie`,
        status: 'draft',
      })
      .select()
      .single();

    if (data) {
      setArticles([data, ...articles]);
    }
  }

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Articles</h1>
            <p className="admin-text-muted admin-mt-sm">
              {articles.length} article{articles.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <a href="/admin/articles/new" className="admin-btn admin-btn-primary">
            <Plus size={18} />
            Nouvel article
          </a>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card admin-mb-lg">
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
            }}
          />
          <input
            type="text"
            className="admin-input"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-card">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Newspaper size={32} />
            </div>
            <div className="admin-empty-title">Aucun article trouvé</div>
            <p className="admin-empty-text">
              {search ? 'Essayez une autre recherche' : 'Rédigez votre premier article pour commencer'}
            </p>
            {!search && (
              <a href="/admin/articles/new" className="admin-btn admin-btn-primary">
                <Plus size={18} />
                Écrire un article
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Auteur</th>
                <th>Statut</th>
                <th>Modifié le</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <a
                      href={`/admin/articles/${article.id}`}
                      style={{
                        color: 'var(--admin-text)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {article.title}
                    </a>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">
                      {article.category?.name || '—'}
                    </span>
                  </td>
                  <td className="admin-text-muted">
                    {article.author?.name || '—'}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        article.status === 'published'
                          ? 'admin-badge-success'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="admin-text-muted">
                    {new Date(article.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <a
                        href={`/admin/articles/${article.id}`}
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </a>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        onClick={() => duplicateArticle(article)}
                        title="Dupliquer"
                      >
                        <Copy size={16} />
                      </button>
                      {article.status === 'published' && (
                        <a
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="admin-btn admin-btn-ghost admin-btn-icon sm"
                          title="Voir"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        onClick={() => deleteArticle(article.id)}
                        title="Supprimer"
                        style={{ color: 'var(--admin-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ArticlesList;
