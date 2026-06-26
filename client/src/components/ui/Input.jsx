import { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  type = 'text',
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
      <input
        ref={ref}
        type={type}
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
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{
          fontSize: 'var(--text-caption)',
          color: '#dc2626',
        }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--color-slate)',
        }}>
          {hint}
        </span>
      )}
    </div>
  );
});

export default Input;
