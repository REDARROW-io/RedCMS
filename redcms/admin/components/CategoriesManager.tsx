import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, FolderOpen } from 'lucide-react';
import { supabase } from '@redcms/core/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Category>>({});
  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState<Partial<Category>>({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    setCategories(data || []);
    setLoading(false);
  }

  async function createCategory() {
    if (!newData.name) return;

    const slug = newData.slug || generateSlug(newData.name);
    const { data } = await supabase
      .from('categories')
      .insert({ ...newData, slug })
      .select()
      .single();

    if (data) {
      setCategories([...categories, data]);
      setNewData({ name: '', slug: '', description: '' });
      setShowNew(false);
    }
  }

  async function updateCategory(id: string) {
    await supabase.from('categories').update(editData).eq('id', id);
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...editData } : c)));
    setEditing(null);
    setEditData({});
  }

  async function deleteCategory(id: string) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter((c) => c.id !== id));
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function startEdit(category: Category) {
    setEditing(category.id);
    setEditData({ name: category.name, slug: category.slug, description: category.description });
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Catégories</h1>
            <p className="admin-text-muted admin-mt-sm">
              Organisez vos articles par thème
            </p>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowNew(true)}
          >
            <Plus size={18} />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* New Category Form */}
      {showNew && (
        <div className="admin-card admin-mb-lg">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Nouvelle catégorie</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="admin-label">Nom</label>
              <input
                type="text"
                className="admin-input"
                value={newData.name}
                onChange={(e) => setNewData({ ...newData, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Ex: Actualités"
              />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input
                type="text"
                className="admin-input"
                value={newData.slug}
                onChange={(e) => setNewData({ ...newData, slug: e.target.value })}
                placeholder="Ex: actualites"
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="admin-label">Description <span className="admin-label-optional">(optionnel)</span></label>
            <textarea
              className="admin-input"
              value={newData.description || ''}
              onChange={(e) => setNewData({ ...newData, description: e.target.value })}
              placeholder="Brève description..."
              rows={2}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="admin-btn admin-btn-ghost" onClick={() => setShowNew(false)}>
              Annuler
            </button>
            <button className="admin-btn admin-btn-primary" onClick={createCategory}>
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="admin-card">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <FolderOpen size={32} />
            </div>
            <div className="admin-empty-title">Aucune catégorie</div>
            <p className="admin-empty-text">Créez votre première catégorie</p>
            <button className="admin-btn admin-btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={18} />
              Nouvelle catégorie
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th>Description</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    {editing === category.id ? (
                      <input
                        type="text"
                        className="admin-input"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{category.name}</span>
                    )}
                  </td>
                  <td>
                    {editing === category.id ? (
                      <input
                        type="text"
                        className="admin-input"
                        value={editData.slug || ''}
                        onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                      />
                    ) : (
                      <span className="admin-text-muted">/{category.slug}</span>
                    )}
                  </td>
                  <td>
                    {editing === category.id ? (
                      <input
                        type="text"
                        className="admin-input"
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Description..."
                      />
                    ) : (
                      <span className="admin-text-muted">{category.description || '—'}</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {editing === category.id ? (
                        <>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon sm"
                            onClick={() => updateCategory(category.id)}
                            style={{ color: 'var(--admin-success)' }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon sm"
                            onClick={() => { setEditing(null); setEditData({}); }}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon sm"
                            onClick={() => startEdit(category)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-icon sm"
                            onClick={() => deleteCategory(category.id)}
                            style={{ color: 'var(--admin-danger)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
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

export default CategoriesManager;
