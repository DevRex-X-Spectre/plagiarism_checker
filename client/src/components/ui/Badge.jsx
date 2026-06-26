export default function Badge({ children, variant = 'default', style = {} }) {
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
      background: '#fef3c7',
      color: '#92400e',
    },
    danger: {
      background: '#fee2e2',
      color: '#991b1b',
    },
    success: {
      background: '#d1fae5',
      color: '#065f46',
    },
    muted: {
      background: 'var(--color-paper-white)',
      color: 'var(--color-slate)',
    },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
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
