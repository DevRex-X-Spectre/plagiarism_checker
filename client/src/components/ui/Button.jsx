import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-lg cursor-pointer select-none transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.97] relative overflow-hidden';

  const variants = {
    primary:
      'bg-deep-indigo text-white hover:bg-[#0d1540] hover:shadow-md hover:-translate-y-px',
    ghost:
      'bg-transparent text-carbon border border-mist hover:bg-paper-white hover:border-fog hover:text-deep-ink',
    secondary:
      'bg-paper-white text-carbon border border-mist hover:bg-card-white hover:shadow-xs',
    danger:
      'bg-danger text-white hover:bg-[#b91c1c] hover:shadow-sm',
    text:
      'bg-transparent text-deep-indigo p-0 text-sm font-medium hover:text-[#0d1540] hover:underline rounded-sm',
    outline: 'bg-transparent text-deep-indigo border-2 border-deep-indigo hover:bg-deep-indigo hover:text-white',
    success: 'bg-success text-white hover:bg-[#047857] hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-base',
    icon: 'p-2.5',
  };

  const classes = [
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
}
