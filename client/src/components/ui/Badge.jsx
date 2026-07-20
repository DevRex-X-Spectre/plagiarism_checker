export default function Badge({ children, variant = 'default', style = {}, className = '' }) {
  const variants = {
    default: {
      background: 'var(--color-pale-cyan)',
      color: 'var(--color-forest-teal)',
    },
    primary: {
      background: 'var(--color-deep-indigo)',
      color: 'var(--color-midnight-teal)',
    },
    warning: {
      background: 'var(--color-warning-light)',
      color: 'var(--color-warning)',
    },
    danger: {
      background: 'var(--color-danger-light)',
      color: 'var(--color-danger)',
    },
    success: {
      background: 'var(--color-success-light)',
      color: 'var(--color-success)',
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
