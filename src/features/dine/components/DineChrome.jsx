import { useEffect } from 'react'
import { BellRing, ChefHat, ReceiptText, UtensilsCrossed, X } from 'lucide-react'

const DINE_TABS = [
  { key: 'menu', label: 'Thực đơn', icon: UtensilsCrossed },
  { key: 'track', label: 'Theo dõi', icon: ChefHat },
  { key: 'bill', label: 'Hóa đơn', icon: ReceiptText },
]

/** Thanh điều hướng đáy màn hình kiểu ứng dụng + nút gọi phục vụ. */
export const DineTabBar = ({ active, onChange, badges = {}, onService, serviceBadge = 0, serviceEnabled }) => (
  <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--moc-line)] bg-[#fffdf8]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl" aria-label="Live Dining">
    <div className="mx-auto grid h-[4.5rem] max-w-3xl grid-cols-4 px-2">
      {DINE_TABS.map(({ key, label, icon: Icon }) => {
        const selected = active === key
        return (
          <button key={key} type="button" onClick={() => onChange(key)} aria-current={selected ? 'page' : undefined} className={`relative flex flex-col items-center justify-center gap-1 text-xs font-semibold ${selected ? 'text-[#6f1d32]' : 'text-[#625a55]'}`}>
            <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${selected ? 'bg-[#6f1d32]/12' : ''}`}><Icon className="h-5 w-5" /></span>
            {label}
            {badges[key] > 0 && <span key={badges[key]} className="moc-pop moc-inverse absolute right-[18%] top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#6f1d32] px-1 text-xs font-bold text-[#fff8ed]">{badges[key]}</span>}
          </button>
        )
      })}
      <button type="button" onClick={onService} disabled={!serviceEnabled} className="relative flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#211b18] disabled:opacity-40">
        <span className="moc-inverse grid h-9 w-14 place-items-center rounded-full bg-[#211b18] text-[#fff8ed]"><BellRing className="h-5 w-5" /></span>
        Gọi phục vụ
        {serviceBadge > 0 && <span className="absolute right-[16%] top-1 h-3 w-3 rounded-full border-2 border-[#fffdf8] bg-[#d97706]" />}
      </button>
    </div>
  </nav>
)

const EventToast = ({ event, onDismiss }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(event.id), 4500)
    return () => window.clearTimeout(timer)
  }, [event.id, onDismiss])

  return (
    <li className={`moc-fade-in pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-[0_14px_30px_rgba(33,27,24,0.18)] ${event.tone === 'success' ? 'bg-[#14532d] text-[#f0fdf4]' : 'bg-[#211b18] text-[#fff8ed]'}`}>
      <span className="flex-1">{event.message}</span>
      <button type="button" onClick={() => onDismiss(event.id)} aria-label="Ẩn thông báo" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
    </li>
  )
}

/** Thông báo ngắn khi bếp/nhân viên cập nhật trạng thái (đọc bởi trình đọc màn hình). */
export const DineToasts = ({ events, onDismiss }) => (
  <ol className="pointer-events-none fixed inset-x-0 top-20 z-[65] mx-auto flex max-w-md flex-col gap-2 px-4" aria-live="polite">
    {events.map((event) => <EventToast key={event.id} event={event} onDismiss={onDismiss} />)}
  </ol>
)

export const ReconnectBanner = ({ status, onRetry }) => {
  if (!['reconnecting', 'offline'].includes(status)) return null
  return (
    <div className="moc-fade-in mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#d9bd8b] bg-[#f3e7d3] px-4 py-3 text-sm text-[#6b4a12]" role="status">
      <span>{status === 'offline' ? 'Mất kết nối tới nhà hàng. Dữ liệu đang hiển thị có thể chưa mới nhất.' : 'Kết nối chập chờn, đang thử kết nối lại...'}</span>
      <button type="button" onClick={onRetry} className="min-h-10 shrink-0 rounded-full bg-[#fffdf8] px-4 font-semibold text-[#6b4a12]">Thử lại</button>
    </div>
  )
}
