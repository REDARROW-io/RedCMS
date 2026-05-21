/**
 * UrlField - Champ URL avec sélection de pages internes
 */

import { useState, useEffect, useRef } from 'react';
import { Link, ExternalLink, ChevronDown } from 'lucide-react';

interface UrlFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface PageOption {
  slug: string;
  label: string;
  path: string;
}

export function UrlField({
  label,
  required,
  value = '',
  onChange,
  placeholder = 'https://...',
}: UrlFieldProps) {
  const [pages, setPages] = useState<PageOption[]>([]);
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    // Détecter le mode basé sur la valeur
    if (value && !value.startsWith('/') && !value.startsWith('#')) {
      setMode('manual');
    }
  }, []);

  const loadPages = async () => {
    try {
      const res = await fetch('/api/schemas');
      const data = await res.json();
      const pageOptions: PageOption[] = data
        .filter((p: any) => p.hasSchema)
        .map((p: any) => ({
          slug: p.slug,
          label: p.label,
          path: p.slug === 'accueil' ? '/' : `/${p.slug}`,
        }));
      setPages(pageOptions);
    } catch (err) {
      console.error('Error loading pages:', err);
    }
  };

  const openDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(true);
  };

  const isInternalLink = value?.startsWith('/') || value?.startsWith('#');
  const selectedPage = pages.find(p => p.path === value);

  return (
    <div className="admin-form-group url-field">
      <label className="admin-label">
        {label}
        {required && <span className="required-star"> *</span>}
      </label>

      {/* Toggle mode */}
      <div className="url-field__tabs">
        <button
          type="button"
          className={`url-field__tab ${mode === 'select' ? 'active' : ''}`}
          onClick={() => setMode('select')}
        >
          <Link size={14} />
          Page interne
        </button>
        <button
          type="button"
          className={`url-field__tab ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => setMode('manual')}
        >
          <ExternalLink size={14} />
          URL externe
        </button>
      </div>

      {mode === 'select' ? (
        <div className="url-field__select-wrapper">
          <button
            type="button"
            ref={btnRef}
            className="url-field__select-btn"
            onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
          >
            <span className="url-field__select-value">
              {selectedPage ? (
                <>
                  <span className="url-field__page-label">{selectedPage.label}</span>
                  <span className="url-field__page-path">{selectedPage.path}</span>
                </>
              ) : value ? (
                <span className="url-field__page-path">{value}</span>
              ) : (
                <span className="url-field__placeholder">Sélectionner une page...</span>
              )}
            </span>
            <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
          </button>

          {isOpen && (
            <div className="url-field__dropdown" style={dropdownStyle}>
              <div
                className={`url-field__option ${!value ? 'selected' : ''}`}
                onClick={() => { onChange(''); setIsOpen(false); }}
              >
                <span className="url-field__option-label">Aucun lien</span>
              </div>
              
              <div className="url-field__option-group">Pages</div>
              {pages.map((page) => (
                <div
                  key={page.slug}
                  className={`url-field__option ${value === page.path ? 'selected' : ''}`}
                  onClick={() => { onChange(page.path); setIsOpen(false); }}
                >
                  <span className="url-field__option-label">{page.label}</span>
                  <span className="url-field__option-path">{page.path}</span>
                </div>
              ))}

              <div className="url-field__option-group">Ancres</div>
              <div
                className={`url-field__option ${value === '#services' ? 'selected' : ''}`}
                onClick={() => { onChange('#services'); setIsOpen(false); }}
              >
                <span className="url-field__option-label">Section Services</span>
                <span className="url-field__option-path">#services</span>
              </div>
              <div
                className={`url-field__option ${value === '#contact' ? 'selected' : ''}`}
                onClick={() => { onChange('#contact'); setIsOpen(false); }}
              >
                <span className="url-field__option-label">Section Contact</span>
                <span className="url-field__option-path">#contact</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      <style>{`
        .url-field__tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .url-field__tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 500;
          background: transparent;
          border: 1px solid var(--admin-border, rgba(255,255,255,0.1));
          border-radius: 6px;
          color: var(--admin-text-muted, #64748b);
          cursor: pointer;
          transition: all 0.2s;
        }

        .url-field__tab:hover {
          background: var(--admin-bg-hover, rgba(255,255,255,0.05));
          color: var(--admin-text, #fff);
        }

        .url-field__tab.active {
          background: var(--admin-primary, #6366f1);
          border-color: var(--admin-primary, #6366f1);
          color: #fff;
        }

        .url-field__select-wrapper {
          position: relative;
        }

        .url-field__select-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          background: var(--admin-bg, rgba(255,255,255,0.05));
          border: 1px solid var(--admin-border, rgba(255,255,255,0.1));
          border-radius: 8px;
          color: var(--admin-text, #fff);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .url-field__select-btn:hover {
          border-color: var(--admin-border-hover, rgba(255,255,255,0.2));
        }

        .url-field__select-btn svg.rotated {
          transform: rotate(180deg);
        }

        .url-field__select-value {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .url-field__page-label {
          font-weight: 500;
        }

        .url-field__page-path {
          font-size: 0.75rem;
          color: var(--admin-text-muted, #64748b);
          font-family: monospace;
        }

        .url-field__placeholder {
          color: var(--admin-text-muted, #64748b);
        }

        .url-field__dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          z-index: 100;
          max-height: 280px;
          overflow-y: auto;
        }

        .url-field__option-group {
          padding: 8px 12px 4px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .url-field__option-group:first-child {
          border-top: none;
        }

        .url-field__option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .url-field__option:hover {
          background: rgba(99,102,241,0.15);
        }

        .url-field__option.selected {
          background: rgba(99,102,241,0.2);
        }

        .url-field__option-label {
          font-size: 0.875rem;
          color: #e2e8f0;
        }

        .url-field__option-path {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
        }

        .required-star {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

export default UrlField;
