import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

export const Alert = ({
  type = 'error',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-700',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-[#6f1d32]/5 border-[#6f1d32]/25 text-[#6f1d32]',
      icon: AlertCircle,
      iconColor: 'text-[#6f1d32]',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-700',
    },
  }

  const current = styles[type] || styles.error
  const IconComponent = current.icon

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border text-sm ${current.bg} ${className}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <div className="text-sm leading-6">{message}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
