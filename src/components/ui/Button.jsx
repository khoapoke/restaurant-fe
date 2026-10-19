import { Loader2 } from 'lucide-react'

/**
 * Base Button component
 * Chống double-submit, hỗ trợ loading state và biến thể kiểu dáng sang trọng
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed select-none'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-semibold',
  }

  const variantStyles = {
    primary:
      'bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] focus:ring-amber-500',
    secondary:
      'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 active:scale-[0.98] focus:ring-gray-600',
    outline:
      'border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 active:scale-[0.98] focus:ring-amber-500',
    ghost:
      'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 focus:ring-gray-700',
    danger:
      'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-[0.98] focus:ring-red-500',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}

export default Button
