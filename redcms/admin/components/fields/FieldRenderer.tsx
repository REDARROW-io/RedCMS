/**
 * FieldRenderer - Affiche le bon composant selon le type de champ
 */

import type { FieldDefinition } from '@redcms/core/schema';
import { StringField } from './StringField';
import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { BooleanField } from './BooleanField';
import { SelectField } from './SelectField';
import { ImageField } from './ImageField';
import { ColorField } from './ColorField';
import { ArrayField } from './ArrayField';
import { UrlField } from './UrlField';

interface FieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  arrayIndex?: number | null;
}

export function FieldRenderer({ field, value, onChange, arrayIndex }: FieldRendererProps) {
  const commonProps = {
    label: field.label,
    required: field.required,
  };

  switch (field.type) {
    case 'text':
      return (
        <StringField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      );

    case 'richtext':
      return (
        <TextField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          richtext={true}
        />
      );

    case 'number':
      return (
        <NumberField
          {...commonProps}
          value={(value as number) ?? field.default ?? 0}
          onChange={onChange}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );

    case 'boolean':
      return (
        <BooleanField
          {...commonProps}
          value={(value as boolean) ?? field.default ?? false}
          onChange={onChange}
        />
      );

    case 'select':
      return (
        <SelectField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          options={field.options || []}
        />
      );

    case 'image':
      return (
        <ImageField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'color':
      return (
        <ColorField
          {...commonProps}
          value={(value as string) || '#000000'}
          onChange={onChange}
        />
      );

    case 'array':
      return (
        <ArrayField
          {...commonProps}
          value={(value as unknown[]) || []}
          onChange={onChange}
          itemFields={field.itemFields || []}
          initialExpandedIndex={arrayIndex}
        />
      );

    case 'url':
      return (
        <UrlField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          placeholder={field.placeholder || 'https://...'}
        />
      );

    case 'email':
      return (
        <StringField
          {...commonProps}
          value={(value as string) || ''}
          onChange={onChange}
          placeholder={field.placeholder || 'email@exemple.com'}
          type="email"
        />
      );

    default:
      return (
        <div style={{ marginBottom: 16, color: 'var(--admin-text-muted)' }}>
          Type de champ non supporté: {(field as any).type}
        </div>
      );
  }
}

export default FieldRenderer;
