/**
 * ContentEditor - Éditeur de contenu de page
 * Affiche un formulaire basé sur le schema de la page
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Globe } from 'lucide-react';
import type { PageSchema, FieldDefinition, SEOContent } from '@redcms/core/schema';
import { seoFields } from '@redcms/core/schema';
import { FieldRenderer } from './fields/FieldRenderer';

interface ContentEditorProps {
  schema: PageSchema;
  onBack: () => void;
}

type TabType = 'content' | 'seo';

/**
 * Génère les valeurs par défaut depuis le schema
 */
function getDefaultValues(fields: FieldDefinition[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      defaults[field.name] = field.default;
    } else if (field.type === 'array') {
      defaults[field.name] = [];
    } else if (field.type === 'boolean') {
      defaults[field.name] = false;
    }
  }
  return defaults;
}

export function ContentEditor({ schema, onBack }: ContentEditorProps) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [seo, setSeo] = useState<SEOContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [hasChanges, setHasChanges] = useState(false);

  // Charger le contenu
  useEffect(() => {
    loadContent();
  }, [schema.slug]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${schema.slug}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fusionner les valeurs par défaut avec le contenu existant
        const defaults = getDefaultValues(schema.fields);
        const mergedContent = { ...defaults, ...data.content };
        
        setContent(mergedContent);
        setSeo(data.seo || {});
      } else {
        // Si erreur, utiliser les valeurs par défaut
        setContent(getDefaultValues(schema.fields));
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent(getDefaultValues(schema.fields));
    }
    setLoading(false);
  };

  const handleContentChange = (name: string, value: any) => {
    setContent(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSeoChange = (name: string, value: any) => {
    setSeo(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/content/${schema.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, seo }),
      });
      
      if (response.ok) {
        setHasChanges(false);
      } else {
        console.error('Error saving content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 className="admin-spinner" size={32} />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="content-editor">
      {/* Header */}
      <div className="content-editor__header">
        <button onClick={onBack} className="admin-btn admin-btn-ghost">
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <div className="content-editor__title">
          {schema.icon && <span className="content-editor__icon">{schema.icon}</span>}
          <h1>{schema.label}</h1>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || !hasChanges}
          className="admin-btn admin-btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="admin-spinner" size={16} />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={16} />
              Sauvegarder
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="content-editor__tabs">
        <button
          onClick={() => setActiveTab('content')}
          className={`content-editor__tab ${activeTab === 'content' ? 'active' : ''}`}
        >
          Contenu
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`content-editor__tab ${activeTab === 'seo' ? 'active' : ''}`}
        >
          <Globe size={16} />
          SEO
        </button>
      </div>

      {/* Content */}
      <div className="content-editor__body">
        {activeTab === 'content' ? (
          <div className="content-editor__fields">
            {schema.fields.map((field) => (
              <div key={field.name} className="content-editor__field">
                <FieldRenderer
                  field={field}
                  value={content[field.name]}
                  onChange={(value) => handleContentChange(field.name, value)}
                />
              </div>
            ))}
            
            {schema.fields.length === 0 && (
              <div className="content-editor__empty">
                <p>Aucun champ défini pour cette page.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="content-editor__fields content-editor__seo">
            <div className="content-editor__seo-preview">
              <p className="content-editor__seo-label">Aperçu Google</p>
              <div className="content-editor__seo-google">
                <div className="seo-google__title">
                  {seo.title || schema.label || 'Titre de la page'}
                </div>
                <div className="seo-google__url">
                  https://votresite.com/{schema.slug === 'accueil' ? '' : schema.slug}
                </div>
                <div className="seo-google__description">
                  {seo.description || 'Ajoutez une description pour améliorer votre référencement...'}
                </div>
              </div>
            </div>

            {seoFields.map((field) => (
              <div key={field.name} className="content-editor__field">
                <FieldRenderer
                  field={field}
                  value={seo[field.name as keyof SEOContent]}
                  onChange={(value) => handleSeoChange(field.name, value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="content-editor__unsaved">
          Modifications non enregistrées
        </div>
      )}
    </div>
  );
}

export default ContentEditor;
