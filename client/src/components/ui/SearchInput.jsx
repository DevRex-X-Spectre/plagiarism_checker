import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  size = 'md',
  ...props
}) {
  const sizes = {
    sm: 'h-9 text-sm pl-9',
    md: 'h-10 text-sm pl-10',
    lg: 'h-12 text-base pl-11',
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fog pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full bg-card-white border border-mist rounded-lg',
          'text-deep-ink placeholder:text-fog',
          'focus:outline-none focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20',
          'transition-all duration-150',
          sizes[size],
        ].join(' ')}
        {...props}
      />
      {value && (
        <button
          onClick={() => {
            onChange({ target: { value: '' } });
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-fog hover:text-deep-ink hover:bg-mist/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}