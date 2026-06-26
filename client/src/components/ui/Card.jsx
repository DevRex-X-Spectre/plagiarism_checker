export default function Card({
  children,
  padding = 24,
  shadow = 'subtle',
  style = {},
  ...props
}) {
  const shadows = {
    subtle: 'var(--shadow-subtle)',
    xl: 'var(--shadow-xl)',
    none: 'none',
  };

  return (
    <div style={{
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-cards)',
      padding,
      boxShadow: shadows[shadow],
      ...style,
    }}
      {...props}
    >
      {children}
    </div>
  );
}
