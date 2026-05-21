interface TextFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  richtext?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function TextField({
  label,
  description,
  required,
  value,
  onChange,
  richtext = false,
  placeholder,
  maxLength,
}: TextFieldProps) {
  const charCount = value?.length || 0;
  const showCounter = maxLength && maxLength > 0;
  const isOverLimit = showCounter && charCount > maxLength;

  // TODO: Remplacer par un vrai éditeur WYSIWYG (TipTap) si richtext
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      <textarea
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={richtext ? 8 : 4}
        style={{ 
          resize: 'vertical',
          ...(isOverLimit ? { borderColor: 'var(--admin-danger)' } : {})
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {description && (
          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: 0 }}>
            {description}
          </p>
        )}
        {showCounter && (
          <span style={{ 
            fontSize: '0.75rem', 
            color: isOverLimit ? 'var(--admin-danger)' : 'var(--admin-text-muted)',
            marginLeft: 'auto'
          }}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default TextField;
