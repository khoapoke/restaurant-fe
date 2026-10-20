import { Clock3, MessageSquareText } from 'lucide-react'
import { KITCHEN_NEXT_ACTION, KITCHEN_STATUS_META } from '../constants'

const elapsed = (orderedAt) => {
  if (!orderedAt) return 'Vừa nhận'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(orderedAt).getTime()) / 60000))
  return minutes < 60 ? `${minutes} phút` : `${Math.floor(minutes / 60)}g ${minutes % 60}p`
}

export const KitchenCard = ({ item, onAdvance, busy }) => {
  const meta = KITCHEN_STATUS_META[item.status]
  const nextAction = KITCHEN_NEXT_ACTION[item.status]

  return (
    <article className="bg-[#fffdf8] border border-[var(--moc-line)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><span className="text-xs font-bold tracking-[0.08em] text-[#6f1d32]">{item.tableNames.join(' + ') || `PHIÊN #${item.sessionId}`}</span><p className="mt-1 text-xs text-[#766e68]">Order #{item.orderId}</p></div>
        <span className={`px-2 py-1 text-[11px] font-bold ${meta?.tone}`}>{meta?.label}</span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 grid place-items-center bg-[#251b19] text-white moc-inverse moc-serif text-xl">{item.quantity}</span>
        <div><h3 className="text-lg font-semibold leading-6">{item.dishName}</h3>{item.note && <p className="mt-2 flex gap-2 text-sm leading-5 text-[#6f1d32]"><MessageSquareText className="w-4 h-4 shrink-0 mt-0.5" />{item.note}</p>}</div>
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--moc-line)] flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs text-[#766e68]"><Clock3 className="w-4 h-4" />{elapsed(item.orderedAt)}</span>
        {nextAction && <button type="button" onClick={() => onAdvance(item, nextAction.status)} disabled={busy} className="min-h-10 px-3 bg-[#6f1d32] text-white moc-inverse text-[11px] font-bold tracking-[0.05em] hover:bg-[#49101f] disabled:opacity-50">{busy ? 'ĐANG LƯU' : nextAction.label}</button>}
      </div>
    </article>
  )
}

export default KitchenCard
