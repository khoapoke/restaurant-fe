import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

const TONES = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  error: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: Info, className: 'border-[#6f1d32]/20 bg-[#fffdf8] text-[#6f1d32]' },
}

/**
 * Thông báo phản hồi sau thao tác. feedback = { tone: 'success' | 'error' | 'info', message }.
 */
export const FeedbackBanner = ({ feedback, onClose, className = '' }) => {
  if (!feedback?.message) return null
  const tone = TONES[feedback.tone] || TONES.info
  const Icon = tone.icon

  return (
    <div className={`flex items-start gap-3 border px-4 py-3 text-sm leading-6 ${tone.className} ${className}`} role={feedback.tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="min-w-0 flex-1">{feedback.message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="p-1 opacity-70 hover:opacity-100" aria-label="Đóng thông báo">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default FeedbackBanner
