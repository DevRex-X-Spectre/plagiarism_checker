export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-8)',
    fontFamily: 'var(--font-suisseintl)',
    fontWeight: 'var(--font-weight-medium)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    opacity: disabled || loading ? 0.6 : 1,
    borderRadius: 'var(--radius-buttons)',
  };

  const variants = {
    primary: {
      background: 'var(--color-deep-indigo)',
      color: '#ffffff',
      padding: '12px 20px',
      fontSize: '14px',
      boxShadow: 'var(--shadow-subtle)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-deep-ink)',
      padding: '12px 16px',
      fontSize: '14px',
      border: '1px solid var(--color-mist)',
    },
    danger: {
      background: '#dc2626',
      color: '#ffffff',
      padding: '10px 18px',
      fontSize: '14px',
    },
    secondary: {
      background: 'var(--color-paper-white)',
      color: 'var(--color-carbon)',
      padding: '10px 18px',
      fontSize: '14px',
      border: '1px solid var(--color-mist)',
    },
  };

  const sizes = {
    sm: { padding: '8px 14px', fontSize: '13px' },
    md: {},
    lg: { padding: '14px 24px', fontSize: '16px' },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...base,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 14,
          height: 14,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
