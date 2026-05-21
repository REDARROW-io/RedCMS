/**
 * ArrayField - Champ liste répétable
 * Permet d'ajouter, modifier, supprimer et réordonner des items
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import type { FieldDefinition } from '@redcms/core/schema';
import { FieldRenderer } from './FieldRenderer';

interface ArrayFieldProps {
  label: string;
  required?: boolean;
  value: unknown[];
  onChange: (value: unknown[]) => void;
  itemFields?: FieldDefinition[];
  initialExpandedIndex?: number | null;
}

export function ArrayField({
  label,
  required,
  value = [],
  onChange,
  itemFields = [],
  initialExpandedIndex = null,
}: ArrayFieldProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(initialExpandedIndex);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Mettre à jour si initialExpandedIndex change
  useEffect(() => {
    if (initialExpandedIndex !== null) {
      setExpandedIndex(initialExpandedIndex);
    }
  }, [initialExpandedIndex]);

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    itemFields.forEach((field) => {
      newItem[field.name] = field.default ?? '';
    });
    const newArray = [...value, newItem];
    onChange(newArray);
    // Ouvrir automatiquement le nouvel item
    setExpandedIndex(newArray.length - 1);
  };

  const removeItem = (index: number) => {
    if (confirm('Supprimer cet élément ?')) {
      onChange(value.filter((_, i) => i !== index));
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    }
  };

  const updateItem = (index: number, fieldName: string, fieldValue: unknown) => {
    const updated = [...value];
    updated[index] = {
      ...(updated[index] as Record<string, unknown>),
      [fieldName]: fieldValue,
    };
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= value.length) return;
    
    const updated = [...value];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setExpandedIndex(newIndex);
  };

  const getItemTitle = (item: Record<string, unknown>, index: number): string => {
    // Chercher un champ titre, nom, ou le premier champ texte
    const titleField = itemFields.find(f => 
      f.name === 'titre' || f.name === 'title' || f.name === 'nom' || f.name === 'name'
    );
    if (titleField && item[titleField.name]) {
      return String(item[titleField.name]);
    }
    // Premier champ non vide
    for (const field of itemFields) {
      if (item[field.name] && typeof item[field.name] === 'string') {
        const val = String(item[field.name]);
        if (val.length > 0) {
          return val.length > 40 ? val.substring(0, 40) + '...' : val;
        }
      }
    }
    return `Élément ${index + 1}`;
  };

  return (
    <div className="admin-form-group array-field">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
        <span style={{ 
          marginLeft: 8, 
          fontSize: '0.75rem', 
          color: 'var(--admin-text-muted)',
          fontWeight: 400 
        }}>
          ({value.length} élément{value.length !== 1 ? 's' : ''})
        </span>
      </label>

      <div className="array-field__list">
        {value.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const itemData = item as Record<string, unknown>;
          
          return (
            <div
              key={index}
              className={`array-field__item ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Header de l'item */}
              <div className="array-field__item-header" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                <div className="array-field__item-drag">
                  <GripVertical size={16} />
                </div>
                
                <div className="array-field__item-title">
                  {getItemTitle(itemData, index)}
                </div>

                <div className="array-field__item-actions">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                    disabled={index === 0}
                    className="array-field__action-btn"
                    title="Monter"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                    disabled={index === value.length - 1}
                    className="array-field__action-btn"
                    title="Descendre"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                    className="array-field__action-btn danger"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Contenu de l'item (visible si expanded) */}
              {isExpanded && (
                <div className="array-field__item-content">
                  {itemFields.map((field) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      value={itemData[field.name]}
                      onChange={(val) => updateItem(index, field.name, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {value.length === 0 && (
          <div className="array-field__empty">
            Aucun élément. Cliquez sur "Ajouter" pour commencer.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="admin-btn admin-btn-secondary array-field__add-btn"
      >
        <Plus size={16} /> Ajouter un élément
      </button>

      <style>{`
        .array-field__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .array-field__item {
          background: var(--admin-bg);
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .array-field__item:hover {
          border-color: var(--admin-border-hover, var(--admin-border));
        }

        .array-field__item.expanded {
          border-color: var(--admin-primary);
        }

        .array-field__item-header {
          display: flex;
          align-items: center;
          padding: 12px;
          cursor: pointer;
          gap: 12px;
        }

        .array-field__item-header:hover {
          background: var(--admin-bg-hover, rgba(0,0,0,0.02));
        }

        .array-field__item-drag {
          color: var(--admin-text-muted);
          cursor: grab;
        }

        .array-field__item-title {
          flex: 1;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .array-field__item-actions {
          display: flex;
          gap: 4px;
        }

        .array-field__action-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--admin-text-muted);
          border-radius: 4px;
          transition: all 0.2s;
        }

        .array-field__action-btn:hover:not(:disabled) {
          background: var(--admin-bg-hover, rgba(0,0,0,0.05));
          color: var(--admin-text);
        }

        .array-field__action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .array-field__action-btn.danger:hover {
          background: var(--admin-danger-bg, #fee);
          color: var(--admin-danger);
        }

        .array-field__item-content {
          padding: 16px;
          padding-top: 8px;
          border-top: 1px solid var(--admin-border);
          background: var(--admin-card-bg, #fff);
        }

        .array-field__empty {
          padding: 24px;
          text-align: center;
          color: var(--admin-text-muted);
          font-size: 0.875rem;
          background: var(--admin-bg);
          border-radius: 8px;
          border: 1px dashed var(--admin-border);
        }

        .array-field__add-btn {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default ArrayField;
