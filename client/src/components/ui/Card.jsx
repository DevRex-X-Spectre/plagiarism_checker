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
    subtle: 'shadow-[0_14px_32px_-18px_rgba(0,0,0,0.62),0_2px_8px_rgba(0,0,0,0.28)]',
    sm: 'shadow-[0_16px_36px_-18px_rgba(0,0,0,0.64),0_3px_10px_rgba(0,0,0,0.30)]',
    md: 'shadow-[0_18px_42px_-20px_rgba(0,0,0,0.68),0_6px_14px_rgba(0,0,0,0.34)]',
    lg: 'shadow-[0_22px_52px_-22px_rgba(0,0,0,0.72),0_10px_22px_-12px_rgba(0,0,0,0.42)]',
    xl: 'shadow-[0_28px_64px_-26px_rgba(0,0,0,0.78),0_16px_30px_-16px_rgba(0,0,0,0.48)]',
    none: 'shadow-none',
  };

  const baseClasses = [
    'relative overflow-hidden rounded-[20px] border border-mist/80 bg-card-white',
    'backdrop-blur-xl',
    'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    shadows[shadow] || shadows.subtle,
    hover && 'card-hover cursor-pointer hover:border-deep-indigo/50',
    glass && 'bg-card-white/80 border-mist/70',
    gradient && 'relative',
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
