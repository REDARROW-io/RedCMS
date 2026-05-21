/**
 * VisualEditor - Éditeur visuel in-place
 * Détecte les changements de page dans l'iframe
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Loader2, Monitor, Tablet, Smartphone, Eye, Edit3, X, RefreshCw, ExternalLink, Type, AlignLeft, Image, Link2, List, Hash, ToggleLeft, Palette, Mail } from 'lucide-react';
import type { PageSchema, FieldDefinition, SEOContent } from '@redcms/core/schema';
import { FieldRenderer } from './fields/FieldRenderer';

interface VisualEditorProps {
  schema: PageSchema;
  allSchemas: PageSchema[];
  onBack: () => void;
  onPageChange: (schema: PageSchema) => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

// Script à injecter dans l'iframe
const getEditModeScript = (currentSlug: string) => `
(function() {
  if (window.__REDCMS_EDIT_MODE__) return;
  window.__REDCMS_EDIT_MODE__ = true;
  
  console.log('[RedCMS] Injection du mode édition...');
  
  // Détecter la page actuelle
  var path = window.location.pathname;
  var pageSlug = path === '/' ? 'accueil' : path.replace(/^\\//, '').replace(/\\/$/, '');
  
  // Informer le parent de la page actuelle
  window.parent.postMessage({
    type: 'PAGE_LOADED',
    slug: pageSlug,
    path: path
  }, '*');
  
  // Intercepter les clics sur les liens pour détecter la navigation
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link && link.href) {
      var url = new URL(link.href);
      if (url.origin === window.location.origin) {
        console.log('[RedCMS] Navigation vers:', url.pathname);
      }
    }
  });
  
  // Mapping des sélecteurs CSS vers les noms de champs par page
  var pageMappings = {
    'accueil': {
      '.hero': { field: 'hero_image', label: 'Image de fond Hero' },
      '.hero__badge': { field: 'hero_surtitre', label: 'Surtitre Hero' },
      '.hero__title': { field: 'hero_titre', label: 'Titre Hero' },
      '.hero__description': { field: 'hero_description', label: 'Description Hero' },
      '.hero__actions .btn-primary': { field: 'hero_bouton_texte', label: 'Bouton Hero' },
      '.features': { field: 'features', label: 'Fonctionnalités' },
      '.features .section-title': { field: 'features', label: 'Fonctionnalités' },
      '.features__grid': { field: 'features', label: 'Fonctionnalités' },
      '.feature-card': { field: 'features', label: 'Fonctionnalité' },
      '.services': { field: 'services', label: 'Services' },
      '.services__grid': { field: 'services', label: 'Services' },
      '.service-card': { field: 'services', label: 'Service' },
      '.services .section-title': { field: 'services_titre', label: 'Titre Services' },
      '.testimonials': { field: 'temoignages', label: 'Témoignages' },
      '.testimonials__grid': { field: 'temoignages', label: 'Témoignages' },
      '.testimonial-card': { field: 'temoignages', label: 'Témoignage' },
      '.testimonials .section-title': { field: 'temoignages_titre', label: 'Titre Témoignages' }
    },
    'produits': {
      '.products-hero__title, h1': { field: 'titre', label: 'Titre' },
      '.products-hero__description': { field: 'description', label: 'Description' },
      '.products-grid': { field: 'produits', label: 'Produits' },
      '.product-card': { field: 'produits', label: 'Produit' },
      '.cta-section': { field: 'cta_titre', label: 'Section CTA' }
    }
  };
  
  // Utiliser le mapping de la page courante, ou un mapping générique
  var fieldMappings = pageMappings[pageSlug] || {};
  
  // Créer les styles
  var style = document.createElement('style');
  style.textContent = \`
    .cms-editable {
      position: relative;
      cursor: pointer !important;
      transition: outline 0.15s ease, box-shadow 0.15s ease;
    }
    .cms-editable:hover {
      outline: 2px dashed #6366f1 !important;
      outline-offset: 2px;
      z-index: 1000;
    }
    .cms-editable.cms-active {
      outline: 2px solid #6366f1 !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15) !important;
    }
  \`;
  document.head.appendChild(style);
  
  // Appliquer les classes éditables
  Object.keys(fieldMappings).forEach(function(selector) {
    var config = fieldMappings[selector];
    // Supporter les sélecteurs multiples séparés par virgule
    var selectors = selector.split(',').map(function(s) { return s.trim(); });
    
    selectors.forEach(function(sel) {
      var elements = document.querySelectorAll(sel);
      elements.forEach(function(el, index) {
        // Éviter les doublons
        if (el.classList.contains('cms-editable')) return;
        
        el.classList.add('cms-editable');
        el.setAttribute('data-cms-field', config.field);
        el.setAttribute('data-cms-index', index.toString());
        
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          document.querySelectorAll('.cms-active').forEach(function(other) {
            other.classList.remove('cms-active');
          });
          el.classList.add('cms-active');
          
          // Envoyer l'index si c'est une card individuelle
          var isCard = sel.includes('-card') || el.classList.contains('feature-card') || 
                       el.classList.contains('service-card') || el.classList.contains('testimonial-card') ||
                       el.classList.contains('product-card');
          
          window.parent.postMessage({
            type: 'FIELD_CLICK',
            fieldName: config.field,
            arrayIndex: isCard ? index : null
          }, '*');
          
          console.log('[RedCMS] Click:', config.field, isCard ? 'index:' + index : '');
        });
      });
    });
  });
  
  // Écouter les messages du parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'HIGHLIGHT_FIELD') {
      document.querySelectorAll('.cms-active').forEach(function(el) {
        el.classList.remove('cms-active');
      });
      var target = document.querySelector('[data-cms-field="' + e.data.fieldName + '"]');
      if (target) {
        target.classList.add('cms-active');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
  
  console.log('[RedCMS] Mode édition activé pour:', pageSlug, '- Éléments:', document.querySelectorAll('.cms-editable').length);
})();
`;

export function VisualEditor({ schema: initialSchema, allSchemas, onBack, onPageChange }: VisualEditorProps) {
  const [schema, setSchema] = useState(initialSchema);
  const [content, setContent] = useState<Record<string, any>>({});
  const [seo, setSeo] = useState<SEOContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [editingArrayIndex, setEditingArrayIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Charger le contenu quand le schema change
  useEffect(() => {
    loadContent();
    setEditingField(null);
  }, [schema.slug]);

  // Écouter les messages de l'iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FIELD_CLICK') {
        const fieldName = event.data.fieldName;
        const arrayIndex = event.data.arrayIndex;
        const field = schema.fields.find(f => f.name === fieldName);
        if (field) {
          setEditingField(field);
          setEditingArrayIndex(typeof arrayIndex === 'number' ? arrayIndex : null);
        }
      }
      
      if (event.data?.type === 'PAGE_LOADED') {
        const newSlug = event.data.slug;
        const newPath = event.data.path;
        console.log('[VisualEditor] Page chargée:', newSlug);
        
        setCurrentPath(newPath);
        
        // Si c'est une page différente, changer le schema
        if (newSlug !== schema.slug) {
          const newSchema = allSchemas.find(s => s.slug === newSlug);
          if (newSchema) {
            // Sauvegarder les changements en cours si nécessaire
            if (hasChanges) {
              if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder avant de changer de page ?')) {
                handleSave().then(() => {
                  setSchema(newSchema);
                  onPageChange(newSchema);
                });
                return;
              }
            }
            setHasChanges(false);
            setSchema(newSchema);
            onPageChange(newSchema);
          } else {
            console.log('[VisualEditor] Pas de schema pour:', newSlug);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [schema, allSchemas, hasChanges, onPageChange]);

  // Envoyer highlight à l'iframe quand on sélectionne un champ
  useEffect(() => {
    if (iframeRef.current?.contentWindow && editingField && iframeReady) {
      iframeRef.current.contentWindow.postMessage({
        type: 'HIGHLIGHT_FIELD',
        fieldName: editingField.name
      }, '*');
    }
  }, [editingField, iframeReady]);

  // Injecter le script d'édition dans l'iframe
  const injectEditMode = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
    
    try {
      const script = iframe.contentDocument.createElement('script');
      script.textContent = getEditModeScript(schema.slug);
      iframe.contentDocument.body.appendChild(script);
      setIframeReady(true);
      console.log('[VisualEditor] Script injecté dans l\'iframe');
    } catch (err) {
      console.error('[VisualEditor] Erreur injection:', err);
    }
  };

  const handleIframeLoad = () => {
    setIframeReady(false);
    // Petit délai pour s'assurer que le DOM est prêt
    setTimeout(injectEditMode, 100);
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      const defaults = getDefaultValues(schema.fields);
      const response = await fetch(`/api/content/${schema.slug}`);
      
      if (response.ok) {
        const data = await response.json();
        const dbContent = data.content || {};
        
        // Fusionner: defaults d'abord, puis BDD (sauf si vide)
        const merged: Record<string, any> = {};
        
        for (const field of schema.fields) {
          const dbValue = dbContent[field.name];
          const defaultValue = defaults[field.name];
          
          // Utiliser la valeur BDD seulement si elle existe et n'est pas vide
          if (dbValue !== undefined && dbValue !== null && dbValue !== '') {
            if (Array.isArray(dbValue) && dbValue.length === 0 && defaultValue) {
              // Tableau vide en BDD mais default existe -> utiliser default
              merged[field.name] = defaultValue;
            } else {
              merged[field.name] = dbValue;
            }
          } else if (defaultValue !== undefined) {
            merged[field.name] = defaultValue;
          }
        }
        
        console.log('[VisualEditor] Content merged:', merged);
        setContent(merged);
        setSeo(data.seo || {});
      } else {
        console.log('[VisualEditor] No content, using defaults');
        setContent(defaults);
        setSeo({});
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent(getDefaultValues(schema.fields));
    }
    setLoading(false);
  };

  const getDefaultValues = (fields: FieldDefinition[]): Record<string, any> => {
    const defaults: Record<string, any> = {};
    for (const field of fields) {
      if (field.default !== undefined) {
        defaults[field.name] = field.default;
      }
    }
    return defaults;
  };

  const handleContentChange = (name: string, value: any) => {
    setContent(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/content/${schema.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, seo }),
      });
      setHasChanges(false);
      refreshPreview();
    } catch (error) {
      console.error('Error saving:', error);
    }
    setSaving(false);
  };

  const refreshPreview = () => {
    setIframeReady(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const getIframeWidth = () => {
    switch (deviceMode) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  const pageUrl = schema.slug === 'accueil' ? '/' : `/${schema.slug}`;

  // Grouper les champs par catégorie
  const getFieldGroups = () => {
    const groups: { [key: string]: FieldDefinition[] } = {
      'Hero': [],
      'Contenu': [],
      'Autres': []
    };
    
    for (const field of schema.fields) {
      if (field.name.startsWith('hero_')) {
        groups['Hero'].push(field);
      } else if (['services', 'features', 'temoignages', 'produits'].some(k => field.name.includes(k))) {
        groups['Contenu'].push(field);
      } else {
        groups['Autres'].push(field);
      }
    }
    
    return groups;
  };

  if (loading) {
    return (
      <div className="visual-editor__loading">
        <Loader2 className="admin-spinner" size={32} />
        <p>Chargement de l'éditeur...</p>
      </div>
    );
  }

  const fieldGroups = getFieldGroups();

  return (
    <div className="visual-editor">
      {/* Toolbar */}
      <div className="visual-editor__toolbar">
        <div className="visual-editor__toolbar-left">
          <button onClick={onBack} className="ve-btn ve-btn-ghost">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <div className="visual-editor__title">
            <span>{schema.label}</span>
            <span className="visual-editor__path">{currentPath || pageUrl}</span>
          </div>
        </div>

        <div className="visual-editor__toolbar-center">
          <div className="ve-device-switcher">
            <button 
              className={`ve-device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceMode('desktop')}
              title="Desktop"
            >
              <Monitor size={18} />
            </button>
            <button 
              className={`ve-device-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceMode('tablet')}
              title="Tablet"
            >
              <Tablet size={18} />
            </button>
            <button 
              className={`ve-device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceMode('mobile')}
              title="Mobile"
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>

        <div className="visual-editor__toolbar-right">
          <a 
            href={pageUrl} 
            target="_blank" 
            className="ve-btn ve-btn-ghost"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={18} />
          </a>
          <button 
            className="ve-btn ve-btn-ghost"
            onClick={refreshPreview}
            title="Rafraîchir"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className="ve-btn ve-btn-save"
          >
            {saving ? <Loader2 className="admin-spinner" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="visual-editor__main">
        {/* Preview */}
        <div className={`visual-editor__preview ${previewMode ? 'preview-mode' : ''}`}>
          <div 
            className="visual-editor__iframe-container"
            style={{ width: getIframeWidth() }}
          >
            <iframe
              ref={iframeRef}
              src={pageUrl}
              className="visual-editor__iframe"
              title="Page preview"
              onLoad={handleIframeLoad}
            />
          </div>
          
          {!previewMode && (
            <div className="visual-editor__hint">
              💡 Cliquez sur un élément pour le modifier • Naviguez dans le site, l'éditeur suivra
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!previewMode && (
          <div className="visual-editor__sidebar">
            {editingField ? (
              <>
                <div className="ve-sidebar__header">
                  <div className="ve-sidebar__header-info">
                    <span className="ve-sidebar__field-badge">{editingField.type}</span>
                    <h3>{editingField.label}</h3>
                  </div>
                  <button 
                    className="ve-sidebar__close"
                    onClick={() => setEditingField(null)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="ve-sidebar__content">
                  <FieldRenderer
                    field={editingField}
                    value={content[editingField.name]}
                    onChange={(value) => handleContentChange(editingField.name, value)}
                    arrayIndex={editingArrayIndex}
                  />
                  {/* Si c'est un champ bouton_texte, afficher aussi le champ lien */}
                  {editingField.name.includes('bouton_texte') && (() => {
                    const linkFieldName = editingField.name.replace('_texte', '_lien');
                    const linkField = schema.fields.find(f => f.name === linkFieldName);
                    if (linkField) {
                      return (
                        <div style={{ marginTop: '20px' }}>
                          <FieldRenderer
                            field={linkField}
                            value={content[linkField.name]}
                            onChange={(value) => handleContentChange(linkField.name, value)}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </>
            ) : (
              <div className="ve-sidebar__list">
                <div className="ve-sidebar__list-header">
                  <h3>Éléments de {schema.label}</h3>
                  <p>Cliquez sur la page ou sélectionnez ci-dessous</p>
                </div>
                
                {Object.entries(fieldGroups).map(([groupName, fields]) => 
                  fields.length > 0 && (
                    <div key={groupName} className="ve-field-group">
                      <div className="ve-field-group__title">{groupName}</div>
                      {fields.map((field) => (
                        <button
                          key={field.name}
                          className="ve-field-item"
                          onClick={() => setEditingField(field)}
                        >
                          <span className="ve-field-item__icon">
                            {field.type === 'image' ? <Image size={18} /> :
                             field.type === 'array' ? <List size={18} /> :
                             field.type === 'textarea' ? <AlignLeft size={18} /> :
                             field.type === 'url' ? <Link2 size={18} /> :
                             field.type === 'number' ? <Hash size={18} /> :
                             field.type === 'boolean' ? <ToggleLeft size={18} /> :
                             field.type === 'color' ? <Palette size={18} /> :
                             field.type === 'email' ? <Mail size={18} /> :
                             <Type size={18} />}
                          </span>
                          <span className="ve-field-item__label">{field.label}</span>
                          <span className="ve-field-item__type">{field.type}</span>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unsaved indicator */}
      {hasChanges && (
        <div className="visual-editor__unsaved">
          <span>●</span> Modifications non sauvegardées
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      <style>{`
        .visual-editor {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          background: #0f0f1a;
          overflow: hidden;
          z-index: 1000;
        }

        .visual-editor__loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 16px;
          background: #0f0f1a;
          z-index: 1000;
        }

        /* Toolbar */
        .visual-editor__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #1a1a2e;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .visual-editor__toolbar-left,
        .visual-editor__toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .visual-editor__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          padding-left: 16px;
          border-left: 1px solid rgba(255,255,255,0.1);
          margin-left: 4px;
        }

        .visual-editor__path {
          font-size: 0.75rem;
          font-weight: 400;
          color: #64748b;
          background: rgba(255,255,255,0.05);
          padding: 4px 10px;
          border-radius: 4px;
          font-family: monospace;
        }

        .ve-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .ve-btn-ghost {
          background: transparent;
          color: #94a3b8;
        }
        .ve-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .ve-btn-primary {
          background: rgba(99,102,241,0.2);
          color: #a5b4fc;
        }
        .ve-btn-primary:hover {
          background: rgba(99,102,241,0.3);
        }

        .ve-btn-save {
          background: #6366f1;
          color: #fff;
        }
        .ve-btn-save:hover:not(:disabled) {
          background: #4f46e5;
        }
        .ve-btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ve-device-switcher {
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 4px;
        }

        .ve-device-btn {
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .ve-device-btn:hover {
          color: #fff;
        }
        .ve-device-btn.active {
          background: #6366f1;
          color: #fff;
        }

        /* Main */
        .visual-editor__main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Preview */
        .visual-editor__preview {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: #0f0f1a;
          overflow: hidden;
        }

        .visual-editor__iframe-container {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0,0,0,0.5);
          transition: width 0.3s ease;
          max-width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .visual-editor__iframe {
          width: 100%;
          flex: 1;
          min-height: 0;
          border: none;
          display: block;
        }

        .visual-editor__hint {
          margin-top: 16px;
          padding: 12px 20px;
          background: rgba(99,102,241,0.15);
          border-radius: 8px;
          color: #a5b4fc;
          font-size: 0.875rem;
        }

        /* Sidebar */
        .visual-editor__sidebar {
          width: 380px;
          background: #1a1a2e;
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
        }

        .ve-sidebar__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(99,102,241,0.1);
        }

        .ve-sidebar__header-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ve-sidebar__field-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #6366f1;
          color: #fff;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 4px;
          width: fit-content;
        }

        .ve-sidebar__header h3 {
          color: #fff;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .ve-sidebar__close {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .ve-sidebar__close:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .ve-sidebar__content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          overflow-x: visible;
          --admin-bg: rgba(255,255,255,0.03);
          --admin-card-bg: rgba(255,255,255,0.05);
          --admin-border: rgba(255,255,255,0.1);
          --admin-border-hover: rgba(255,255,255,0.2);
          --admin-text: #e2e8f0;
          --admin-text-muted: #94a3b8;
          --admin-primary: #6366f1;
          --admin-danger: #ef4444;
          --admin-danger-bg: rgba(239,68,68,0.15);
          --admin-bg-hover: rgba(255,255,255,0.08);
        }

        .ve-sidebar__content .url-field__dropdown {
          position: fixed;
          width: 340px;
          max-height: 300px;
        }

        .ve-sidebar__content .array-field__item-content {
          background: rgba(0,0,0,0.2);
          border-color: rgba(255,255,255,0.08);
          overflow: visible;
        }

        .ve-sidebar__content .admin-form-group {
          overflow: visible;
        }

        .ve-sidebar__content label {
          color: #e2e8f0 !important;
        }

        .ve-sidebar__content input,
        .ve-sidebar__content textarea,
        .ve-sidebar__content select {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }

        .ve-sidebar__content input::placeholder,
        .ve-sidebar__content textarea::placeholder {
          color: #64748b !important;
        }

        .ve-sidebar__content input:focus,
        .ve-sidebar__content textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
        }

        .ve-sidebar__content .array-field__item-title {
          color: #fff;
          font-weight: 600;
        }

        .ve-sidebar__content .array-field__item-drag {
          color: #64748b;
        }

        .ve-sidebar__content .array-field__item {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
        }

        .ve-sidebar__content .array-field__item.expanded {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
        }

        .ve-sidebar__content .array-field__item-header:hover {
          background: rgba(255,255,255,0.05);
        }

        .ve-sidebar__content .array-field__item-content {
          background: rgba(0,0,0,0.2);
          border-color: rgba(255,255,255,0.08);
        }

        .ve-sidebar__content .array-field__empty {
          background: rgba(255,255,255,0.02);
          border-color: rgba(255,255,255,0.1);
          color: #64748b;
        }

        .ve-sidebar__content .array-field__action-btn {
          color: #64748b;
        }

        .ve-sidebar__content .array-field__action-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .ve-sidebar__content .array-field__action-btn.danger:hover {
          background: rgba(239,68,68,0.2);
          color: #f87171;
        }

        .ve-sidebar__content .admin-btn-secondary {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.3);
        }

        .ve-sidebar__content .admin-btn-secondary:hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.5);
        }

        /* Field list */
        .ve-sidebar__list {
          flex: 1;
          overflow-y: auto;
        }

        .ve-sidebar__list-header {
          padding: 24px 20px 16px;
        }

        .ve-sidebar__list-header h3 {
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .ve-sidebar__list-header p {
          color: #64748b;
          font-size: 0.8125rem;
          margin: 0;
        }

        .ve-field-group {
          padding: 0 12px 16px;
        }

        .ve-field-group__title {
          padding: 8px 8px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
        }

        .ve-field-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .ve-field-item:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
        }

        .ve-field-item__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(99,102,241,0.15);
          border-radius: 6px;
          color: #a5b4fc;
        }

        .ve-field-item__label {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .ve-field-item__type {
          font-size: 0.6875rem;
          color: #64748b;
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* Unsaved indicator */
        .visual-editor__unsaved {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          background: #1e293b;
          border: 1px solid #f59e0b;
          color: #fbbf24;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          z-index: 100;
        }

        .visual-editor__unsaved span {
          color: #f59e0b;
        }

        .visual-editor__unsaved button {
          padding: 6px 16px;
          background: #f59e0b;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .visual-editor__unsaved button:hover:not(:disabled) {
          background: #fbbf24;
        }

        .visual-editor__unsaved button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Preview mode */
        .visual-editor__preview.preview-mode .visual-editor__hint {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default VisualEditor;
