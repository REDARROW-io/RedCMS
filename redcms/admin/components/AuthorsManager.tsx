import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Mail, Linkedin, Twitter, Globe } from 'lucide-react';
import { supabase } from '@redcms/core/supabase';

interface Author {
  id: string;
  name: string;
  slug: string;
  email?: string;
  photo?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export function AuthorsManager() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [formData, setFormData] = useState<Partial<Author>>({});

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    const { data } = await supabase
      .from('authors')
      .select('*')
      .order('name');

    setAuthors(data || []);
    setLoading(false);
  }

  function openModal(author?: Author) {
    if (author) {
      setEditing(author);
      setFormData(author);
    } else {
      setEditing(null);
      setFormData({ name: '', slug: '', email: '', bio: '' });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setFormData({});
  }

  async function saveAuthor() {
    if (!formData.name) return;

    const slug = formData.slug || generateSlug(formData.name);
    const data = { ...formData, slug };

    if (editing) {
      await supabase.from('authors').update(data).eq('id', editing.id);
      setAuthors(authors.map((a) => (a.id === editing.id ? { ...a, ...data } : a)));
    } else {
      const { data: newAuthor } = await supabase
        .from('authors')
        .insert(data)
        .select()
        .single();

      if (newAuthor) {
        setAuthors([...authors, newAuthor]);
      }
    }

    closeModal();
  }

  async function deleteAuthor(id: string) {
    if (!confirm('Supprimer cet auteur ?')) return;
    await supabase.from('authors').delete().eq('id', id);
    setAuthors(authors.filter((a) => a.id !== id));
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Auteurs</h1>
            <p className="admin-text-muted admin-mt-sm">
              Gérez les profils des rédacteurs
            </p>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => openModal()}
          >
            <Plus size={18} />
            Nouvel auteur
          </button>
        </div>
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="admin-card">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
          </div>
        </div>
      ) : authors.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Users size={32} />
            </div>
            <div className="admin-empty-title">Aucun auteur</div>
            <p className="admin-empty-text">Ajoutez votre premier auteur</p>
            <button className="admin-btn admin-btn-primary" onClick={() => openModal()}>
              <Plus size={18} />
              Ajouter un auteur
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {authors.map((author) => (
            <div key={author.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  {author.photo ? (
                    <img
                      src={author.photo}
                      alt={author.name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1.25rem',
                      }}
                    >
                      {getInitials(author.name)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 4 }}>
                      {author.name}
                    </h3>
                    {author.email && (
                      <p className="admin-text-small admin-text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} />
                        {author.email}
                      </p>
                    )}
                  </div>
                </div>

                {author.bio && (
                  <p
                    className="admin-text-muted"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {author.bio}
                  </p>
                )}

                {(author.linkedin || author.twitter || author.website) && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {author.linkedin && (
                      <a
                        href={author.linkedin}
                        target="_blank"
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        title="LinkedIn"
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                    {author.twitter && (
                      <a
                        href={author.twitter}
                        target="_blank"
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        title="Twitter"
                      >
                        <Twitter size={16} />
                      </a>
                    )}
                    {author.website && (
                      <a
                        href={author.website}
                        target="_blank"
                        className="admin-btn admin-btn-ghost admin-btn-icon sm"
                        title="Site web"
                      >
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  borderTop: '1px solid var(--admin-border)',
                }}
              >
                <button
                  className="admin-btn admin-btn-ghost"
                  onClick={() => openModal(author)}
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    justifyContent: 'center',
                    borderRight: '1px solid var(--admin-border)',
                  }}
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
                <button
                  className="admin-btn admin-btn-ghost"
                  onClick={() => deleteAuthor(author.id)}
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    justifyContent: 'center',
                    color: 'var(--admin-danger)',
                  }}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editing ? 'Modifier l\'auteur' : 'Nouvel auteur'}
              </h3>
              <button className="admin-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="admin-label">Nom</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editing ? formData.slug : generateSlug(e.target.value),
                    })}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="admin-label">Slug</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="jean-dupont"
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean@example.com"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label className="admin-label">Photo (URL)</label>
                <input
                  type="url"
                  className="admin-input"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label className="admin-label">Biographie</label>
                <textarea
                  className="admin-input"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brève biographie..."
                  rows={3}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label className="admin-label">Réseaux sociaux</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Linkedin size={18} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                    <input
                      type="url"
                      className="admin-input"
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Twitter size={18} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                    <input
                      type="url"
                      className="admin-input"
                      value={formData.twitter || ''}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={18} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                    <input
                      type="url"
                      className="admin-input"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button className="admin-btn admin-btn-primary" onClick={saveAuthor}>
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorsManager;
