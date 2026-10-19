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
      bg: 'bg-red-500/10 border-red-500/30 text-red-300',
      icon: XCircle,
      iconColor: 'text-red-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: AlertCircle,
      iconColor: 'text-amber-400',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: Info,
      iconColor: 'text-blue-400',
    },
  }

  const current = styles[type] || styles.error
  const IconComponent = current.icon

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm backdrop-blur-sm ${current.bg} ${className}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <div className="text-xs leading-relaxed opacity-90">{message}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 p-0.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
