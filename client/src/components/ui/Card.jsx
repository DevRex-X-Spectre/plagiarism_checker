export default function Card({
  children,
  padding = 24,
  shadow = 'subtle',
  hover = false,
  gradient = false,
  glass = false,
  style = {},
  className = '',
  ...props
}) {
  const shadows = {
    subtle: 'shadow-sm',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none',
  };

  const baseClasses = [
    'bg-card-white rounded-lg border border-mist/80',
    shadows[shadow] || shadows.subtle,
    hover && 'card-hover cursor-pointer',
    glass && 'backdrop-blur-custom bg-white/80 border border-white/50',
    gradient && 'relative overflow-hidden',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} style={{ padding, ...style }} {...props}>
      <div className={gradient ? 'relative z-10' : ''}>
        {children}
      </div>
    </div>
  );
}
