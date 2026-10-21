import { useState } from 'react'
import { ChefHat, CircleCheck, Loader2, Minus, Plus, RefreshCw, ShoppingBag, TriangleAlert, Trash2 } from 'lucide-react'
import { formatClock } from '../constants'
import BottomSheet from './BottomSheet'
import { FALLBACK_DISH_IMAGE, MAX_NOTE_LENGTH, MAX_QUANTITY, formatVnd } from '../constants'

export const CartBar = ({ totals, onOpen, bumpKey }) => {
  if (!totals.count) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 px-4">
      <button
        key={bumpKey}
        type="button"
        onClick={onOpen}
        className="moc-bump moc-inverse pointer-events-auto mx-auto flex min-h-14 w-full max-w-xl items-center gap-3 rounded-full bg-[#211b18] py-2 pl-2 pr-5 text-[#fff8ed] shadow-[0_18px_40px_rgba(33,27,24,0.35)] transition active:scale-[0.98]"
      >
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#6f1d32]">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#e8c48a] px-1 text-xs font-bold text-[#211b18]">{totals.count}</span>
        </span>
        <span className="flex-1 text-left text-[15px] font-semibold">Xem giỏ & gửi bếp</span>
        <strong className="text-[15px]">{formatVnd(totals.amount)}</strong>
      </button>
    </div>
  )
}

