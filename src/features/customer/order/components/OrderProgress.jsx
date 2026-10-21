import { Check, CircleX } from 'lucide-react'

const KITCHEN_ORDER = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED']

const STEPS = {
  DELIVERY: [
    { key: 'PLACED', label: 'Đã đặt' },
    { key: 'CONFIRMED', label: 'Nhà hàng xác nhận' },
    { key: 'PREPARING', label: 'Bếp chế biến' },
    { key: 'READY', label: 'Chờ tài xế' },
    { key: 'OUT_FOR_DELIVERY', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Đã nhận hàng' },
  ],
  PICKUP: [
    { key: 'PLACED', label: 'Đã đặt' },
    { key: 'CONFIRMED', label: 'Nhà hàng xác nhận' },
    { key: 'PREPARING', label: 'Bếp chế biến' },
    { key: 'READY', label: 'Sẵn sàng để lấy' },
    { key: 'COLLECTED', label: 'Đã nhận món' },
  ],
  DINE_IN: [
    { key: 'PLACED', label: 'Gọi món' },
    { key: 'PREPARING', label: 'Bếp chế biến' },
    { key: 'READY', label: 'Món sẵn sàng' },
    { key: 'SERVED', label: 'Đã phục vụ' },
  ],
}

/** Xác định bước hiện tại từ trạng thái bếp (status) và trạng thái giao nhận (fulfillmentStatus). */
const currentStepIndex = (order, steps) => {
  const keys = steps.map((step) => step.key)
  const handoffIndex = keys.indexOf(order.fulfillmentStatus)
  if (handoffIndex >= 0) return handoffIndex
  if (order.status === 'COMPLETED') return keys.length - 1
  if (order.status === 'READY') return keys.indexOf('READY')
  const kitchenIndex = KITCHEN_ORDER.indexOf(order.status)
  for (let index = kitchenIndex; index >= 1; index -= 1) {
    const position = keys.indexOf(KITCHEN_ORDER[index])
    if (position >= 0) return position
  }
  return 0
}

export const OrderProgress = ({ order, compact = false }) => {
  if (order.status === 'CANCELLED') {
    return (
      <p className="flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800">
        <CircleX className="h-4 w-4 shrink-0" /> Đơn hàng đã hủy
      </p>
    )
  }

  const steps = STEPS[order.fulfillmentType] || STEPS.DELIVERY
  const activeIndex = currentStepIndex(order, steps)
  const isDone = activeIndex === steps.length - 1

  return (
    <ol className={`grid gap-2 ${compact ? 'grid-cols-1' : 'sm:grid-flow-col sm:auto-cols-fr'}`} aria-label="Tiến độ đơn hàng">
      {steps.map((step, index) => {
        const reached = index <= activeIndex
        const current = index === activeIndex && !isDone
        return (
          <li key={step.key} aria-current={current ? 'step' : undefined} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span className="flex items-center gap-2 w-full">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${reached ? 'moc-inverse bg-[#6f1d32] text-white' : 'border border-[var(--moc-line)] bg-white text-[#625a55]'} ${current ? 'ring-4 ring-[#6f1d32]/15' : ''}`}>
                {reached && !current ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {!compact && index < steps.length - 1 && <span className={`hidden sm:block h-0.5 flex-1 ${index < activeIndex ? 'bg-[#6f1d32]' : 'bg-[var(--moc-line)]'}`} />}
            </span>
            <span className={`text-sm ${current ? 'font-bold text-[#6f1d32]' : reached ? 'font-semibold text-[#211b18]' : 'text-[#625a55]'}`}>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default OrderProgress
