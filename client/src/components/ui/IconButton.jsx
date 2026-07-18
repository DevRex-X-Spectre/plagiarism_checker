export default function IconButton({
  icon: Icon,
  size = 'md',
  variant = 'ghost',
  label,
  onClick,
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variants = {
    ghost: 'text-slate hover:text-deep-ink hover:bg-mist/50',
    primary: 'text-white bg-deep-indigo hover:bg-[#0b102e]',
    outline: 'text-deep-indigo border border-mist hover:bg-mist/30',
    danger: 'text-danger hover:bg-danger/10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center rounded-lg transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-indigo/30',
        sizes[size],
        variants[variant],
        className,
      ].filter(Boolean).join(' ')}
      aria-label={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
