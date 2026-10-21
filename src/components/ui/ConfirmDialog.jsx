import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { apiErrorMessage } from '../../lib/apiError'

/**
 * Hộp thoại xác nhận theo phong cách Mộc, thay cho window.confirm / window.prompt.
 * - tone="danger" cho thao tác nguy hiểm (khóa, xóa, hủy, hoàn tiền).
 * - reason: { label, placeholder, minLength, required } để bắt buộc nhập lý do.
 * - onConfirm(reason) có thể trả về Promise; lỗi từ API được hiển thị ngay trong hộp thoại.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  details,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Quay lại',
  tone = 'primary',
  reason,
  onConfirm,
  onClose,
}) => {
  const [value, setValue] = useState(reason?.defaultValue || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const minLength = reason?.minLength ?? 0
  const trimmed = value.trim()
  const reasonInvalid = reason && (reason.required !== false) && trimmed.length < Math.max(minLength, 1)

  const close = () => {
    if (!submitting) onClose?.()
  }

  const submit = async (event) => {
    event.preventDefault()
    if (reasonInvalid) {
      setError(minLength > 1 ? `Vui lòng nhập tối thiểu ${minLength} ký tự.` : 'Vui lòng nhập nội dung.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm?.(reason ? trimmed : undefined)
      onClose?.()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const Icon = tone === 'danger' ? AlertTriangle : ShieldCheck

  return (
    <Modal isOpen={isOpen} onClose={close} title={title} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-5">
        <div className="flex items-start gap-4">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone === 'danger' ? 'bg-red-50 text-red-700' : 'bg-[#6f1d32]/8 text-[#6f1d32]'}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {description && <p className="text-sm leading-6 text-[#211b18]">{description}</p>}
            {details && <div className="mt-3 text-sm leading-6 text-[#625a55]">{details}</div>}
          </div>
        </div>

        {reason && (
          <label className="grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">
            {reason.label || 'Lý do'}
            <textarea
              value={value}
              onChange={(event) => { setValue(event.target.value); setError(null) }}
              rows={3}
              maxLength={reason.maxLength || 500}
              placeholder={reason.placeholder}
              autoFocus
              className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]"
            />
            {minLength > 1 && (
              <span className="text-xs font-normal normal-case tracking-normal text-[#625a55]">
                {trimmed.length}/{minLength} ký tự tối thiểu
              </span>
            )}
          </label>
        )}

        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={close} disabled={submitting}>{cancelLabel}</Button>
          <Button type="submit" variant={tone === 'danger' ? 'danger' : 'primary'} isLoading={submitting}>{confirmLabel}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmDialog
