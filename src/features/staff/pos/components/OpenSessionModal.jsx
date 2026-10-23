import { useMemo, useState } from 'react'
import { CalendarClock, Minus, Plus, QrCode, ShieldAlert, UsersRound } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const TITLES = {
  checkIn: 'Nhận khách QR',
  reservation: 'Nhận khách đặt trước',
  early: 'Nhận khách đặt trước ngoài khung giờ',
  release: 'Nhường bàn cho khách mới',
  walkIn: 'Mở phiên',
}

/**
 * Mở phiên phục vụ (ADR-025):
 * - walkIn: khách vãng lai (backend báo giờ phải trả bàn nếu có lượt đặt sau).
 * - reservation: nhận khách đặt trước trong khung giờ; có thể xếp sang bàn khác (cần lý do) hoặc ghép bàn.
 * - early: ngoài khung giờ nhận khách — ADMIN nhập lý do, STAFF gửi quản lý duyệt.
 * - release: lượt đặt đã quá hạn giữ chỗ, đánh dấu không đến và mở phiên mới trong cùng một thao tác.
 * - checkIn: chấp nhận yêu cầu nhận bàn qua QR.
 */
export const OpenSessionModal = ({ table, mode = 'walkIn', reservation, checkIn = null, freeTables = [], isAdmin = false, isOpen, onClose, onConfirm, isSubmitting, error }) => {
  const reservedTableId = reservation?.tableId || table?.tableId
  const [primaryId, setPrimaryId] = useState(table?.tableId)
  const [extraIds, setExtraIds] = useState([])
  const [reason, setReason] = useState('')
  const linkable = checkIn && table?.upcomingReservation?.isWithinSeatingWindow ? table.upcomingReservation : null
  const [linkReservation, setLinkReservation] = useState(!!linkable)

  const tableOptions = useMemo(() => {
    const options = new Map([[table?.tableId, table]])
    freeTables.forEach((candidate) => options.set(candidate.tableId, candidate))
    return [...options.values()].filter(Boolean)
  }, [freeTables, table])
  const selectedTables = tableOptions.filter((candidate) => candidate.tableId === primaryId || extraIds.includes(candidate.tableId))
  const capacity = selectedTables.reduce((sum, candidate) => sum + candidate.capacity, 0) || table?.capacity || 1
  const [guestCount, setGuestCount] = useState(() => Math.max(1, Math.min(checkIn?.guestCount || reservation?.guestCount || 2, table?.capacity || 1)))

  if (!table) return null

  const seatingReservation = ['reservation', 'early'].includes(mode)
  const relocated = seatingReservation && primaryId !== reservedTableId
  const needsOverride = mode === 'early'
  const reasonRequired = relocated || needsOverride || mode === 'release'
  const reasonOk = !reasonRequired || reason.trim().length >= 3
  const requestOnly = needsOverride && !isAdmin

  const submit = () => onConfirm(Math.min(guestCount, capacity), {
    reservationId: seatingReservation ? reservation?.reservationId : linkable && linkReservation ? linkable.reservationId : null,
    tableIds: [primaryId, ...extraIds.filter((id) => id !== primaryId)],
    relocationReason: relocated ? reason.trim() : null,
    overrideReason: needsOverride ? reason.trim() : null,
    releaseReservationId: mode === 'release' ? reservation?.reservationId : null,
    requestApproval: requestOnly,
    reason: reason.trim(),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${TITLES[mode] || TITLES.walkIn} · ${table.tableName}`} maxWidth="max-w-lg">
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

        {reservation && !checkIn && (
          <div className={`p-4 border ${mode === 'release' ? 'border-red-300 bg-red-50' : 'border-[#6f1d32]/25 bg-[#6f1d32]/5'}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-[#6f1d32]"><CalendarClock className="w-4 h-4" /> Lượt đặt #{reservation.reservationId} · {formatTime(reservation.reservationTime)}</p>
            <p className="mt-2 text-sm text-[#211b18]">{reservation.customerName}{reservation.customerPhone ? ` · ${reservation.customerPhone}` : ''} · đặt cho {reservation.guestCount} khách</p>
            {reservation.note && <p className="mt-1 text-sm text-[#625a55]">{reservation.note}</p>}
            {mode === 'release' && <p className="mt-2 text-sm font-semibold text-[#8a1c1c]">Đã quá hạn giữ bàn ({formatTime(reservation.holdUntil)}). Lượt đặt sẽ được ghi “Không đến” và bàn mở cho khách mới.</p>}
            {mode === 'early' && <p className="mt-2 text-sm text-[#625a55]">Khung nhận khách: {formatTime(reservation.seatingOpensAt)} – {formatTime(reservation.holdUntil)}.</p>}
          </div>
        )}

        {!reservation && !checkIn && (
          <div className="p-4 bg-[#f5f0e7] border border-[var(--moc-line)]">
            <p className="text-sm font-semibold">{table.location}</p>
            <p className="mt-1 text-sm text-[#625a55]">Khách vãng lai · sức chứa {table.capacity} khách. Nếu bàn có lượt đặt sau, hệ thống báo giờ phải trả bàn.</p>
          </div>
        )}

        {seatingReservation && tableOptions.length > 1 && (
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
              Bàn nhận khách
              <select value={primaryId} onChange={(event) => setPrimaryId(Number(event.target.value))} className="min-h-11 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18]">
                {tableOptions.map((candidate) => <option key={candidate.tableId} value={candidate.tableId}>{candidate.tableName} · {candidate.capacity} chỗ{candidate.tableId === reservedTableId ? ' (bàn đã đặt)' : ''}</option>)}
              </select>
            </label>
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold text-[#6f1d32]">Ghép thêm bàn khi khách đông hơn</summary>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {tableOptions.filter((candidate) => candidate.tableId !== primaryId).map((candidate) => (
                  <label key={candidate.tableId} className="flex items-center gap-2 border border-[var(--moc-line)] bg-white px-3 py-2">
                    <input type="checkbox" checked={extraIds.includes(candidate.tableId)} onChange={() => setExtraIds((value) => (value.includes(candidate.tableId) ? value.filter((id) => id !== candidate.tableId) : [...value, candidate.tableId]))} className="h-4 w-4 accent-[#6f1d32]" />
                    {candidate.tableName} · {candidate.capacity} chỗ
                  </label>
                ))}
              </div>
            </details>
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
              <strong className="moc-serif text-3xl font-medium">{Math.min(guestCount, capacity)}</strong>
            </div>
            <button type="button" onClick={() => setGuestCount((value) => Math.min(capacity, value + 1))} disabled={guestCount >= capacity} className="w-11 h-11 grid place-items-center hover:bg-[#f5f0e7] disabled:opacity-30" aria-label="Tăng số khách">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {reservation && guestCount !== reservation.guestCount && <p className="mt-2 text-sm text-[#625a55]">Khác số khách đã đặt ({reservation.guestCount}). Số thực tế được lưu riêng cho phiên.</p>}
          {guestCount >= capacity && <p className="mt-2 text-sm text-[#625a55]">Đã đạt sức chứa {capacity} chỗ{seatingReservation ? ' — ghép thêm bàn nếu khách đông hơn.' : '.'}</p>}
        </div>

        {reasonRequired && (
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
            {needsOverride ? 'Lý do nhận khách ngoài khung giờ' : relocated ? 'Lý do xếp khách sang bàn khác' : 'Ghi chú'}
            <textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} placeholder={needsOverride ? 'Ví dụ: Khách đến sớm 45 phút, bàn đang trống' : 'Ví dụ: Bàn đặt bị đổ nước, khách đồng ý ngồi bàn bên cạnh'} className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]" />
          </label>
        )}
        {requestOnly && (
          <p className="flex items-start gap-2 border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />Ngoài khung giờ nhận khách: yêu cầu sẽ được gửi cho quản lý duyệt. Khi duyệt, phiên được mở tự động.</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Để sau</Button>
          <Button variant={mode === 'release' ? 'danger' : 'primary'} onClick={submit} isLoading={isSubmitting} disabled={!reasonOk}>
            {checkIn ? 'Nhận khách & mở thực đơn' : requestOnly ? 'Gửi quản lý duyệt' : mode === 'release' ? 'Ghi không đến & mở phiên mới' : reservation ? 'Nhận khách & mở phiên' : 'Xác nhận mở bàn'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default OpenSessionModal
