interface StringFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email';
  maxLength?: number;
}

export function StringField({
  label,
  description,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: StringFieldProps) {
  const charCount = value?.length || 0;
  const showCounter = maxLength && maxLength > 0;
  const isOverLimit = showCounter && charCount > maxLength;

  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      <input
        type={type}
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        style={isOverLimit ? { borderColor: 'var(--admin-danger)' } : undefined}
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

export default StringField;
