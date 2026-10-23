import { useMemo, useState } from 'react'
import { BadgeCheck, Ban, ChefHat, Repeat2, ScissorsLineDashed, ShieldAlert } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { apiErrorMessage } from '../../../../lib/apiError'
import { COOKED_STATUSES, KITCHEN_STATUS_META, REMAKE_REASONS, VOID_REASONS, formatMoney } from '../constants'
import {
  createApprovalApi,
  exchangeOrderItemApi,
  remakeOrderItemApi,
  splitOrderItemApi,
  voidOrderItemApi,
  waiveOrderItemApi,
} from '../services/posService'

const fieldClass = 'min-h-11 w-full border border-[var(--moc-line)] bg-white px-3 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'
const labelClass = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]'

/** Các thao tác áp dụng được cho một món đã gửi bếp (ADR-024). */
const availableActions = (item, isAdmin) => {
  const status = item.kitchenStatus
  const withdrawn = ['CANCELLED', 'REJECTED'].includes(status)
  const actions = []
  if (!withdrawn) actions.push('void')
  if (['READY', 'SERVED', 'CANCELLED', 'REJECTED'].includes(status) && item.lineType !== 'REMAKE') actions.push('remake')
  if (['SENT', 'QUEUED', 'PREPARING', 'READY', 'SERVED'].includes(status)) actions.push('exchange')
  if (!withdrawn && item.quantity > 1) actions.push('split')
  if (isAdmin && !withdrawn && !item.waived && item.billedQuantity > 0) actions.push('waive')
  return actions
}

const ACTION_META = {
  void: { label: 'Hủy món', icon: Ban },
  remake: { label: 'Làm lại', icon: ChefHat },
  exchange: { label: 'Đổi món', icon: Repeat2 },
  split: { label: 'Tách dòng', icon: ScissorsLineDashed },
  waive: { label: 'Miễn tiền', icon: BadgeCheck },
}

