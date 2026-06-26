import { forwardRef } from 'react';

const Select = forwardRef(function Select({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  style = {},
  ...props
}, ref) {
  const hasError = !!error;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-body-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: hasError ? '#dc2626' : 'var(--color-carbon)',
        }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 'var(--text-body)',
          fontFamily: 'var(--font-suisseintl)',
          color: 'var(--color-deep-ink)',
          background: 'var(--surface-card)',
          border: `1px solid ${hasError ? '#dc2626' : 'var(--color-mist)'}`,
          borderRadius: 'var(--radius-inputs)',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237c7f88' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '40px',
          ...style,
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: 'var(--text-caption)', color: '#dc2626' }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default Select;
