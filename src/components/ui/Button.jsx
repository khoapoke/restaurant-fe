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
    'inline-flex items-center justify-center font-semibold tracking-[0.06em] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#f5f0e7] disabled:opacity-60 disabled:cursor-not-allowed select-none'

  const sizeStyles = {
    sm: 'min-h-9 px-3.5 py-1.5 text-[11px] gap-1.5',
    md: 'min-h-11 px-5 py-2.5 text-xs gap-2',
    lg: 'min-h-12 px-6 py-3 text-sm gap-2.5',
  }

  const variantStyles = {
    primary:
      'moc-inverse bg-[#6f1d32] hover:bg-[#49101f] text-white shadow-lg shadow-[#6f1d32]/15 active:scale-[0.98] focus:ring-[#6f1d32]',
    secondary:
      'moc-inverse bg-[#251b19] hover:bg-[#3a2a27] text-[#fff8ed] border border-[#251b19] active:scale-[0.98] focus:ring-[#6f1d32]',
    light:
      'bg-[#fff8ed] hover:bg-white text-[#251b19] border border-[#fff8ed] active:scale-[0.98] focus:ring-[#d7b074]',
    outline:
      'border border-[#6f1d32]/45 text-[#6f1d32] hover:bg-[#6f1d32] hover:text-white active:scale-[0.98] focus:ring-[#6f1d32]',
    ghost:
      'text-[#766e68] hover:text-[#6f1d32] hover:bg-[#6f1d32]/7 focus:ring-[#6f1d32]',
    danger:
      'moc-inverse bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-[0.98] focus:ring-red-500',
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
