import { BellRing, CalendarClock, ChefHat, Clock3, CreditCard, Phone, QrCode, Smartphone, TriangleAlert, UsersRound } from 'lucide-react'
import { formatWait, minutesSince } from '../../../../lib/useNow'
import { TABLE_STATUS_META, TableStatus, formatMoney, tableSignals } from '../constants'

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const SESSION_STATUS_LABEL = { OPEN: 'Đang gọi món', AWAITING_PAYMENT: 'Chờ thanh toán' }

export const TableCard = ({ table, now, onOpen, onSeatReservation, onSeatEarly, onRelease, onExtend, onNoShow, onContinue, onCompleteCleaning, onAcceptCheckIn, onShowQr, cleaning }) => {
  const meta = TABLE_STATUS_META[table.status] || TABLE_STATUS_META[TableStatus.MAINTENANCE]
  const reservation = table.upcomingReservation
  const session = table.activeSession
  const live = session?.live
  const signals = tableSignals(table)
  const seatable = [TableStatus.AVAILABLE, TableStatus.RESERVED].includes(table.status)
  const canSeatReservation = seatable && reservation?.isWithinSeatingWindow
  const holdExpired = !!reservation?.holdExpired
  const canOpenWalkIn = seatable && !reservation?.isWithinSeatingWindow && !holdExpired
  const late = reservation && reservation.minutesLate > 0
  const overdue = session?.overdue
  const nextAtRisk = session?.nextReservation?.atRisk
  const canContinue = table.status === TableStatus.OCCUPIED && session
  const canCompleteCleaning = table.status === TableStatus.CLEANING

  const primary = table.pendingCheckIn && seatable
    ? { label: 'NHẬN KHÁCH QR', action: () => onAcceptCheckIn(table) }
    : canSeatReservation
      ? { label: late ? 'KHÁCH ĐẶT ĐÃ ĐẾN · NHẬN BÀN' : 'NHẬN KHÁCH ĐẶT TRƯỚC', action: () => onSeatReservation(table) }
      : seatable && holdExpired
        ? { label: 'NHƯỜNG BÀN · MỞ PHIÊN MỚI', action: () => onRelease(table) }
      : canContinue
        ? { label: 'TIẾP TỤC PHIÊN', action: () => onContinue(table) }
        : canCompleteCleaning
          ? { label: cleaning ? 'ĐANG CẬP NHẬT...' : 'ĐÃ VỆ SINH · MỞ LẠI BÀN', action: () => onCompleteCleaning(table) }
          : canOpenWalkIn
            ? { label: 'MỞ PHIÊN PHỤC VỤ', action: () => onOpen(table) }
            : null

  const glow = signals.checkIn || signals.newRequests > 0
  const ring = signals.late > 0 ? 'ring-2 ring-[#b42318]/50' : signals.payment ? 'ring-2 ring-[#b7791f]/60' : ''

  return (
    <article className={`relative min-h-56 p-5 border ${meta.card} ${ring} ${glow ? 'moc-glow' : ''} flex flex-col transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm leading-6 text-[#625a55]">{table.location || 'Chưa cập nhật khu vực'}</p>
          <h3 className="mt-2 moc-serif text-2xl font-medium">{table.tableName}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 px-2.5 py-1.5 bg-white/80 border border-black/5 text-sm font-semibold">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      {(signals.checkIn || signals.newRequests > 0 || signals.payment || signals.late > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Tín hiệu cần xử lý">
          {signals.checkIn && <span className="moc-inverse inline-flex items-center gap-1 bg-[#6f1d32] px-2 py-1 text-xs font-bold text-[#fff8ed]"><QrCode className="h-3.5 w-3.5" /> Xin nhận bàn</span>}
          {signals.newRequests > 0 && <span className="moc-inverse inline-flex items-center gap-1 bg-[#6f1d32] px-2 py-1 text-xs font-bold text-[#fff8ed]"><BellRing className="h-3.5 w-3.5" /> {signals.newRequests} yêu cầu mới</span>}
          {signals.payment && <span className="inline-flex items-center gap-1 bg-[#e8c48a] px-2 py-1 text-xs font-bold text-[#211b18]"><CreditCard className="h-3.5 w-3.5" /> {session?.status === 'AWAITING_PAYMENT' ? 'Chờ thanh toán' : 'Xin thanh toán'}</span>}
          {signals.late > 0 && <span className="inline-flex items-center gap-1 bg-[#fbeaea] px-2 py-1 text-xs font-bold text-[#8a1c1c]"><TriangleAlert className="h-3.5 w-3.5" /> {signals.late} món trễ</span>}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-[#625a55]">
        <UsersRound className="w-4 h-4" /> Tối đa {table.capacity} khách
      </div>

      {session && (
        <div className="mt-4 pt-4 border-t border-black/10 space-y-2 text-sm text-[#625a55]">
          <p className="flex items-center justify-between gap-2"><span>Phiên #{session.sessionId} · {SESSION_STATUS_LABEL[session.status] || session.status}</span><strong className="text-[#211b18]">{session.guestCount} khách</strong></p>
          <p className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5" /> Mở {formatWait(minutesSince(session.openedAt, now)).toLowerCase()} · {session.guestName || session.staffName}</p>
          {live && (
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <span className="bg-white/70 px-1 py-2"><strong className="block text-[15px] text-[#211b18]">{formatMoney(live.subTotal)}</strong><span className="text-xs">Tạm tính</span></span>
              <span className="bg-white/70 px-1 py-2"><strong className="flex items-center justify-center gap-1 text-[15px] text-[#211b18]"><ChefHat className="h-3.5 w-3.5" />{live.pendingCount}</strong><span className="text-xs">Món đang chờ</span></span>
              <span className="bg-white/70 px-1 py-2"><strong className="flex items-center justify-center gap-1 text-[15px] text-[#211b18]"><Smartphone className="h-3.5 w-3.5" />{live.connectedGuests}</strong><span className="text-xs">Thiết bị QR</span></span>
            </div>
          )}
          {session.joinCode && (
            <p className={`flex items-center gap-2 ${session.joinCodeLocked ? 'font-semibold text-[#8a1c1c]' : ''}`}>
              Mã bàn cho khách mới: <strong className="font-mono text-base tracking-[0.2em] text-[#211b18]">{session.joinCode}</strong>{session.joinCodeLocked && ' · đã khóa'}
            </p>
          )}
          {session.reservationId && <p className="text-[#6f1d32] font-semibold">Khách đặt trước #{session.reservationId}</p>}
          {(overdue || nextAtRisk) && (
            <p className="flex items-start gap-1.5 font-semibold text-[#8a1c1c]">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {overdue ? `Quá giờ trả bàn (${formatTime(session.expectedEndAt)})` : `Dự kiến trả bàn ${formatTime(session.expectedEndAt)}`}
                {session.nextReservation ? ` · lượt đặt ${formatTime(session.nextReservation.reservationTime)} cần bàn trước ${formatTime(session.nextReservation.mustLeaveBy)}` : ''}
              </span>
            </p>
          )}
          {!overdue && !nextAtRisk && session.expectedEndAt && session.nextReservation && (
            <p className="text-xs">Phải trả bàn trước {formatTime(session.nextReservation.mustLeaveBy)} cho lượt đặt {formatTime(session.nextReservation.reservationTime)}</p>
          )}
        </div>
      )}

      {table.pendingCheckIn && (
        <div className="mt-4 p-3 border border-[#6f1d32]/30 bg-white/80 text-sm">
          <p className="flex items-center gap-2 font-semibold text-[#6f1d32]"><QrCode className="w-4 h-4" /> {table.pendingCheckIn.guestName || 'Khách'} · {table.pendingCheckIn.guestCount} khách</p>
          <p className="mt-1 text-[#625a55]">Gửi yêu cầu {formatWait(minutesSince(table.pendingCheckIn.requestedAt, now)).toLowerCase()} trước</p>
        </div>
      )}

      {!session && reservation && (
        <div className={`mt-4 p-3 border text-sm ${reservation.isWithinSeatingWindow ? 'border-[#6f1d32]/30 bg-white/80' : 'border-black/10 bg-white/50'}`}>
          <p className="flex items-center gap-2 font-semibold text-[#6f1d32]"><CalendarClock className="w-4 h-4" /> Đặt lúc {formatTime(reservation.reservationTime)} · {reservation.guestCount} khách</p>
          <p className="mt-1 text-[#211b18]">{reservation.customerName}{reservation.customerPhone && <span className="inline-flex items-center gap-1 text-[#625a55]"> · <Phone className="w-3 h-3" />{reservation.customerPhone}</span>}</p>
          {reservation.note && <p className="mt-1 line-clamp-2 text-[#625a55]">{reservation.note}</p>}
          {late && !holdExpired && <p className="mt-2 font-semibold text-[#8a1c1c]">Trễ {reservation.minutesLate} phút · giữ bàn đến {formatTime(reservation.holdUntil)}{reservation.extension ? ` (đã gia hạn: ${reservation.extension.reason})` : ''}</p>}
          {holdExpired && <p className="mt-2 font-semibold text-[#8a1c1c]">Đã quá hạn giữ bàn {formatTime(reservation.holdUntil)}. Liên hệ khách, ghi “Không đến” hoặc nhường bàn. Tự ghi không đến lúc {formatTime(reservation.autoNoShowAt)}.</p>}
          {!late && !reservation.isWithinSeatingWindow && <p className="mt-1 text-xs text-[#625a55]">Nhận khách từ {formatTime(reservation.seatingOpensAt)}. Có thể mở cho khách vãng lai nếu còn đủ thời gian.</p>}
          {(reservation.canExtend || reservation.canMarkNoShow || (!reservation.isWithinSeatingWindow && !late && seatable)) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {reservation.canExtend && <button type="button" onClick={() => onExtend(table)} className="min-h-9 border border-[var(--moc-line)] bg-white px-3 text-xs font-bold hover:border-[#6f1d32]/40">Gia hạn giữ bàn</button>}
              {reservation.canMarkNoShow && <button type="button" onClick={() => onNoShow(table)} className="min-h-9 border border-red-200 bg-white px-3 text-xs font-bold text-[#8a1c1c] hover:bg-red-50">Ghi không đến</button>}
              {!reservation.isWithinSeatingWindow && !late && seatable && <button type="button" onClick={() => onSeatEarly(table)} className="min-h-9 border border-[var(--moc-line)] bg-white px-3 text-xs font-bold hover:border-[#6f1d32]/40">Khách đến sớm</button>}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 grid grid-cols-[1fr_auto] gap-2">
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
        <button type="button" onClick={() => onShowQr(table)} aria-label={`Mã QR ${table.tableName}`} title="Mã QR gọi món" className="grid min-h-11 w-11 place-items-center border border-[var(--moc-line)] bg-white/70 text-[#211b18] hover:border-[#6f1d32]/40">
          <QrCode className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}

export default TableCard
