import { Clock3, UsersRound } from 'lucide-react'
import { TABLE_STATUS_META, TableStatus } from '../constants'

const formatDuration = (openedAt) => {
  if (!openedAt) return null
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000))
  if (minutes < 60) return `${minutes} phút`
  return `${Math.floor(minutes / 60)}g ${minutes % 60}p`
}

export const TableCard = ({ table, onOpen, onContinue, onCompleteCleaning, cleaning }) => {
  const meta = TABLE_STATUS_META[table.status] || TABLE_STATUS_META[TableStatus.MAINTENANCE]
  const canOpen = table.status === TableStatus.AVAILABLE
  const canContinue = table.status === TableStatus.OCCUPIED && table.activeSession
  const canCompleteCleaning = table.status === TableStatus.CLEANING

  return (
    <article className={`min-h-56 p-5 border ${meta.card} flex flex-col transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm leading-6 text-[#766e68]">{table.location || 'Chưa cập nhật khu vực'}</p>
          <h3 className="mt-2 moc-serif text-2xl font-medium">{table.tableName}</h3>
        </div>
        <span className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white/75 border border-black/5 text-sm font-semibold">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-[#766e68]">
        <UsersRound className="w-4 h-4" /> Tối đa {table.capacity} khách
      </div>

      {table.activeSession && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-2 text-sm text-[#766e68]">
          <p className="flex items-center justify-between gap-2"><span>Phiên #{table.activeSession.sessionId}</span><strong>{table.activeSession.guestCount} khách</strong></p>
          <p className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5" /> {formatDuration(table.activeSession.openedAt)} · {table.activeSession.staffName}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => canOpen ? onOpen(table) : canContinue ? onContinue(table) : canCompleteCleaning && onCompleteCleaning(table)}
        disabled={(!canOpen && !canContinue && !canCompleteCleaning) || cleaning}
        className={`mt-auto min-h-11 px-4 text-sm font-bold tracking-[0.04em] transition-colors ${
          canOpen || canContinue || canCompleteCleaning
            ? 'moc-inverse bg-[#6f1d32] text-white hover:bg-[#49101f]'
            : 'bg-black/5 text-[#766e68] cursor-not-allowed'
        }`}
      >
        {cleaning ? 'ĐANG CẬP NHẬT...' : canOpen ? 'MỞ PHIÊN PHỤC VỤ' : canContinue ? 'TIẾP TỤC PHIÊN' : canCompleteCleaning ? 'ĐÃ VỆ SINH · MỞ LẠI BÀN' : meta.label.toUpperCase()}
      </button>
    </article>
  )
}

export default TableCard
