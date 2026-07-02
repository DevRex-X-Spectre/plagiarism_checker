import { forwardRef } from 'react';

export default forwardRef(function Input(
  { label, error, hint, icon: Icon, multiline = false, className = '', ...props },
  ref
) {
  const id = props.id || props.name;

  const inputBase =
    'w-full px-4 py-[10px] text-base font-sans text-deep-ink bg-card-white border rounded-lg outline-none transition-all duration-150 placeholder:text-fog';
  const inputNormal = 'border-mist hover:border-fog focus:border-deep-indigo focus:shadow-[0_0_0_3px_rgba(17,26,74,0.12)]';
  const inputError = 'border-danger hover:border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium leading-tight ${error ? 'text-danger' : 'text-carbon'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fog pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        {multiline ? (
          <textarea
            ref={ref}
            id={id}
            rows={props.rows || 4}
            className={`${inputBase} ${error ? inputError : inputNormal} resize-y min-h-[100px] ${Icon ? 'pl-10' : ''}`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            className={`${inputBase} ${error ? inputError : inputNormal} ${Icon ? 'pl-10' : ''}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="text-xs text-danger leading-tight">{error}</span>}
      {hint && !error && <span className="text-xs text-slate leading-tight">{hint}</span>}
    </div>
  );
});