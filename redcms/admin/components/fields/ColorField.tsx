interface ColorFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({
  label,
  description,
  required,
  value,
  onChange,
}: ColorFieldProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 48,
            height: 38,
            padding: 2,
            border: '1px solid var(--admin-border)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
          {description}
        </p>
      )}
    </div>
  );
}
