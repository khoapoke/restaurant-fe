import { useState } from 'react'
import { CalendarClock, Minus, Plus, QrCode, UsersRound } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

/**
 * Mở phiên phục vụ cho khách vãng lai, nhận khách đã đặt bàn (reservation khác null)
 * hoặc chấp nhận yêu cầu nhận bàn qua QR (checkIn khác null).
 */
export const OpenSessionModal = ({ table, reservation, checkIn = null, isOpen, onClose, onConfirm, isSubmitting, error }) => {
  const [guestCount, setGuestCount] = useState(() => Math.min(checkIn?.guestCount || reservation?.guestCount || 2, table?.capacity || 1))
  const linkable = checkIn && table?.upcomingReservation?.isWithinSeatingWindow ? table.upcomingReservation : null
  const [linkReservation, setLinkReservation] = useState(!!linkable)

  if (!table) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={checkIn ? `Nhận khách QR · ${table.tableName}` : reservation ? `Nhận khách · ${table.tableName}` : `Mở phiên · ${table.tableName}`} maxWidth="max-w-md">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} />}
        {checkIn && (
          <div className="p-4 border border-[#6f1d32]/25 bg-[#6f1d32]/5">
            <p className="flex items-center gap-2 text-sm font-bold text-[#6f1d32]"><QrCode className="w-4 h-4" /> Yêu cầu nhận bàn lúc {formatTime(checkIn.requestedAt)}</p>
            <p className="mt-2 text-sm text-[#211b18]">{checkIn.guestName || 'Khách tại bàn'} · báo {checkIn.guestCount || '?'} khách</p>
            {linkable && (
              <label className="mt-3 flex items-start gap-3 text-sm text-[#211b18]">
                <input type="checkbox" checked={linkReservation} onChange={(event) => setLinkReservation(event.target.checked)} className="mt-1 h-4 w-4 accent-[#6f1d32]" />
                <span>Đây là khách đặt trước #{linkable.reservationId} lúc {formatTime(linkable.reservationTime)} · {linkable.customerName} ({linkable.guestCount} khách)</span>
              </label>
            )}
          </div>
        )}
        {checkIn ? null : reservation ? (
          <div className="p-4 border border-[#6f1d32]/25 bg-[#6f1d32]/5">
            <p className="flex items-center gap-2 text-sm font-bold text-[#6f1d32]"><CalendarClock className="w-4 h-4" /> Lượt đặt #{reservation.reservationId} · {formatTime(reservation.reservationTime)}</p>
            <p className="mt-2 text-sm text-[#211b18]">{reservation.customerName}{reservation.customerPhone ? ` · ${reservation.customerPhone}` : ''}</p>
            <p className="mt-1 text-sm text-[#625a55]">Đặt cho {reservation.guestCount} khách{reservation.note ? ` · ${reservation.note}` : ''}</p>
          </div>
        ) : (
          <div className="p-4 bg-[#f5f0e7] border border-[var(--moc-line)]">
            <p className="text-sm font-semibold">{table.location}</p>
            <p className="mt-1 text-sm text-[#625a55]">Khách vãng lai · sức chứa tối đa {table.capacity} khách</p>
          </div>
        )}

        <div>
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]" id="guest-count-label">Số khách thực tế</span>
          <div className="mt-3 flex items-center justify-between border border-[var(--moc-line)] bg-white p-2" role="group" aria-labelledby="guest-count-label">
            <button type="button" onClick={() => setGuestCount((value) => Math.max(1, value - 1))} disabled={guestCount <= 1} className="w-11 h-11 grid place-items-center hover:bg-[#f5f0e7] disabled:opacity-30" aria-label="Giảm số khách">
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3" aria-live="polite">
              <UsersRound className="w-5 h-5 text-[#6f1d32]" />
              <strong className="moc-serif text-3xl font-medium">{guestCount}</strong>
            </div>
            <button type="button" onClick={() => setGuestCount((value) => Math.min(table.capacity, value + 1))} disabled={guestCount >= table.capacity} className="w-11 h-11 grid place-items-center hover:bg-[#f5f0e7] disabled:opacity-30" aria-label="Tăng số khách">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {guestCount >= table.capacity && <p className="mt-2 text-sm text-[#625a55]">Đã đạt sức chứa tối đa của bàn.</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Để sau</Button>
          <Button variant="primary" onClick={() => onConfirm(guestCount, { reservationId: linkable && linkReservation ? linkable.reservationId : null })} isLoading={isSubmitting}>{checkIn ? 'Nhận khách & mở thực đơn' : reservation ? 'Nhận khách & mở phiên' : 'Xác nhận mở bàn'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default OpenSessionModal