export const ItemCorrectionModal = ({ item, dishes = [], isAdmin, onClose, onDone }) => {
  const actions = useMemo(() => (item ? availableActions(item, isAdmin) : []), [item, isAdmin])
  const [action, setAction] = useState(actions[0] || 'void')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [waive, setWaive] = useState(false)
  const [dishId, setDishId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!item) return null

  const cooked = COOKED_STATUSES.includes(item.kitchenStatus)
  const needsApproval = action === 'void' && cooked && !isAdmin
  const reasonOptions = action === 'remake' ? REMAKE_REASONS : VOID_REASONS
  const selectedReason = VOID_REASONS.find((option) => option.value === reason)
  const willCharge = action === 'void' && cooked && reason === 'CUSTOMER_CHANGED_MIND' && !waive
  const meta = KITCHEN_STATUS_META[item.kitchenStatus] || KITCHEN_STATUS_META.SENT

  const validate = () => {
    if (['void', 'remake', 'exchange'].includes(action) && !reason) return 'Vui lòng chọn lý do.'
    if (['void', 'remake', 'exchange', 'waive'].includes(action) && note.trim().length < 3) return 'Vui lòng ghi rõ sự việc (tối thiểu 3 ký tự).'
    if (action === 'exchange' && !dishId) return 'Vui lòng chọn món đổi.'
    if (['void', 'split'].includes(action) && (quantity < 1 || quantity > item.quantity)) return `Số phần phải từ 1 đến ${item.quantity}.`
    if (action === 'split' && quantity >= item.quantity) return 'Số phần tách ra phải ít hơn số phần của dòng.'
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    const invalid = validate()
    if (invalid) { setError(invalid); return }
    setSubmitting(true)
    setError(null)
    try {
      const trimmed = note.trim()
      let message
      if (needsApproval) {
        await createApprovalApi({ type: 'ITEM_VOID', targetId: item.itemId, reason: trimmed, payload: { reason, quantity: quantity < item.quantity ? quantity : null } })
        message = `Đã gửi yêu cầu hủy ${item.dishName} cho quản lý duyệt.`
      } else if (action === 'void') {
        await voidOrderItemApi(item.itemId, { reason, note: trimmed, quantity: quantity < item.quantity ? quantity : null, waive: isAdmin ? waive : false })
        message = `Đã hủy ${quantity} phần ${item.dishName}.`
      } else if (action === 'remake') {
        await remakeOrderItemApi(item.itemId, { reason, note: trimmed })
        message = `Đã gửi bếp làm lại ${item.dishName} (không tính tiền).`
      } else if (action === 'exchange') {
        await exchangeOrderItemApi(item.itemId, { dishId: Number(dishId), quantity, reason, note: trimmed, waive: isAdmin ? waive : false })
        message = 'Đã đổi món. Món mới đang ở trạng thái nháp, hãy gửi bếp.'
      } else if (action === 'split') {
        await splitOrderItemApi(item.itemId, quantity)
        message = `Đã tách ${quantity} phần ${item.dishName} thành dòng riêng.`
      } else {
        await waiveOrderItemApi(item.itemId, trimmed)
        message = `Đã miễn tiền ${item.dishName}.`
      }
      onDone(message)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Xử lý món · ${item.dishName}`} maxWidth="max-w-xl">
      <form onSubmit={submit} className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#625a55]">
          <span className={`px-2 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
          <span>{item.quantity} phần · tính tiền {item.billedQuantity} phần · {formatMoney(item.subTotal)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Chọn thao tác">
          {actions.map((key) => {
            const Icon = ACTION_META[key].icon
            return (
              <button key={key} type="button" role="radio" aria-checked={action === key} onClick={() => { setAction(key); setError(null); setReason('') }}
                className={`min-h-11 inline-flex items-center justify-center gap-1.5 border px-2 text-sm font-semibold ${action === key ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : 'border-[var(--moc-line)] bg-white text-[#211b18] hover:border-[#6f1d32]/40'}`}>
                <Icon className="h-4 w-4" />{ACTION_META[key].label}
              </button>
            )
          })}
        </div>

        {needsApproval && (
          <p className="flex items-start gap-2 border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Bếp đã bắt đầu chế biến. Yêu cầu sẽ được gửi cho quản lý duyệt trên tài khoản của quản lý; món vẫn giữ nguyên cho tới khi được duyệt.
          </p>
        )}

        {['void', 'remake', 'exchange'].includes(action) && (
          <label className={labelClass}>
            Lý do
            <select value={reason} onChange={(event) => setReason(event.target.value)} className={fieldClass}>
              <option value="">Chọn lý do</option>
              {reasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}

        {action === 'exchange' && (
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <label className={labelClass}>
              Món đổi sang
              <select value={dishId} onChange={(event) => setDishId(event.target.value)} className={fieldClass}>
                <option value="">Chọn món</option>
                {dishes.filter((dish) => dish.isAvailable !== false && dish.dishId !== item.dishId).map((dish) => <option key={dish.dishId} value={dish.dishId}>{dish.dishName} · {formatMoney(dish.price)}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Số phần
              <input type="number" min="1" max="20" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className={fieldClass} />
            </label>
          </div>
        )}

        {['void', 'split'].includes(action) && item.quantity > 1 && (
          <label className={labelClass}>
            {action === 'split' ? 'Số phần tách ra' : 'Số phần hủy'}
            <input type="number" min="1" max={item.quantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className={fieldClass} />
          </label>
        )}

        {['void', 'remake', 'exchange', 'waive'].includes(action) && (
          <label className={labelClass}>
            Ghi chú sự việc
            <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} placeholder="Ví dụ: Khách báo món mặn, bếp xác nhận nêm nhầm" className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]" />
          </label>
        )}

        {isAdmin && ['void', 'exchange'].includes(action) && cooked && reason === 'CUSTOMER_CHANGED_MIND' && (
          <label className="flex items-start gap-3 text-sm text-[#211b18]">
            <input type="checkbox" checked={waive} onChange={(event) => setWaive(event.target.checked)} className="mt-1 h-4 w-4 accent-[#6f1d32]" />
            <span>Quản lý miễn tiền món này (mặc định món đã nấu mà khách đổi ý vẫn tính tiền).</span>
          </label>
        )}

        {action === 'void' && reason && (
          <p className="text-sm text-[#625a55]">
            {willCharge ? 'Món đã nấu và khách đổi ý: vẫn tính tiền phần đã hủy.' : selectedReason?.restaurantFault || !cooked ? 'Không tính tiền phần đã hủy.' : 'Không tính tiền phần đã hủy (đã miễn).'}
          </p>
        )}

        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" variant={action === 'void' ? 'danger' : 'primary'} isLoading={submitting}>
            {needsApproval ? 'Gửi quản lý duyệt' : ACTION_META[action]?.label || 'Xác nhận'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ItemCorrectionModal
