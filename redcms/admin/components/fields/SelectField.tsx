interface SelectFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export function SelectField({
  label,
  description,
  required,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      <select
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Sélectionner...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
          {description}
        </p>
      )}
    </div>
  );
}
