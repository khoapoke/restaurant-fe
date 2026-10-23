import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { apiErrorMessage } from '../../../lib/apiError'
import { REFUND_METHOD_LABEL, formatCurrency } from '../constants'

const fieldClass = 'min-h-11 w-full border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]'
const labelClass = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]'

/**
 * "Ghi nhận đã hoàn tiền" (ADR-023): hệ thống KHÔNG chuyển tiền. Quản lý hoàn cho khách bên ngoài
 * (ngân hàng/tiền mặt) rồi lưu số tiền, hình thức, mã chứng từ, thời điểm và lý do tại đây.
 * Hoàn một phần được phép; không vượt số đã nhận trừ số đã hoàn.
 */
const newRequestKey = () => `refund-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`

/**
 * refundDue: số nhà hàng đang nợ khách (phần dư/đơn hủy). Hoàn vượt mức này trên đơn còn hiệu lực là
 * bồi hoàn — giảm khoản phải thu của đơn — và phải được chọn rõ (backend từ chối nếu không chọn).
 * Mỗi lần mở modal có một khóa yêu cầu: bấm lại sau khi mất phản hồi không ghi hoàn lần nữa.
 */
export const RefundRecordModal = ({ title, maxAmount, suggestedAmount, refundDue, allowCompensation = true, context, onSubmit, onClose }) => {
  const [requestKey] = useState(newRequestKey)
  const [refundType, setRefundType] = useState(null)
  const [amount, setAmount] = useState(String(suggestedAmount ?? maxAmount ?? ''))
  const [method, setMethod] = useState('BANK_TRANSFER')
  const [referenceCode, setReferenceCode] = useState('')
  const [refundedAt, setRefundedAt] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const value = Number(amount || 0)
  const exceedsDue = refundDue !== undefined && value > Number(refundDue || 0) + 0.001
  const effectiveType = exceedsDue ? refundType : 'REFUND'

  const submit = async (event) => {
    event.preventDefault()
    if (value <= 0) { setError('Số tiền hoàn phải lớn hơn 0.'); return }
    if (maxAmount !== undefined && value > maxAmount + 0.001) { setError(`Không được hoàn quá ${formatCurrency(maxAmount)}.`); return }
    if (referenceCode.trim().length < 3) { setError('Nhập mã chứng từ hoàn tiền (mã giao dịch ngân hàng, số phiếu chi...).'); return }
    if (reason.trim().length < 5) { setError('Lý do hoàn tiền tối thiểu 5 ký tự.'); return }
    if (exceedsDue && !refundType) { setError('Số tiền vượt phần nhà hàng đang nợ khách. Hãy chọn đây là bồi hoàn cho khách (giảm khoản phải thu) hoặc giảm số tiền.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        amount: value,
        method,
        referenceCode: referenceCode.trim(),
        refundReason: reason.trim(),
        refundedAt: refundedAt ? refundedAt.replace('T', ' ') + ':00' : null,
        refundType: effectiveType || 'REFUND',
      }, requestKey)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={title} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-4">
        <p className="border border-[#6f1d32]/20 bg-[#6f1d32]/5 px-3 py-2.5 text-sm leading-6 text-[#211b18]">
          Hệ thống chỉ <strong>ghi nhận</strong> khoản đã hoàn, không tự chuyển tiền. Hãy hoàn cho khách trước (ngân hàng hoặc tiền mặt), sau đó lưu chứng từ tại đây.
        </p>
        {context && <div className="text-sm text-[#625a55]">{context}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Số tiền đã hoàn
            <input type="number" min="0" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} className={fieldClass} />
            {maxAmount !== undefined && <span className="text-xs font-normal normal-case tracking-normal text-[#625a55]">Tối đa {formatCurrency(maxAmount)}</span>}
          </label>
          <label className={labelClass}>
            Hình thức hoàn
            <select value={method} onChange={(event) => setMethod(event.target.value)} className={fieldClass}>
              {Object.entries(REFUND_METHOD_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className={labelClass}>
            Mã chứng từ
            <input value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} maxLength={100} placeholder="FT26102199887 / PC-0123" className={fieldClass} />
          </label>
          <label className={labelClass}>
            Thời điểm hoàn (nếu không phải bây giờ)
            <input type="datetime-local" value={refundedAt} onChange={(event) => setRefundedAt(event.target.value)} className={fieldClass} />
          </label>
        </div>
        {exceedsDue && (
          <fieldset className="grid gap-2 border border-amber-300 bg-amber-50 p-3 text-sm text-[#211b18]">
            <legend className="px-1 text-xs font-bold uppercase tracking-[0.08em] text-amber-900">Loại khoản hoàn</legend>
            <p className="text-amber-900">Nhà hàng đang nợ khách {Number(refundDue || 0).toLocaleString('vi-VN')} ₫. Phần vượt quá không phải tiền thừa của khách.</p>
            <label className={`flex items-start gap-2 ${allowCompensation ? '' : 'opacity-50'}`}>
              <input type="radio" name="refund-type" disabled={!allowCompensation} checked={refundType === 'COMPENSATION'} onChange={() => setRefundType('COMPENSATION')} className="mt-1 h-4 w-4 accent-[#6f1d32]" />
              <span>Bồi hoàn cho khách (giảm khoản phải thu của đơn; hóa đơn đã thanh toán giữ nguyên, đơn không phát sinh "còn thiếu")</span>
            </label>
          </fieldset>
        )}

        <label className={labelClass}>
          Lý do hoàn tiền
          <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Ví dụ: Khách chuyển khoản hai lần cho hóa đơn HD12-V1" className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]" />
        </label>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" variant="danger" icon={RotateCcw} isLoading={submitting}>Ghi nhận đã hoàn tiền</Button>
        </div>
      </form>
    </Modal>
  )
}

export default RefundRecordModal
