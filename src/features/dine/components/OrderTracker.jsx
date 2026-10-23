import { Check, ChefHat, Clock3, Flame, HandPlatter, Send, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { formatWait, minutesSince } from '../../../lib/useNow'
import { FALLBACK_DISH_IMAGE, ITEM_STATUS_META, TRACK_STEPS, formatClock } from '../constants'

const STEP_ICONS = [Send, Flame, Check, HandPlatter]
const WORKING = ['SENT', 'QUEUED', 'PREPARING']

const StepTrack = ({ status }) => {
  const step = ITEM_STATUS_META[status]?.step ?? 0
  if (step < 0) return null
  return (
    <ol className="mt-3 grid grid-cols-4 gap-1" aria-label="Tiến độ món">
      {TRACK_STEPS.map((trackStep, index) => {
        const Icon = STEP_ICONS[index]
        const done = index < step
        const current = index === step
        return (
          <li key={trackStep.key} className="flex flex-col items-center gap-1.5 text-center">
            <span className="relative flex w-full items-center">
              <span className={`h-1 flex-1 rounded-full ${index === 0 ? 'opacity-0' : done || current ? 'bg-[#6f1d32]' : 'bg-[#e4d9cc]'}`} />
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : current ? 'border-[#6f1d32] bg-[#fffdf8] text-[#6f1d32]' : 'border-[#e4d9cc] bg-[#fffdf8] text-[#a59a90]'}`}>
                <Icon className={`h-4 w-4 ${current && status === 'PREPARING' ? 'animate-pulse' : ''}`} />
              </span>
              <span className={`h-1 flex-1 rounded-full ${index === TRACK_STEPS.length - 1 ? 'opacity-0' : done ? 'bg-[#6f1d32]' : 'bg-[#e4d9cc]'}`} />
            </span>
            <span className={`text-xs leading-4 ${current ? 'font-bold text-[#211b18]' : 'text-[#625a55]'}`}>{trackStep.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

const TrackedItem = ({ item, sentAt, now, sla }) => {
  const meta = ITEM_STATUS_META[item.status] || ITEM_STATUS_META.SENT
  const working = WORKING.includes(item.status)
  const waited = minutesSince(sentAt, now)
  const isLate = working && waited >= sla.lateMinutes
  const isSlow = working && !isLate && waited >= sla.warningMinutes

  return (
    <li className="py-4">
      <div className="flex gap-3">
        <img src={item.imageUrl || FALLBACK_DISH_IMAGE} alt="" onError={(event) => { event.currentTarget.src = FALLBACK_DISH_IMAGE }} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[15px] font-semibold leading-5 text-[#211b18]"><span className="text-[#6f1d32]">{item.quantity}×</span> {item.dishName}</h4>
            <span key={item.status} className={`moc-pop shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
          </div>
          {item.note && <p className="mt-1 text-sm text-[#625a55]">“{item.note}”</p>}
          {working && (
            <p className={`mt-1.5 flex items-center gap-1.5 text-sm ${isLate ? 'font-semibold text-[#8a1c1c]' : isSlow ? 'text-[#6b4a12]' : 'text-[#625a55]'}`}>
              {isLate || isSlow ? <TriangleAlert className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
              {item.status === 'PREPARING' ? 'Đang được chuẩn bị' : 'Chờ bếp nhận'} · {formatWait(waited).toLowerCase()}
              {isLate && ' · lâu hơn thường lệ'}
            </p>
          )}
          {item.status === 'READY' && <p className="mt-1.5 text-sm font-semibold text-[#14532d]">Món đã xong, nhân viên đang mang ra bàn.</p>}
          {['CANCELLED', 'REJECTED'].includes(item.status) && (
            <p className="mt-1.5 text-sm text-[#8a1c1c]">
              {item.cancelReason ? `${item.cancelReason} · ` : ''}{item.billedQuantity > 0 ? 'vẫn tính tiền theo quy định' : 'không tính tiền'}
            </p>
          )}
          {item.lineType === 'REMAKE' && <p className="mt-1.5 text-sm text-[#6b4a12]">Bếp làm lại món này cho bạn, không tính thêm tiền.</p>}
        </div>
      </div>
      <StepTrack status={item.status} />
    </li>
  )
}

/** Timeline theo lượt gọi món: mỗi món có thanh tiến độ 4 bước và đồng hồ chờ. */
export const OrderTracker = ({ rounds, summary, now, sla, onBrowseMenu }) => {
  if (!rounds?.length) {
    return (
      <section className="rounded-[28px] border border-dashed border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center">
        <UtensilsCrossed className="mx-auto h-10 w-10 text-[#6f1d32]" />
        <h2 className="mt-4 moc-serif text-2xl font-medium text-[#211b18]">Chưa có món nào</h2>
        <p className="mt-2 text-[15px] leading-6 text-[#625a55]">Món bạn gửi bếp sẽ hiện ở đây kèm trạng thái chế biến theo thời gian thực.</p>
        <button type="button" onClick={onBrowseMenu} className="moc-inverse mt-5 min-h-12 rounded-full bg-[#6f1d32] px-6 text-[15px] font-semibold text-[#fff8ed]">Xem thực đơn</button>
      </section>
    )
  }

  return (
    <section aria-labelledby="dine-tracker-title">
      <span className="moc-eyebrow">THEO DÕI TRỰC TIẾP</span>
      <h2 id="dine-tracker-title" className="mt-2 moc-serif text-3xl font-medium text-[#211b18]">Món của bàn</h2>
      {summary && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Đang làm', value: summary.inKitchenCount, icon: ChefHat },
            { label: 'Hoàn thành', value: summary.readyCount, icon: Check },
            { label: 'Đã phục vụ', value: summary.servedCount, icon: HandPlatter },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-[var(--moc-line)] bg-[#fffdf8] px-2 py-3">
              <Icon className="mx-auto h-4 w-4 text-[#6f1d32]" />
              <strong key={value} className="moc-pop mt-1 block moc-serif text-2xl text-[#211b18]">{value}</strong>
              <span className="text-xs text-[#625a55]">{label}</span>
            </div>
          ))}
        </div>
      )}
      <ol className="mt-5 space-y-4">
        {[...rounds].reverse().map((round) => (
          <li key={`${round.roundNumber}-${round.sentAt}`} className="moc-fade-in rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8] px-4 pt-4 shadow-[0_10px_30px_rgba(65,29,23,0.05)]">
            <header className="flex items-center justify-between gap-2 border-b border-[var(--moc-line)] pb-3">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#6f1d32]">LƯỢT #{round.roundNumber}</p>
                <p className="mt-0.5 text-sm text-[#625a55]">{round.isMine ? 'Bạn gọi' : round.source === 'TABLE_QR' ? 'Khách cùng bàn gọi' : 'Nhân viên gọi giúp'}{round.sentAt && ` lúc ${formatClock(round.sentAt)}`}</p>
              </div>
              <span className="rounded-full bg-[#f1e9de] px-3 py-1 text-xs font-semibold text-[#3d2f2a]">{round.source === 'TABLE_QR' ? 'QR tại bàn' : 'Tại quầy'}</span>
            </header>
            <ul className="divide-y divide-[var(--moc-line)]">
              {round.items.map((item) => <TrackedItem key={item.lineId} item={item} sentAt={round.sentAt} now={now} sla={sla} />)}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default OrderTracker
