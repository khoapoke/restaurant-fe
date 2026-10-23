import { Ban, Clock3, MessageSquareText, QrCode, Store, Truck, Undo2, UtensilsCrossed } from 'lucide-react'
import { KITCHEN_NEXT_ACTION, KITCHEN_STATUS_META, kitchenSlaLevel } from '../constants'

const formatElapsed = (minutes) => (minutes < 1 ? 'Vừa gửi' : minutes < 60 ? `${minutes} phút` : `${Math.floor(minutes / 60)}g ${minutes % 60}p`)
const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const SLA_META = {
  normal: { card: 'border-[var(--moc-line)]', clock: 'text-[#625a55]', label: '' },
  warning: { card: 'border-[#b7791f]/70', clock: 'font-bold text-[#6b4a12]', label: ' · sắp trễ' },
  late: { card: 'border-[#b42318]/70 ring-1 ring-[#b42318]/30', clock: 'font-bold text-[#8a1c1c]', label: ' · đã trễ' },
}

const sourceOf = (item) => {
  if (item.fulfillmentType === 'DELIVERY') return { icon: Truck, label: `GIAO HÀNG · #${item.orderId}`, detail: item.recipientName }
  if (item.fulfillmentType === 'PICKUP') return { icon: Store, label: `TỰ ĐẾN LẤY · #${item.orderId}`, detail: item.scheduledAt ? `Hẹn ${formatTime(item.scheduledAt)} · ${item.recipientName || ''}` : `Lấy sớm nhất · ${item.recipientName || ''}` }
  const tables = item.tableNames?.length ? item.tableNames.join(' + ') : `PHIÊN #${item.sessionId}`
  if (item.source === 'TABLE_QR') return { icon: QrCode, label: `QR ${tables}`, detail: `Khách tự gọi · Order #${item.orderId}` }
  return { icon: UtensilsCrossed, label: tables, detail: `POS · Order #${item.orderId}` }
}

export const KitchenCard = ({ item, now, sla, onAdvance, onReject, onUndo, busy, isNew }) => {
  const meta = KITCHEN_STATUS_META[item.status]
  const isOnline = item.fulfillmentType && item.fulfillmentType !== 'DINE_IN'
  const nextAction = isOnline && item.status === 'READY' ? null : KITCHEN_NEXT_ACTION[item.status]
  const source = sourceOf(item)
  const SourceIcon = source.icon
  const startedAt = item.sentAt || item.orderedAt
  const minutes = startedAt ? Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000)) : 0
  const level = kitchenSlaLevel(item, minutes, sla)
  const slaMeta = SLA_META[level]
  const canReject = ['SENT', 'QUEUED', 'PREPARING'].includes(item.status)
  const undoSeconds = item.canUndo && item.undoUntil ? Math.max(0, Math.round((new Date(item.undoUntil).getTime() - now) / 1000)) : 0

  return (
    <article className={`bg-[#fffdf8] border p-4 shadow-sm transition-colors ${slaMeta.card} ${item.status === 'SERVED' ? 'opacity-75' : ''} ${isNew ? 'moc-fade-in' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.06em] ${item.source === 'TABLE_QR' ? 'text-[#1f4f7a]' : 'text-[#6f1d32]'}`}><SourceIcon className="h-3.5 w-3.5 shrink-0" />{source.label}</span>
          {source.detail && <p className="mt-1 truncate text-xs text-[#625a55]">{source.detail}</p>}
        </div>
        <span key={item.status} className={`moc-pop shrink-0 px-2 py-1 text-xs font-bold ${meta?.tone}`}>{busy ? 'Đang lưu...' : meta?.label}</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 grid place-items-center bg-[#251b19] text-white moc-inverse moc-serif text-xl">{item.quantity}</span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-6">{item.dishName}</h3>
          {item.note && <p className="mt-2 flex gap-2 text-sm leading-5 text-[#6f1d32]"><MessageSquareText className="w-4 h-4 shrink-0 mt-0.5" />{item.note}</p>}
          {isOnline && item.orderNote && <p className="mt-2 text-sm leading-5 text-[#625a55]">Ghi chú đơn: {item.orderNote}</p>}
          {item.lineType === 'REMAKE' && <p className="mt-2 inline-flex bg-[#f3e6c8] px-2 py-0.5 text-xs font-bold text-[#6b4a12]">Làm lại · {item.voidReason ? 'do lỗi nhà hàng' : 'không tính tiền'}</p>}
          {item.lineType === 'EXCHANGE' && <p className="mt-2 inline-flex bg-[#f3e6c8] px-2 py-0.5 text-xs font-bold text-[#6b4a12]">Món đổi cho khách</p>}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--moc-line)] flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 text-xs ${slaMeta.clock}`} title={`Bình thường dưới ${sla.warningMinutes} phút, trễ từ ${sla.lateMinutes} phút`}>
          <Clock3 className="w-4 h-4" />{formatElapsed(minutes)}{slaMeta.label}
        </span>
        {nextAction && <button type="button" onClick={() => onAdvance(item, nextAction.status)} disabled={busy} className="min-h-11 px-3 bg-[#6f1d32] text-white moc-inverse text-xs font-bold tracking-[0.05em] hover:bg-[#49101f] disabled:opacity-50">{nextAction.label}</button>}
        {isOnline && item.status === 'READY' && <span className="text-xs font-semibold text-[#625a55]">Chờ bàn giao tại quầy</span>}
      </div>
      {(canReject || undoSeconds > 0) && (
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          {undoSeconds > 0 && <button type="button" onClick={() => onUndo(item)} disabled={busy} className="min-h-9 inline-flex items-center gap-1.5 border border-[var(--moc-line)] px-2.5 text-xs font-semibold text-[#211b18] hover:border-[#6f1d32]/40 disabled:opacity-50"><Undo2 className="h-3.5 w-3.5" />Hoàn tác ({undoSeconds}s)</button>}
          {canReject && <button type="button" onClick={() => onReject(item)} disabled={busy} className="min-h-9 inline-flex items-center gap-1.5 border border-red-200 px-2.5 text-xs font-semibold text-[#8a1c1c] hover:bg-red-50 disabled:opacity-50"><Ban className="h-3.5 w-3.5" />Không làm được</button>}
        </div>
      )}
    </article>
  )
}

export default KitchenCard
