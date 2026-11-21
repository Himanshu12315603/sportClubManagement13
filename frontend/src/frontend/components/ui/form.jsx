import Icon from './Icon';

/* --------------------------------- Field -------------------------------- */

export function Field({ label, hint, error, children, required, style }) {
  return (
    <div className="field" style={style}>
      {label ? (
        <label>
          {label} {required ? <span className="text-neon">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function Input({ error, className = '', ...rest }) {
  return <input className={`input ${error ? 'invalid' : ''} ${className}`} {...rest} />;
}

export function Select({ error, options = [], placeholder, className = '', ...rest }) {
  return (
    <select className={`select ${error ? 'invalid' : ''} ${className}`} {...rest}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o.value ?? o.id} value={o.value ?? o.id}>
          {o.label ?? o.name}
        </option>
      ))}
    </select>
  );
}

export function Textarea({ error, className = '', ...rest }) {
  return <textarea className={`textarea ${error ? 'invalid' : ''} ${className}`} {...rest} />;
}

export function Checkbox({ label, checked, onChange, hint }) {
  return (
    <label className="cb-row" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start', marginBottom: 14 }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: `1.5px solid ${checked ? '#16a085' : '#cbd5e1'}`,
          background: checked ? '#16a085' : '#ffffff',
          display: 'grid',
          placeItems: 'center',
          flex: 'none',
          marginTop: 1,
          color: '#ffffff',
          transition: 'all 0.18s ease',
        }}
      >
        {checked ? <Icon name="Check" size={13} /> : null}
      </span>
      <span>
        <span className="small" style={{ color: '#172b4d' }}>{label}</span>
        {hint ? <div className="tiny dim">{hint}</div> : null}
      </span>
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div style={{ position: 'relative', minWidth: 190 }} className={className}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
        <Icon name="Search" size={16} />
      </span>
      <input
        className="input"
        style={{ paddingLeft: 36 }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FormRow({ children, cols = 2, gap = 14 }) {
  return (
    <div className="cb-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap }}>
      {children}
    </div>
  );
}

/** Minimal required-field validator used by the demo forms. */
export function validateFields(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([key, rule]) => {
    const value = values[key];
    if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
      errors[key] = rule.message || 'This field is required.';
      return;
    }
    if (rule.email && value) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value));
      if (!ok) errors[key] = 'Enter a valid email address.';
      return;
    }
    if (rule.phone && value) {
      const ok = String(value).replace(/[^\d]/g, '').length >= 10;
      if (!ok) errors[key] = 'Enter a valid phone number.';
      return;
    }
    if (rule.min !== undefined && value !== '' && Number(value) < rule.min) {
      errors[key] = rule.message || `Minimum is ${rule.min}.`;
    }
  });
  return { valid: Object.keys(errors).length === 0, errors };
}
