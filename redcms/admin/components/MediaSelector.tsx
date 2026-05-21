import { useState } from 'react';
import { supabase } from '@redcms/core/supabase';
import type { Media } from '@redcms/core/types';
import { Upload, Image as ImageIcon, X, FolderOpen } from 'lucide-react';

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onClose: () => void;
}

export function MediaSelector({ value, onChange, onClose }: MediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'library' | 'upload'>('library');

  useState(() => {
    loadMedia();
  });

  async function loadMedia() {
    setLoading(true);
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setMedia(data.map(m => ({
        id: m.id,
        filename: m.filename,
        url: m.url,
        mimeType: m.mime_type,
        size: m.size,
        width: m.width ?? undefined,
        height: m.height ?? undefined,
        alt: m.alt ?? undefined,
        createdAt: m.created_at,
      })));
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    let width: number | undefined;
    let height: number | undefined;

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

    await supabase.from('media').insert({
      filename: file.name,
      url: urlData.publicUrl,
      mime_type: file.type,
      size: file.size,
      width,
      height,
    });

    onChange(urlData.publicUrl);
    setUploading(false);
    onClose();
  }

  function selectMedia(m: Media) {
    onChange(m.url);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          width: '90%',
          maxWidth: 800,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--admin-border)',
          }}
        >
          <h3 style={{ margin: 0 }}>Sélectionner un média</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)' }}>
          <button
            onClick={() => setTab('library')}
            style={{
              flex: 1,
              padding: '12px',
              background: tab === 'library' ? 'var(--admin-primary-light)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'library' ? '2px solid var(--admin-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <FolderOpen size={18} /> Bibliothèque
          </button>
          <button
            onClick={() => setTab('upload')}
            style={{
              flex: 1,
              padding: '12px',
              background: tab === 'upload' ? 'var(--admin-primary-light)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'upload' ? '2px solid var(--admin-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Upload size={18} /> Uploader
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {tab === 'library' ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
            ) : media.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)' }}>
                <ImageIcon size={48} style={{ marginBottom: 10 }} />
                <p>Aucun média. Uploadez votre premier fichier.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 12,
                }}
              >
                {media.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => selectMedia(m)}
                    style={{
                      border: `2px solid ${value === m.url ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '1',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {m.mimeType.startsWith('image/') ? (
                        <img
                          src={m.url}
                          alt={m.alt || m.filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <ImageIcon size={32} style={{ color: 'var(--admin-text-muted)' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              style={{
                border: '2px dashed var(--admin-border)',
                borderRadius: 8,
                padding: 60,
                textAlign: 'center',
              }}
            >
              {uploading ? (
                <div>Upload en cours...</div>
              ) : (
                <>
                  <Upload size={48} style={{ color: 'var(--admin-text-muted)', marginBottom: 16 }} />
                  <p style={{ marginBottom: 16 }}>Glissez un fichier ou cliquez pour sélectionner</p>
                  <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer' }}>
                    Choisir un fichier
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaSelector;
