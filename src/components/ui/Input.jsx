/**
 * Base Input component
 * Hiển thị nhãn, icon, và thông báo lỗi validation chuẩn Laravel
 */
export const Input = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  rightElement,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-gray-300 flex items-center gap-1 select-none"
        >
          {label}
          {required && <span className="text-amber-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl bg-gray-900/80 border text-gray-100 placeholder-gray-500 text-sm py-2.5 transition-all duration-150 outline-none
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-950' : 'hover:border-gray-700'}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
          <span>•</span> {Array.isArray(error) ? error[0] : error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Input
