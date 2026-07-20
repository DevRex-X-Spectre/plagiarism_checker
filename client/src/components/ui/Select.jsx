import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({
  label,
  error,
  icon: Icon,
  options = [],
  placeholder = 'Select...',
  className = '',
  ...props
}, ref) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className={`text-sm font-medium leading-tight ${error ? 'text-danger' : 'text-carbon'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fog pointer-events-none z-10">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-[10px] pr-10 text-base font-sans text-deep-ink bg-card-white
            border rounded-lg outline-none transition-all duration-150 cursor-pointer
            appearance-none
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-danger hover:border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(211,107,93,0.22)]'
              : 'border-mist hover:border-fog focus:border-deep-indigo focus:shadow-[0_0_0_3px_rgba(201,100,66,0.22)]'
            }
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fog pointer-events-none" />
      </div>
      {error && <span className="text-xs text-danger leading-tight">{error}</span>}
    </div>
  );
});

export default Select;
