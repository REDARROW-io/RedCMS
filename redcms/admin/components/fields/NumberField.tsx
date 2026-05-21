interface NumberFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberField({
  label,
  description,
  required,
  value,
  onChange,
  min,
  max,
}: NumberFieldProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">
        {label}
        {required && <span style={{ color: 'var(--admin-danger)' }}> *</span>}
      </label>
      <input
        type="number"
        className="admin-input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required={required}
        min={min}
        max={max}
      />
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
          {description}
        </p>
      )}
    </div>
  );
}
