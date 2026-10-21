import { CalendarClock, Clock3, Phone, UsersRound } from 'lucide-react'
import { TABLE_STATUS_META, TableStatus } from '../constants'

const formatDuration = (openedAt) => {
  if (!openedAt) return null
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000))
  if (minutes < 60) return `${minutes} phút`
  return `${Math.floor(minutes / 60)}g ${minutes % 60}p`
}

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const SESSION_STATUS_LABEL = { OPEN: 'Đang gọi món', AWAITING_PAYMENT: 'Chờ thanh toán' }

export const TableCard = ({ table, onOpen, onSeatReservation, onContinue, onCompleteCleaning, cleaning }) => {
  const meta = TABLE_STATUS_META[table.status] || TABLE_STATUS_META[TableStatus.MAINTENANCE]
  const reservation = table.upcomingReservation
  const seatable = [TableStatus.AVAILABLE, TableStatus.RESERVED].includes(table.status)
  const canSeatReservation = seatable && reservation?.isWithinSeatingWindow
  const canOpenWalkIn = seatable && !reservation?.isWithinSeatingWindow
  const canContinue = table.status === TableStatus.OCCUPIED && table.activeSession
  const canCompleteCleaning = table.status === TableStatus.CLEANING

  const primary = canSeatReservation
    ? { label: 'NHẬN KHÁCH ĐẶT TRƯỚC', action: () => onSeatReservation(table) }
    : canContinue
      ? { label: 'TIẾP TỤC PHIÊN', action: () => onContinue(table) }
      : canCompleteCleaning
        ? { label: cleaning ? 'ĐANG CẬP NHẬT...' : 'ĐÃ VỆ SINH · MỞ LẠI BÀN', action: () => onCompleteCleaning(table) }
        : canOpenWalkIn
          ? { label: 'MỞ PHIÊN PHỤC VỤ', action: () => onOpen(table) }
          : null

  return (
    <article className={`min-h-56 p-5 border ${meta.card} flex flex-col transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm leading-6 text-[#625a55]">{table.location || 'Chưa cập nhật khu vực'}</p>
          <h3 className="mt-2 moc-serif text-2xl font-medium">{table.tableName}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 px-2.5 py-1.5 bg-white/80 border border-black/5 text-sm font-semibold">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-[#625a55]">
        <UsersRound className="w-4 h-4" /> Tối đa {table.capacity} khách
      </div>

      {table.activeSession && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-2 text-sm text-[#625a55]">
          <p className="flex items-center justify-between gap-2"><span>Phiên #{table.activeSession.sessionId} · {SESSION_STATUS_LABEL[table.activeSession.status] || table.activeSession.status}</span><strong className="text-[#211b18]">{table.activeSession.guestCount} khách</strong></p>
          <p className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5" /> {formatDuration(table.activeSession.openedAt)} · {table.activeSession.staffName}</p>
          {table.activeSession.reservationId && <p className="text-[#6f1d32] font-semibold">Khách đặt trước #{table.activeSession.reservationId}</p>}
        </div>
      )}

      {!table.activeSession && reservation && (
        <div className={`mt-4 p-3 border text-sm ${reservation.isWithinSeatingWindow ? 'border-[#6f1d32]/30 bg-white/80' : 'border-black/10 bg-white/50'}`}>
          <p className="flex items-center gap-2 font-semibold text-[#6f1d32]"><CalendarClock className="w-4 h-4" /> Đặt lúc {formatTime(reservation.reservationTime)} · {reservation.guestCount} khách</p>
          <p className="mt-1 text-[#211b18]">{reservation.customerName}{reservation.customerPhone && <span className="inline-flex items-center gap-1 text-[#625a55]"> · <Phone className="w-3 h-3" />{reservation.customerPhone}</span>}</p>
          {reservation.note && <p className="mt-1 line-clamp-2 text-[#625a55]">{reservation.note}</p>}
          {!reservation.isWithinSeatingWindow && <p className="mt-1 text-xs text-[#625a55]">Có thể nhận khách vãng lai trước khung giờ đặt.</p>}
        </div>
      )}

      <div className="mt-auto pt-4 grid gap-2">
        <button
          type="button"
          onClick={primary?.action}
          disabled={!primary || cleaning}
          className={`min-h-11 px-4 text-sm font-bold tracking-[0.04em] transition-colors ${
            primary ? 'moc-inverse bg-[#6f1d32] text-white hover:bg-[#49101f]' : 'bg-black/5 text-[#625a55] cursor-not-allowed'
          }`}
        >
          {primary ? primary.label : meta.label.toUpperCase()}
        </button>
      </div>
    </article>
  )
}

export default TableCard
