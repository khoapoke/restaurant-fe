import { Armchair, CalendarClock, CircleCheck, Sparkles, Utensils, Wrench } from 'lucide-react'

const stats = [
  { key: 'total', label: 'Tổng số bàn', icon: Armchair },
  { key: 'available', label: 'Bàn sẵn sàng', icon: CircleCheck },
  { key: 'occupied', label: 'Đang phục vụ', icon: Utensils },
  { key: 'cleaning', label: 'Chờ vệ sinh', icon: Sparkles },
  { key: 'reserved', label: 'Đã đặt trước', icon: CalendarClock },
  { key: 'maintenance', label: 'Bảo trì', icon: Wrench },
]

export const FloorSummary = ({ summary = {} }) => (
  <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 border-y border-l border-[var(--moc-line)] bg-[#fffdf8]">
    {stats.map(({ key, label, icon: Icon }) => (
      <div key={key} className="min-h-24 p-4 sm:p-5 border-r border-b xl:border-b-0 border-[var(--moc-line)] flex items-center gap-4">
        <span className="w-11 h-11 rounded-full grid place-items-center bg-[#6f1d32]/8 text-[#6f1d32]">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <strong className="moc-serif text-3xl font-medium">{summary[key] ?? 0}</strong>
          <p className="mt-1 text-sm text-[#625a55]">{label}</p>
        </div>
      </div>
    ))}
  </section>
)

export default FloorSummary
