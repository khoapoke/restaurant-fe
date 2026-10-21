import { useState } from 'react'
import { Banknote, Loader2, QrCode } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { apiErrorMessage } from '../../../lib/apiError'
import { formatWait, minutesSince } from '../../../lib/useNow'
import { SERVICE_OPTIONS, SERVICE_STATUS_META } from '../constants'

/** Danh sách yêu cầu phục vụ của bàn kèm trạng thái và nút hủy khi nhân viên chưa nhận. */
export const ServiceRequestList = ({ requests, now, onCancel, busyId }) => {
  const visible = (requests || []).filter((request) => ['NEW', 'ACKNOWLEDGED'].includes(request.status) || minutesSince(request.completedAt || request.createdAt, now) < 30)
  if (!visible.length) return null

  return (
    <ul className="space-y-2" aria-label="Yêu cầu phục vụ">
      {visible.map((request) => {
        const meta = SERVICE_STATUS_META[request.status] || SERVICE_STATUS_META.NEW
        return (
          <li key={request.requestId} className="moc-fade-in flex items-center gap-3 rounded-2xl border border-[var(--moc-line)] bg-[#fffdf8] px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#211b18]">{request.label}</p>
              <p className="mt-0.5 text-xs text-[#625a55]">
                {request.note ? `“${request.note}” · ` : ''}{formatWait(minutesSince(request.createdAt, now)).toLowerCase()} trước
              </p>
            </div>
            <span key={request.status} className={`moc-pop shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
            {request.canCancel && (
              <button type="button" onClick={() => onCancel(request.requestId)} disabled={busyId === request.requestId} className="min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold text-[#6f1d32] disabled:opacity-50">
                Hủy
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export const ServiceSheet = ({ open, onClose, onSubmit, requests, now, onCancel, initialType = null }) => {
  const [type, setType] = useState(initialType)
  const [note, setNote] = useState('')
  const [method, setMethod] = useState('BANK_TRANSFER_QR')
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async (selectedType) => {
    if (selectedType === 'OTHER' && !note.trim()) {
      setFeedback({ tone: 'error', message: 'Vui lòng ghi ngắn điều bạn cần.' })
      return
    }
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await onSubmit({
        type: selectedType,
        note: selectedType === 'OTHER' ? note.trim() : null,
        preferredMethod: selectedType === 'PAYMENT' ? method : null,
      })
      setFeedback({ tone: 'success', message: response.data.created ? 'Đã báo nhân viên. Bạn sẽ thấy trạng thái cập nhật ngay bên dưới.' : 'Yêu cầu này đang được xử lý, nhân viên sẽ đến ngay.' })
      setType(null)
      setNote('')
    } catch (error) {
      setFeedback({ tone: 'error', message: apiErrorMessage(error, 'Chưa gửi được yêu cầu. Vui lòng thử lại.') })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (requestId) => {
    setBusyId(requestId)
    try {
      await onCancel(requestId)
    } catch (error) {
      setFeedback({ tone: 'error', message: apiErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  const needsDetails = type === 'PAYMENT' || type === 'OTHER'

  return (
    <BottomSheet open={open} onClose={onClose} title="Cần Mộc hỗ trợ?" subtitle="Chạm một lần, nhân viên gần nhất sẽ nhận yêu cầu." labelledBy="dine-service-title">
      <div className="grid grid-cols-2 gap-3">
        {SERVICE_OPTIONS.map(({ type: optionType, label, hint, icon: Icon }) => {
          const selected = type === optionType
          return (
            <button
              key={optionType}
              type="button"
              disabled={submitting}
              aria-pressed={selected}
              onClick={() => {
                setFeedback(null)
                if (optionType === 'PAYMENT' || optionType === 'OTHER') setType(optionType)
                else handleSubmit(optionType)
              }}
              className={`flex min-h-24 flex-col items-start justify-between rounded-[20px] border p-4 text-left transition active:scale-[0.98] disabled:opacity-60 ${selected ? 'border-[#6f1d32] bg-[#6f1d32]/8 ring-2 ring-[#6f1d32]/20' : 'border-[var(--moc-line)] bg-white'}`}
            >
              <Icon className="h-6 w-6 text-[#6f1d32]" />
              <span>
                <span className="block text-[15px] font-semibold leading-5 text-[#211b18]">{label}</span>
                <span className="mt-0.5 block text-xs leading-4 text-[#625a55]">{hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      {needsDetails && (
        <div className="moc-fade-in mt-4 rounded-[20px] border border-[var(--moc-line)] bg-[#f8f3ea] p-4">
          {type === 'PAYMENT' ? (
            <fieldset>
              <legend className="text-sm font-semibold text-[#211b18]">Bạn muốn thanh toán bằng</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[{ value: 'BANK_TRANSFER_QR', label: 'Chuyển khoản QR', icon: QrCode }, { value: 'CASH', label: 'Tiền mặt', icon: Banknote }].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" aria-pressed={method === value} onClick={() => setMethod(value)} className={`flex min-h-12 items-center justify-center gap-2 rounded-full border text-sm font-semibold ${method === value ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : 'border-[var(--moc-line)] bg-white text-[#211b18]'}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <label className="block text-sm font-semibold text-[#211b18]">
              Điều bạn cần
              <textarea value={note} onChange={(event) => setNote(event.target.value.slice(0, 200))} rows={2} placeholder="Ví dụ: cho mình xin ghế em bé" className="mt-2 w-full resize-none rounded-2xl border border-[var(--moc-line)] bg-white px-4 py-3 text-base font-normal outline-none focus:border-[#6f1d32]" />
            </label>
          )}
          <button type="button" onClick={() => handleSubmit(type)} disabled={submitting} className="moc-inverse mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] text-[15px] font-semibold text-[#fff8ed] disabled:opacity-60">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Gửi yêu cầu
          </button>
        </div>
      )}

      {feedback && <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${feedback.tone === 'error' ? 'bg-[#fbeaea] text-[#8a1c1c]' : 'bg-[#e3f1e6] text-[#14532d]'}`} role="status">{feedback.message}</p>}

      <div className="mt-5">
        <ServiceRequestList requests={requests} now={now} onCancel={handleCancel} busyId={busyId} />
      </div>
    </BottomSheet>
  )
}

export default ServiceSheet
