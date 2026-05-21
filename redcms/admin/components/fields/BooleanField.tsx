interface BooleanFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanField({
  label,
  description,
  value,
  onChange,
}: BooleanFieldProps) {
  return (
    <div className="admin-form-group">
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span className="admin-label" style={{ marginBottom: 0 }}>{label}</span>
      </label>
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 4, marginLeft: 28 }}>
          {description}
        </p>
      )}
    </div>
  );
}
