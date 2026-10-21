import { Heart, Printer, RotateCcw } from 'lucide-react'
import { Receipt } from './BillPanel'

/** Phiên đã đóng: lời cảm ơn, hóa đơn điện tử, in/lưu và bắt đầu lượt mới. */
export const MealComplete = ({ state, onStartOver }) => {
  const { invoice, table, session, entry } = state
  const cancelled = session?.status === 'CANCELLED'

  return (
    <section className="space-y-5" aria-labelledby="dine-complete-title">
      <div className="moc-inverse moc-fade-in overflow-hidden rounded-[28px] bg-[#49101f] bg-[radial-gradient(circle_at_85%_0%,rgba(232,196,138,0.35),transparent_45%),linear-gradient(135deg,#49101f,#6f1d32)] p-7 text-center text-[#fff8ed]">
        <Heart className="mx-auto h-10 w-10 text-[#e8c48a]" />
        <h2 id="dine-complete-title" className="mt-4 moc-serif text-4xl font-medium leading-tight">{cancelled ? 'Phiên phục vụ đã kết thúc' : 'Bữa ăn đã hoàn tất'}</h2>
        <p className="mt-3 text-[15px] leading-6 text-[#fff8ed]/85">
          {cancelled ? 'Nhân viên đã đóng phiên của bàn. Nếu cần hỗ trợ, hãy gọi nhân viên gần nhất.' : `Cảm ơn bạn đã dùng bữa tại Mộc. Hẹn gặp lại bạn ở ${table.tableName}!`}
        </p>
      </div>

      {invoice && <Receipt invoice={invoice} tableName={table.tableName} />}

      <div className="grid gap-3 sm:grid-cols-2">
        {invoice?.status === 'PAID' && (
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#6f1d32]/35 text-[15px] font-semibold text-[#6f1d32]">
            <Printer className="h-4 w-4" /> In hoặc lưu hóa đơn
          </button>
        )}
        <button type="button" onClick={onStartOver} className="moc-inverse inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#6f1d32] text-[15px] font-semibold text-[#fff8ed]">
          <RotateCcw className="h-4 w-4" /> {entry?.hasActiveSession ? 'Tham gia lượt phục vụ mới' : 'Bắt đầu lượt mới'}
        </button>
      </div>
    </section>
  )
}

export default MealComplete
