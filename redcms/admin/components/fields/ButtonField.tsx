/**
 * ButtonField - Champ composite pour gérer un bouton (texte + lien)
 */

import { StringField } from './StringField';
import { UrlField } from './UrlField';

interface ButtonFieldProps {
  label: string;
  textValue: string;
  linkValue: string;
  onTextChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  textLabel?: string;
  linkLabel?: string;
}

export function ButtonField({
  label,
  textValue,
  linkValue,
  onTextChange,
  onLinkChange,
  textLabel = 'Texte',
  linkLabel = 'Lien',
}: ButtonFieldProps) {
  return (
    <div className="button-field">
      <div className="button-field__group">
        <StringField
          label={textLabel}
          value={textValue}
          onChange={onTextChange}
        />
      </div>
      <div className="button-field__group">
        <UrlField
          label={linkLabel}
          value={linkValue}
          onChange={onLinkChange}
        />
      </div>

      <style>{`
        .button-field {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .button-field__group {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
