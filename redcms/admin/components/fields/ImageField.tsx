import { useState } from 'react';
import { Image as ImageIcon, X, FolderOpen } from 'lucide-react';
import { MediaSelector } from '../MediaSelector';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (value: unknown) => void;
  description?: string;
  required?: boolean;
}

export function ImageField({ label, value, onChange, description, required }: ImageFieldProps) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div style={{ marginBottom: 16 }}>
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: 8 }}>
          {description}
        </p>
      )}

      {value ? (
        <div
          style={{
            position: 'relative',
            border: '1px solid var(--admin-border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              className="admin-btn admin-btn-secondary"
              style={{ padding: '6px 10px' }}
            >
              <FolderOpen size={14} /> Changer
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="admin-btn"
              style={{ 
                padding: '6px 8px',
                background: 'var(--admin-danger)',
                color: 'white',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          style={{
            width: '100%',
            padding: 30,
            border: '2px dashed var(--admin-border)',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            color: 'var(--admin-text-muted)',
            transition: 'border-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--admin-primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--admin-border)'}
        >
          <ImageIcon size={32} />
          <span>Cliquez pour sélectionner une image</span>
        </button>
      )}

      {showSelector && (
        <MediaSelector
          value={value}
          onChange={(url) => onChange(url)}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}

export default ImageField;