/** Giỏ trước khi gửi bếp: chỉnh số lượng, ghi chú; giá chính thức do backend chốt khi gửi. */
export const CartSheet = ({ open, onClose, cart, onSubmit, submitting, error, pending = null }) => {
  const [editingNote, setEditingNote] = useState(null)

  return (
    <BottomSheet
      open={open}
      onClose={submitting ? undefined : onClose}
      title="Giỏ món của bạn"
      subtitle="Món sẽ được gửi thẳng xuống bếp. Sau khi gửi không thể sửa, bạn có thể gọi thêm lượt mới."
      labelledBy="dine-cart-title"
      footer={(cart.lines.length > 0 || pending) && (
        <div>
          {error && <p className="mb-3 rounded-2xl bg-[#fbeaea] px-4 py-3 text-sm text-[#8a1c1c]" role="alert">{error}</p>}
          {pending && <p className="mb-3 rounded-2xl bg-[#f3e7d3] px-4 py-3 text-sm text-[#6b4a12]">Lượt gửi lúc {formatClock(pending.createdAt)} ({pending.items.reduce((sum, item) => sum + item.quantity, 0)} món) chưa được bếp xác nhận. Hãy gửi lại lượt đó trước; các món trong giỏ sẽ gửi ở lượt sau.</p>}
          <div className="mb-3 flex items-center justify-between text-[15px]">
            <span className="text-[#625a55]">Tạm tính ({cart.totals.count} món)</span>
            <strong className="text-lg text-[#211b18]">{formatVnd(cart.totals.amount)}</strong>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="moc-inverse inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] px-6 text-base font-semibold text-[#fff8ed] shadow-[0_14px_30px_rgba(111,29,50,0.28)] transition active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : pending ? <RefreshCw className="h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
            {submitting ? 'Đang gửi xuống bếp...' : pending ? 'Gửi lại lượt chưa xác nhận' : 'Gửi bếp ngay'}
          </button>
        </div>
      )}
    >
      {cart.lines.length === 0 && (
        <div className="py-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#6f1d32]" />
          <p className="mt-3 text-[15px] text-[#625a55]">Giỏ đang trống. Chọn món từ thực đơn nhé.</p>
        </div>
      )}
      <ul className="divide-y divide-[var(--moc-line)]">
        {cart.lines.map((line) => (
          <li key={line.key} className="py-4">
            <div className="flex gap-3">
              <img src={line.imageUrl || FALLBACK_DISH_IMAGE} alt="" onError={(event) => { event.currentTarget.src = FALLBACK_DISH_IMAGE }} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold leading-5 text-[#211b18]">{line.dishName}</h3>
                  <strong className="shrink-0 text-[15px] text-[#211b18]">{formatVnd(line.price * line.quantity)}</strong>
                </div>
                {editingNote === line.key ? (
                  <input
                    autoFocus
                    value={line.note}
                    maxLength={MAX_NOTE_LENGTH}
                    onChange={(event) => cart.setNote(line.key, event.target.value)}
                    onBlur={() => setEditingNote(null)}
                    placeholder="Ghi chú cho bếp"
                    className="mt-2 h-11 w-full rounded-xl border border-[var(--moc-line)] bg-white px-3 text-sm outline-none focus:border-[#6f1d32]"
                  />
                ) : (
                  <button type="button" onClick={() => setEditingNote(line.key)} className="mt-1 min-h-8 text-left text-sm text-[#6f1d32] underline-offset-2 hover:underline">
                    {line.note ? `“${line.note}”` : '+ Thêm ghi chú'}
                  </button>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-[var(--moc-line)] bg-white">
                    <button type="button" onClick={() => cart.setQuantity(line.key, line.quantity - 1)} aria-label={`Giảm ${line.dishName}`} className="grid h-11 w-11 place-items-center"><Minus className="h-4 w-4" /></button>
                    <span className="w-7 text-center font-bold">{line.quantity}</span>
                    <button type="button" onClick={() => cart.setQuantity(line.key, line.quantity + 1)} disabled={line.quantity >= MAX_QUANTITY} aria-label={`Tăng ${line.dishName}`} className="grid h-11 w-11 place-items-center disabled:opacity-35"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button type="button" onClick={() => cart.setQuantity(line.key, 0)} aria-label={`Bỏ ${line.dishName}`} className="grid h-11 w-11 place-items-center rounded-full text-[#8a1c1c] hover:bg-[#fbeaea]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}

export const OrderSentOverlay = ({ round, onDone }) => {
  if (!round) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#211b18]/70 p-6 backdrop-blur-sm moc-fade-in" role="alertdialog" aria-labelledby="dine-sent-title">
      <div className="moc-pop w-full max-w-sm rounded-[32px] bg-[#fffdf8] p-7 text-center shadow-[var(--moc-shadow)]">
        <svg viewBox="0 0 56 56" className="mx-auto h-20 w-20" aria-hidden="true">
          <circle cx="28" cy="28" r="26" fill="#6f1d32" />
          <path d="M17 29l7 7 15-16" fill="none" stroke="#fff8ed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="moc-check-draw" />
        </svg>
        <p className="mt-5 text-xs font-bold tracking-[0.2em] text-[#6f1d32]">LƯỢT GỌI #{round.roundNumber}</p>
        <h2 id="dine-sent-title" className="mt-2 moc-serif text-3xl font-medium text-[#211b18]">Bếp đã nhận món</h2>
        <p className="mt-2 text-[15px] leading-6 text-[#625a55]">
          {round.replayed
            ? `Lượt này đã đến bếp từ lần gửi trước (${round.itemCount} món) — Mộc không tạo thêm món trùng.`
            : `${round.itemCount} món đang được chuẩn bị. Theo dõi từng món ngay trên trang này.`}
        </p>
        <button type="button" onClick={onDone} autoFocus className="moc-inverse mt-6 min-h-12 w-full rounded-full bg-[#6f1d32] text-[15px] font-semibold text-[#fff8ed]">Theo dõi món</button>
      </div>
    </div>
  )
}

/** Lượt món đã chốt nhưng chưa biết bếp đã nhận hay chưa (mất mạng, reload, tab khác). */
export const PendingRoundCard = ({ pending, status, error, notice, onRetry, onDismissNotice, onTrack }) => {
  if (!pending) {
    return (
      <div className="moc-fade-in flex items-start gap-3 rounded-2xl border border-[#9fcaa9] bg-[#e3f1e6] px-4 py-3 text-sm text-[#14532d]" role="status">
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="flex-1">{notice}</p>
        <button type="button" onClick={() => { onDismissNotice(); onTrack() }} className="min-h-10 shrink-0 rounded-full bg-[#fffdf8] px-3 font-semibold">Xem món</button>
      </div>
    )
  }

  const count = pending.items.reduce((sum, item) => sum + item.quantity, 0)
  const checking = status === 'sending'

  return (
    <section className="moc-fade-in rounded-[24px] border border-[#d9bd8b] bg-[#fbf4e8] p-4" aria-live="polite" aria-label="Lượt món chưa xác nhận">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-[#6b4a12]">
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <TriangleAlert className="h-4 w-4" />}
        {checking ? 'Đang kiểm tra với bếp...' : `Lượt gửi lúc ${formatClock(pending.createdAt)} chưa được xác nhận`}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-[#3d2f2a]">
        {(pending.lines || []).map((line) => <li key={line.key}>{line.quantity}× {line.dishName}{line.note ? ` · “${line.note}”` : ''}</li>)}
      </ul>
      {error && !checking && <p className="mt-2 text-sm text-[#6b4a12]">{error}</p>}
      <button type="button" onClick={onRetry} disabled={checking} className="moc-inverse mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] text-[15px] font-semibold text-[#fff8ed] disabled:opacity-60">
        <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Gửi lại an toàn ({count} món)
      </button>
      <p className="mt-2 text-xs leading-5 text-[#625a55]">Gửi lại dùng đúng mã của lượt cũ: nếu bếp đã nhận, Mộc chỉ xác nhận lại và không tạo món trùng.</p>
    </section>
  )
}

export default CartSheet
