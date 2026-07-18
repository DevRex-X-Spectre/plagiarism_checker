export default function Badge({ children, variant = 'default', style = {}, className = '' }) {
  const variants = {
    default: {
      background: 'var(--color-pale-cyan)',
      color: 'var(--color-forest-teal)',
    },
    primary: {
      background: 'var(--color-deep-indigo)',
      color: '#ffffff',
    },
    warning: {
      background: '#f1e8ff',
      color: '#676792',
    },
    danger: {
      background: '#eadfff',
      color: '#6d5fcd',
    },
    success: {
      background: '#e2f7fb',
      color: '#609ed9',
    },
    muted: {
      background: 'var(--color-paper-white)',
      color: 'var(--color-slate)',
    },
  };

  return (
    <span className={className} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      fontSize: '11px',
      fontFamily: 'var(--font-suisseintlmono)',
      fontWeight: 'var(--font-weight-regular)',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-badges)',
      ...variants[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}
