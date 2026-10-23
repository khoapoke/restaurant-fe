import { useState } from 'react'
import { Ban, PackageCheck, PackageX, UserRoundPen } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { apiErrorMessage } from '../../../lib/apiError'
import { CANCEL_REASON_TYPES, DELIVERY_FAILURE_REASONS, formatCurrency } from '../constants'
import { cancelAdminOrderApi, updateFulfillmentStatusApi, updateOrderRecipientApi } from '../services/adminService'

const fieldClass = 'min-h-11 w-full border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]'
const labelClass = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]'
const areaClass = 'border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]'

const useSubmit = (action, onDone) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const run = async (validate) => {
    const invalid = validate?.()
    if (invalid) { setError(invalid); return }
    setSubmitting(true)
    setError(null)
    try {
      const message = await action()
      onDone(message)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      setSubmitting(false)
    }
  }
  return { submitting, error, run }
}

const ErrorLine = ({ error }) => (error ? <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p> : null)

/** Ghi nhận giao thất bại (DLV-04): đơn tiền mặt KHÔNG được ghi đã thu. */
export const DeliveryFailureModal = ({ order, onClose, onDone }) => {
  const [reason, setReason] = useState('CUSTOMER_UNREACHABLE')
  const [note, setNote] = useState('')
  const { submitting, error, run } = useSubmit(async () => {
    await updateFulfillmentStatusApi(order.orderId, 'DELIVERY_FAILED', { failureReason: reason, note: note.trim() })
    return `Đã ghi nhận giao thất bại cho đơn #${order.orderId}. Có thể giao lại hoặc hủy đơn.`
  }, onDone)

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Giao thất bại · Đơn #${order.orderId}`} maxWidth="max-w-md">
      <form onSubmit={(event) => { event.preventDefault(); run(() => (note.trim().length < 3 ? 'Vui lòng mô tả sự việc (tối thiểu 3 ký tự).' : null)) }} className="grid gap-4">
        <div className="grid gap-2" role="radiogroup" aria-label="Nguyên nhân">
          {DELIVERY_FAILURE_REASONS.map((option) => (
            <label key={option.value} className={`flex items-center gap-3 border px-3 py-2.5 text-sm ${reason === option.value ? 'border-[#6f1d32] bg-[#6f1d32]/5' : 'border-[var(--moc-line)] bg-white'}`}>
              <input type="radio" name="failure" checked={reason === option.value} onChange={() => setReason(option.value)} className="h-4 w-4 accent-[#6f1d32]" />{option.label}
            </label>
          ))}
        </div>
        <label className={labelClass}>Mô tả<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Ví dụ: Tài xế gọi 3 lần lúc 12:40, khách không nghe máy" className={areaClass} /></label>
        <p className="text-sm text-[#625a55]">Đơn tiền mặt chưa thu sẽ không được ghi là đã thanh toán.</p>
        <ErrorLine error={error} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" variant="danger" icon={PackageX} isLoading={submitting}>Ghi nhận giao thất bại</Button>
        </div>
      </form>
    </Modal>
  )
}

