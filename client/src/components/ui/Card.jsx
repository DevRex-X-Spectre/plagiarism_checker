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
    subtle: 'shadow-[0_14px_32px_-18px_rgba(33,33,86,0.34),0_2px_8px_rgba(33,33,86,0.08)]',
    sm: 'shadow-[0_16px_36px_-18px_rgba(33,33,86,0.36),0_3px_10px_rgba(33,33,86,0.08)]',
    md: 'shadow-[0_18px_42px_-20px_rgba(33,33,86,0.40),0_6px_14px_rgba(33,33,86,0.10)]',
    lg: 'shadow-[0_22px_52px_-22px_rgba(33,33,86,0.44),0_10px_22px_-12px_rgba(33,33,86,0.14)]',
    xl: 'shadow-[0_28px_64px_-26px_rgba(33,33,86,0.48),0_16px_30px_-16px_rgba(33,33,86,0.16)]',
    none: 'shadow-none',
  };

  const baseClasses = [
    'relative overflow-hidden rounded-[20px] border border-mist/80 bg-[linear-gradient(180deg,rgba(245,246,248,0.96),rgba(236,249,251,0.84))]',
    'backdrop-blur-xl',
    'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
    shadows[shadow] || shadows.subtle,
    hover && 'card-hover cursor-pointer hover:border-slate-300/80',
    glass && 'bg-white/75 border-white/60',
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
