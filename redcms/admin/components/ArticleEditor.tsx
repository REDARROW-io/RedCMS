import { useState, useEffect } from 'react';
import { supabase } from '@redcms/core/supabase';
import type { Article, Category, Author } from '@redcms/core/types';
import { Save, ArrowLeft, Eye, Calendar, Tag } from 'lucide-react';
import { ImageField } from './fields/ImageField';
import { TextField } from './fields/TextField';

interface ArticleEditorProps {
  articleId?: string;
}

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  authorId: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const [article, setArticle] = useState<ArticleData>({
    title: 'Nouvel article',
    slug: 'nouvel-article',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    authorId: '',
    tags: [],
    status: 'draft',
    publishedAt: '',
    seo: {},
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadCategoriesAndAuthors();
    if (articleId) {
      loadArticle(articleId);
    }
  }, [articleId]);

  async function loadCategoriesAndAuthors() {
    const [catRes, authRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('authors').select('*').order('name'),
    ]);

    if (catRes.data) {
      setCategories(catRes.data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
      })));
    }

    if (authRes.data) {
      setAuthors(authRes.data.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        bio: a.bio ?? undefined,
        avatar: a.avatar ?? undefined,
        email: a.email ?? undefined,
        socials: a.socials as Author['socials'],
      })));
    }
  }

  async function loadArticle(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setArticle({
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content || '',
        excerpt: data.excerpt || '',
        featuredImage: data.featured_image || '',
        categoryId: data.category_id || '',
        authorId: data.author_id || '',
        tags: data.tags || [],
        status: data.status,
        publishedAt: data.published_at || '',
        seo: (data.seo as ArticleData['seo']) || {},
      });
    }
  }

  function updateField<K extends keyof ArticleData>(field: K, value: ArticleData[K]) {
    setArticle((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function addTag() {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
      updateField('tags', [...article.tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    updateField('tags', article.tags.filter((t) => t !== tag));
  }

  async function saveArticle() {
    setSaving(true);

    const articleData = {
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featured_image: article.featuredImage,
      category_id: article.categoryId || null,
      author_id: article.authorId || null,
      tags: article.tags,
      status: article.status,
      published_at: article.status === 'published' ? article.publishedAt || new Date().toISOString() : null,
      seo: article.seo,
    };

    if (article.id) {
      await supabase.from('articles').update(articleData).eq('id', article.id);
    } else {
      const { data } = await supabase.from('articles').insert(articleData).select().single();
      if (data) {
        setArticle((prev) => ({ ...prev, id: data.id }));
        window.history.replaceState(null, '', `/admin/articles/${data.id}`);
      }
    }

    setHasChanges(false);
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/admin/articles" style={{ color: 'var(--admin-text-muted)' }}>
            <ArrowLeft size={20} />
          </a>
          <h1 className="admin-title" style={{ margin: 0 }}>
            {article.id ? 'Modifier l\'article' : 'Nouvel article'}
          </h1>
          {hasChanges && (
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-warning)' }}>
              Non sauvegardé
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-secondary">
            <Eye size={16} /> Prévisualiser
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={saveArticle}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Titre</label>
              <input
                type="text"
                className="admin-input"
                value={article.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                  if (!article.id) {
                    updateField('slug', generateSlug(e.target.value));
                  }
                }}
                style={{ width: '100%', fontSize: '1.25rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Slug</label>
              <input
                type="text"
                className="admin-input"
                value={article.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Extrait</label>
              <textarea
                className="admin-input"
                value={article.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
                placeholder="Résumé court de l'article..."
              />
            </div>

            <TextField
              label="Contenu"
              value={article.content}
              onChange={(val) => updateField('content', val as string)}
              richtext={true}
            />
          </div>

          {/* SEO */}
          <div className="admin-card">
            <h3 style={{ marginTop: 0 }}>SEO</h3>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Meta title</label>
              <input
                type="text"
                className="admin-input"
                value={article.seo.metaTitle || ''}
                onChange={(e) =>
                  updateField('seo', { ...article.seo, metaTitle: e.target.value })
                }
                style={{ width: '100%' }}
                placeholder={article.title}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Meta description</label>
              <textarea
                className="admin-input"
                value={article.seo.metaDescription || ''}
                onChange={(e) =>
                  updateField('seo', { ...article.seo, metaDescription: e.target.value })
                }
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
                placeholder={article.excerpt}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 280 }}>
          {/* Status */}
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>Publication</h4>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Statut</label>
              <select
                className="admin-input"
                value={article.status}
                onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
                style={{ width: '100%' }}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>

            {article.status === 'published' && (
              <div style={{ marginBottom: 16 }}>
                <label className="admin-label">
                  <Calendar size={14} style={{ marginRight: 4 }} />
                  Date de publication
                </label>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={article.publishedAt?.slice(0, 16) || ''}
                  onChange={(e) => updateField('publishedAt', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          {/* Image */}
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>Image mise en avant</h4>
            <ImageField
              label=""
              value={article.featuredImage}
              onChange={(val) => updateField('featuredImage', val as string)}
            />
          </div>

          {/* Category & Author */}
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Catégorie</label>
              <select
                className="admin-input"
                value={article.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Aucune --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-label">Auteur</label>
              <select
                className="admin-input"
                value={article.authorId}
                onChange={(e) => updateField('authorId', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Aucun --</option>
                {authors.map((auth) => (
                  <option key={auth.id} value={auth.id}>
                    {auth.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="admin-card">
            <h4 style={{ marginTop: 0 }}>
              <Tag size={14} style={{ marginRight: 4 }} />
              Tags
            </h4>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                className="admin-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Ajouter un tag..."
                style={{ flex: 1 }}
              />
              <button
                className="admin-btn admin-btn-secondary"
                onClick={addTag}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'var(--admin-primary-light)',
                    color: 'var(--admin-primary)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleEditor;