/** Bàn giao đơn tự lấy (DLV-07): đúng mã nhận hàng hoặc đúng SĐT đặt đơn; ghi tên người lấy hộ. */
export const PickupHandoffModal = ({ order, onClose, onDone }) => {
  const [pickupCode, setPickupCode] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const [collectedBy, setCollectedBy] = useState('')
  const cashDue = order.payment?.paymentMethod === 'CASH' && Number(order.money?.outstanding || 0) > 0
  const { submitting, error, run } = useSubmit(async () => {
    await updateFulfillmentStatusApi(order.orderId, 'COLLECTED', {
      pickupCode: pickupCode.trim() || null,
      verifiedPhone: verifiedPhone.trim() || null,
      collectedBy: collectedBy.trim() || null,
    })
    return `Khách đã nhận đơn #${order.orderId}. Đơn hoàn tất.`
  }, onDone)

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Bàn giao đơn #${order.orderId}`} maxWidth="max-w-md">
      <form onSubmit={(event) => { event.preventDefault(); run(() => (!pickupCode.trim() && !verifiedPhone.trim() ? 'Nhập mã nhận hàng khách đọc hoặc số điện thoại đặt đơn.' : null)) }} className="grid gap-4">
        <p className="text-sm text-[#625a55]">Hỏi khách mã nhận hàng 4 số trên đơn. Nếu khách không có mã, đối chiếu số điện thoại đặt đơn ({order.recipientPhone ? `•••${String(order.recipientPhone).slice(-3)}` : 'không có'}).</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>Mã nhận hàng<input value={pickupCode} onChange={(event) => setPickupCode(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="4 số" className={`${fieldClass} font-mono tracking-[0.3em]`} /></label>
          <label className={labelClass}>Hoặc SĐT đặt đơn<input value={verifiedPhone} onChange={(event) => setVerifiedPhone(event.target.value)} inputMode="tel" placeholder="09xx..." className={fieldClass} /></label>
        </div>
        <label className={labelClass}>Người lấy hộ (nếu không phải người đặt)<input value={collectedBy} onChange={(event) => setCollectedBy(event.target.value)} maxLength={100} placeholder="Họ tên người nhận thay" className={fieldClass} /></label>
        {cashDue && <p className="text-sm font-semibold text-amber-900">Đơn tiền mặt: thu {formatCurrency(order.money.outstanding)} trước khi bàn giao. Hệ thống ghi nhận khoản thu khi xác nhận.</p>}
        <ErrorLine error={error} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" icon={PackageCheck} isLoading={submitting}>Xác nhận đã bàn giao</Button>
        </div>
      </form>
    </Modal>
  )
}

/** Hủy đơn có lý do và quyết định về tiền đã thu (DLV-02/04/05/06). */
export const CancelOrderModal = ({ order, onClose, onDone }) => {
  const actions = order.availableActions || {}
  const paid = Number(order.money?.amountPaid || 0)
  const defaultType = actions.canMarkPickupNoShow ? 'PICKUP_NO_SHOW' : order.fulfillmentStatus === 'DELIVERY_FAILED' ? 'DELIVERY_FAILED' : 'CUSTOMER_REQUEST'
  const [reasonType, setReasonType] = useState(defaultType)
  const [reason, setReason] = useState('')
  const [moneyDecision, setMoneyDecision] = useState('REFUND_DUE')
  const typeOptions = CANCEL_REASON_TYPES.filter((option) => option.value !== 'PICKUP_NO_SHOW' || actions.canMarkPickupNoShow)
  const { submitting, error, run } = useSubmit(async () => {
    await cancelAdminOrderApi(order.orderId, reason.trim(), { reasonType, moneyDecision: paid > 0 ? moneyDecision : null })
    return paid > 0 && moneyDecision === 'REFUND_DUE'
      ? `Đã hủy đơn #${order.orderId}. Cần ghi nhận hoàn ${formatCurrency(paid)} tại mục Thanh toán.`
      : `Đã hủy đơn #${order.orderId}.`
  }, onDone)

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Hủy đơn #${order.orderId}`} maxWidth="max-w-lg">
      <form onSubmit={(event) => { event.preventDefault(); run(() => (reason.trim().length < 5 ? 'Lý do hủy tối thiểu 5 ký tự (khách sẽ thấy lý do này).' : null)) }} className="grid gap-4">
        <label className={labelClass}>
          Loại lý do
          <select value={reasonType} onChange={(event) => setReasonType(event.target.value)} className={fieldClass}>
            {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className={labelClass}>Lý do gửi khách<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Ví dụ: Địa chỉ ngoài bán kính giao 7km, đã gọi báo khách" className={areaClass} /></label>
        {paid > 0 && (
          <fieldset className="grid gap-2">
            <legend className="text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">Khách đã trả {formatCurrency(paid)}</legend>
            <label className="flex items-start gap-3 text-sm"><input type="radio" name="money" checked={moneyDecision === 'REFUND_DUE'} onChange={() => setMoneyDecision('REFUND_DUE')} className="mt-1 h-4 w-4 accent-[#6f1d32]" />Phải hoàn tiền cho khách (mặc định)</label>
            <label className={`flex items-start gap-3 text-sm ${actions.canRetainMoney ? '' : 'opacity-50'}`}>
              <input type="radio" name="money" disabled={!actions.canRetainMoney} checked={moneyDecision === 'RETAINED'} onChange={() => setMoneyDecision('RETAINED')} className="mt-1 h-4 w-4 accent-[#6f1d32]" />
              Giữ tiền — chỉ khi khách không đến lấy quá hạn hoặc từ chối/không liên lạc được khi giao
            </label>
          </fieldset>
        )}
        <ErrorLine error={error} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" variant="danger" icon={Ban} isLoading={submitting}>Hủy đơn</Button>
        </div>
      </form>
    </Modal>
  )
}

/** Sửa người nhận/SĐT/địa chỉ trước khi giao cho tài xế (DLV-01), có lý do và lưu lịch sử. */
export const RecipientModal = ({ order, onClose, onDone }) => {
  const [recipientName, setRecipientName] = useState(order.recipientName || '')
  const [recipientPhone, setRecipientPhone] = useState(order.recipientPhone || '')
  const [shippingAddress, setShippingAddress] = useState(order.shippingAddress || '')
  const [reason, setReason] = useState('')
  const { submitting, error, run } = useSubmit(async () => {
    const payload = { reason: reason.trim() }
    if (recipientName.trim() !== (order.recipientName || '')) payload.recipientName = recipientName.trim()
    if (recipientPhone.trim() !== (order.recipientPhone || '')) payload.recipientPhone = recipientPhone.trim()
    if (order.fulfillmentType === 'DELIVERY' && shippingAddress.trim() !== (order.shippingAddress || '')) payload.shippingAddress = shippingAddress.trim()
    await updateOrderRecipientApi(order.orderId, payload)
    return `Đã cập nhật thông tin người nhận đơn #${order.orderId}.`
  }, onDone)

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Sửa người nhận · Đơn #${order.orderId}`} maxWidth="max-w-lg">
      <form onSubmit={(event) => { event.preventDefault(); run(() => (reason.trim().length < 3 ? 'Nhập lý do thay đổi (tối thiểu 3 ký tự).' : null)) }} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>Người nhận<input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} maxLength={100} className={fieldClass} /></label>
          <label className={labelClass}>Số điện thoại<input value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} inputMode="tel" className={fieldClass} /></label>
        </div>
        {order.fulfillmentType === 'DELIVERY' && <label className={labelClass}>Địa chỉ giao<input value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} maxLength={255} className={fieldClass} /></label>}
        <label className={labelClass}>Lý do<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} placeholder="Ví dụ: Khách gọi đổi sang địa chỉ công ty" className={fieldClass} /></label>
        <ErrorLine error={error} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" icon={UserRoundPen} isLoading={submitting}>Lưu thay đổi</Button>
        </div>
      </form>
    </Modal>
  )
}
