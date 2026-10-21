import { Clock3, MessageSquareText, Store, Truck, UtensilsCrossed } from 'lucide-react'
import { KITCHEN_NEXT_ACTION, KITCHEN_STATUS_META } from '../constants'

const elapsedMinutes = (orderedAt) => (orderedAt ? Math.max(0, Math.floor((Date.now() - new Date(orderedAt).getTime()) / 60000)) : 0)
const formatElapsed = (minutes) => (minutes < 60 ? `${minutes} phút` : `${Math.floor(minutes / 60)}g ${minutes % 60}p`)
const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const sourceOf = (item) => {
  if (item.fulfillmentType === 'DELIVERY') return { icon: Truck, label: `GIAO HÀNG · #${item.orderId}`, detail: item.recipientName }
  if (item.fulfillmentType === 'PICKUP') return { icon: Store, label: `TỰ ĐẾN LẤY · #${item.orderId}`, detail: item.scheduledAt ? `Hẹn ${formatTime(item.scheduledAt)} · ${item.recipientName || ''}` : `Lấy sớm nhất · ${item.recipientName || ''}` }
  return { icon: UtensilsCrossed, label: item.tableNames?.length ? item.tableNames.join(' + ') : `PHIÊN #${item.sessionId}`, detail: `Order #${item.orderId}` }
}

export const KitchenCard = ({ item, onAdvance, busy }) => {
  const meta = KITCHEN_STATUS_META[item.status]
  const isOnline = item.fulfillmentType && item.fulfillmentType !== 'DINE_IN'
  const nextAction = isOnline && item.status === 'READY' ? null : KITCHEN_NEXT_ACTION[item.status]
  const source = sourceOf(item)
  const SourceIcon = source.icon
  const minutes = elapsedMinutes(item.orderedAt)
  const isLate = minutes >= 20 && !['READY', 'SERVED'].includes(item.status)

  return (
    <article className={`bg-[#fffdf8] border p-4 shadow-sm ${isLate ? 'border-[#6f1d32]/60' : 'border-[var(--moc-line)]'} ${item.status === 'SERVED' ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.06em] text-[#6f1d32]"><SourceIcon className="h-3.5 w-3.5 shrink-0" />{source.label}</span>
          {source.detail && <p className="mt-1 truncate text-xs text-[#625a55]">{source.detail}</p>}
        </div>
        <span className={`shrink-0 px-2 py-1 text-xs font-bold ${meta?.tone}`}>{meta?.label}</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 grid place-items-center bg-[#251b19] text-white moc-inverse moc-serif text-xl">{item.quantity}</span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-6">{item.dishName}</h3>
          {item.note && <p className="mt-2 flex gap-2 text-sm leading-5 text-[#6f1d32]"><MessageSquareText className="w-4 h-4 shrink-0 mt-0.5" />{item.note}</p>}
          {isOnline && item.orderNote && <p className="mt-2 text-sm leading-5 text-[#625a55]">Ghi chú đơn: {item.orderNote}</p>}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--moc-line)] flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 text-xs ${isLate ? 'font-bold text-[#6f1d32]' : 'text-[#625a55]'}`}><Clock3 className="w-4 h-4" />{item.orderedAt ? formatElapsed(minutes) : 'Vừa nhận'}{isLate ? ' · trễ' : ''}</span>
        {nextAction && <button type="button" onClick={() => onAdvance(item, nextAction.status)} disabled={busy} className="min-h-10 px-3 bg-[#6f1d32] text-white moc-inverse text-xs font-bold tracking-[0.05em] hover:bg-[#49101f] disabled:opacity-50">{busy ? 'ĐANG LƯU' : nextAction.label}</button>}
        {isOnline && item.status === 'READY' && <span className="text-xs font-semibold text-[#625a55]">Chờ bàn giao tại quầy</span>}
      </div>
    </article>
  )
}

export default KitchenCard
