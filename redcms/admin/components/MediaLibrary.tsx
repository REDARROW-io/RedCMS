import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  X,
  Image as ImageIcon,
  Calendar,
  HardDrive,
  FileText,
  Grid,
  List,
} from 'lucide-react';
import { supabase } from '@redcms/core/supabase';

interface Media {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  created_at: string;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    setMedia(data || []);
    setLoading(false);
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);

    for (const file of Array.from(files)) {
      const filename = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filename);

      // Get image dimensions if it's an image
      let width, height;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve(null);
          };
        });
      }

      const { data: mediaData } = await supabase
        .from('media')
        .insert({
          filename: file.name,
          url: urlData.publicUrl,
          mimetype: file.type,
          size: file.size,
          width,
          height,
        })
        .select()
        .single();

      if (mediaData) {
        setMedia((prev) => [mediaData, ...prev]);
      }
    }

    setUploading(false);
  }

  async function deleteMedia(id: string) {
    if (!confirm('Supprimer ce média ?')) return;

    const item = media.find((m) => m.id === id);
    if (item) {
      const filename = item.url.split('/').pop();
      await supabase.storage.from('media').remove([filename!]);
      await supabase.from('media').delete().eq('id', id);
      setMedia(media.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  }

  async function updateAlt(id: string, alt: string) {
    await supabase.from('media').update({ alt }).eq('id', id);
    setMedia(media.map((m) => (m.id === id ? { ...m, alt } : m)));
    if (selected?.id === id) setSelected({ ...selected, alt });
  }

  const filteredMedia = media.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase())
  );

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Médiathèque</h1>
            <p className="admin-text-muted admin-mt-sm">
              {media.length} fichier{media.length > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={18} />
              {uploading ? 'Upload...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div className="admin-card admin-mb-lg" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`admin-btn admin-btn-icon ${viewMode === 'grid' ? 'admin-btn-secondary' : 'admin-btn-ghost'}`}
                onClick={() => setViewMode('grid')}
                title="Grille"
              >
                <Grid size={18} />
              </button>
              <button
                className={`admin-btn admin-btn-icon ${viewMode === 'list' ? 'admin-btn-secondary' : 'admin-btn-ghost'}`}
                onClick={() => setViewMode('list')}
                title="Liste"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <div
            className={`admin-dropzone admin-mb-lg ${dragOver ? 'active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="admin-dropzone-icon" />
            <p style={{ fontWeight: 500, marginBottom: 4 }}>
              Glissez-déposez vos fichiers ici
            </p>
            <p className="admin-text-small admin-text-muted">
              ou cliquez pour sélectionner
            </p>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="admin-card">
              <div className="admin-loading">
                <div className="admin-spinner"></div>
              </div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="admin-card">
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <ImageIcon size={32} />
                </div>
                <div className="admin-empty-title">Aucun média</div>
                <p className="admin-empty-text">
                  {search ? 'Aucun résultat' : 'Uploadez vos premiers fichiers'}
                </p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 16,
              }}
            >
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    background: 'var(--admin-bg-elevated)',
                    border: `2px solid ${selected?.id === item.id ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                    borderRadius: 'var(--admin-radius-lg)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all var(--admin-transition-fast)',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '1',
                      background: 'var(--admin-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.mimetype.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FileText size={32} style={{ color: 'var(--admin-text-muted)' }} />
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.filename}
                    </p>
                    <p className="admin-text-small admin-text-muted">{formatSize(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}></th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Taille</th>
                    <th>Date</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--admin-radius)',
                            overflow: 'hidden',
                            background: 'var(--admin-bg)',
                          }}
                        >
                          {item.mimetype.startsWith('image/') ? (
                            <img
                              src={item.url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <FileText size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{item.filename}</td>
                      <td className="admin-text-muted">{item.mimetype}</td>
                      <td className="admin-text-muted">{formatSize(item.size)}</td>
                      <td className="admin-text-muted">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-icon sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMedia(item.id);
                          }}
                          style={{ color: 'var(--admin-danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar Details */}
        {selected && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <div className="admin-card" style={{ position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Détails</h3>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-icon sm"
                  onClick={() => setSelected(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {selected.mimetype.startsWith('image/') && (
                <div
                  style={{
                    background: 'var(--admin-bg)',
                    borderRadius: 'var(--admin-radius)',
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  <img
                    src={selected.url}
                    alt={selected.alt || selected.filename}
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="admin-label">Nom du fichier</label>
                  <p style={{ fontSize: '0.875rem' }}>{selected.filename}</p>
                </div>

                {selected.width && selected.height && (
                  <div>
                    <label className="admin-label">Dimensions</label>
                    <p style={{ fontSize: '0.875rem' }}>
                      {selected.width} × {selected.height} px
                    </p>
                  </div>
                )}

                <div>
                  <label className="admin-label">Taille</label>
                  <p style={{ fontSize: '0.875rem' }}>{formatSize(selected.size)}</p>
                </div>

                <div>
                  <label className="admin-label">Date d'ajout</label>
                  <p style={{ fontSize: '0.875rem' }}>
                    {new Date(selected.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <label className="admin-label">Texte alternatif (SEO)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selected.alt || ''}
                    onChange={(e) => updateAlt(selected.id, e.target.value)}
                    placeholder="Description de l'image..."
                  />
                </div>

                <div>
                  <label className="admin-label">URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selected.url}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    style={{ fontSize: '0.75rem' }}
                  />
                </div>

                <button
                  className="admin-btn admin-btn-danger admin-mt"
                  onClick={() => deleteMedia(selected.id)}
                  style={{ width: '100%' }}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaLibrary;
