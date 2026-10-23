import { useCallback, useEffect, useState } from 'react'
import { Armchair, CalendarCheck, Check, History, LockKeyhole, Pencil, Phone, RefreshCw, Search, UserX, UsersRound, X } from 'lucide-react'
import AuditHistoryModal from '../../../components/ui/AuditHistoryModal'
import Modal from '../../../components/ui/Modal'
import { apiErrorMessage } from '../../../lib/apiError'
import { AUDIT_ACTION_LABEL } from '../../staff/pos/constants'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Pagination from '../../../components/ui/Pagination'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE, formatDateTime } from '../constants'
import { getAdminReservationsApi, getAdminTablesApi, getReservationHistoryApi, updateAdminReservationApi, updateReservationStatusApi } from '../services/adminService'

const SCOPES = [
  { value: 'upcoming', label: 'Hôm nay & sắp tới' },
  { value: 'past', label: 'Đã qua' },
  { value: 'all', label: 'Tất cả' },
]

// COMPLETED không còn bấm tay: lượt đặt tự hoàn tất khi đóng phiên POS (ADR-025).
const TRANSITIONS = {
  CONFIRMED: { title: 'Xác nhận lượt đặt', confirmLabel: 'Xác nhận giữ bàn', success: 'Đã xác nhận và giữ bàn cho khách.', field: 'internalNote', reason: { label: 'Ghi chú nội bộ (khách không thấy)', placeholder: 'Ví dụ: Khách quen, chuẩn bị ghế trẻ em', required: false } },
  REJECTED: { title: 'Từ chối lượt đặt', tone: 'danger', confirmLabel: 'Từ chối', success: 'Đã từ chối lượt đặt.', field: 'reason', reason: { label: 'Lý do gửi khách', placeholder: 'Ví dụ: Khung giờ đã kín bàn, mời anh/chị chọn 20:30', minLength: 3 } },
  CANCELLED: { title: 'Hủy lượt đặt', tone: 'danger', confirmLabel: 'Hủy lịch', success: 'Đã hủy lượt đặt và giải phóng bàn.', field: 'reason', reason: { label: 'Lý do gửi khách', placeholder: 'Ví dụ: Bàn hỏng đột xuất, đã gọi xin lỗi khách', minLength: 3 } },
  NO_SHOW: { title: 'Ghi khách không đến', tone: 'danger', confirmLabel: 'Ghi không đến', success: 'Đã ghi khách không đến và trả bàn.', field: 'reason', reason: { label: 'Ghi chú', placeholder: 'Ví dụ: Đã gọi 2 lần không liên lạc được', minLength: 3 } },
}

const toLocalInput = (value) => (value ? value.slice(0, 16) : '')

/** Nhà hàng sửa giờ/bàn/số khách của lượt đặt (vd. bàn hỏng), có lý do, kiểm tra trùng lịch. */
const EditReservationModal = ({ reservation, onClose, onDone }) => {
  const [tables, setTables] = useState([])
  const [time, setTime] = useState(toLocalInput(reservation.reservationTime))
  const [tableId, setTableId] = useState(reservation.table?.tableId || '')
  const [guestCount, setGuestCount] = useState(reservation.guestCount)
  const [internalNote, setInternalNote] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getAdminTablesApi().then((response) => active && setTables(response.data?.items || response.data || [])).catch(() => {})
    return () => { active = false }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (reason.trim().length < 3) { setError('Nhập lý do thay đổi (tối thiểu 3 ký tự).'); return }
    setSubmitting(true)
    setError(null)
    try {
      await updateAdminReservationApi(reservation.reservationId, {
        reservationTime: time ? `${time.replace('T', ' ')}:00` : null,
        tableId: tableId ? Number(tableId) : null,
        guestCount: Number(guestCount),
        internalNote: internalNote.trim() || null,
        reason: reason.trim(),
      })
      onDone(`Đã cập nhật lượt đặt #${reservation.reservationId}.`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      setSubmitting(false)
    }
  }

  const field = 'min-h-11 w-full border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18]'
  const label = 'grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]'

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Sửa lượt đặt #${reservation.reservationId}`} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>Giờ khách đến<input type="datetime-local" value={time} onChange={(event) => setTime(event.target.value)} className={field} /></label>
          <label className={label}>Số khách<input type="number" min="1" max="50" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} className={field} /></label>
        </div>
        <label className={label}>
          Bàn
          <select value={tableId} onChange={(event) => setTableId(event.target.value)} className={field}>
            {tables.length === 0 && <option value={reservation.table?.tableId}>{reservation.table?.tableName}</option>}
            {tables.map((table) => <option key={table.tableId} value={table.tableId}>{table.tableName} · {table.capacity} chỗ</option>)}
          </select>
        </label>
        <label className={label}>Ghi chú nội bộ (khách không thấy)<input value={internalNote} onChange={(event) => setInternalNote(event.target.value)} maxLength={500} className={field} /></label>
        <label className={label}>Lý do thay đổi<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} placeholder="Ví dụ: Bàn cũ hỏng, đã báo khách" className={field} /></label>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" isLoading={submitting}>Lưu thay đổi</Button>
        </div>
      </form>
    </Modal>
  )
}

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminReservationsPage = () => {
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', status: '', date: '', scope: 'upcoming', page: 1 })
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [modal, setModal] = useState(null)
  const loadHistory = useCallback(() => getReservationHistoryApi(modal?.reservation?.reservationId), [modal])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim(), page: 1 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => getAdminReservationsApi({
    keyword: filters.keyword || undefined,
    status: filters.status || undefined,
    date: filters.date || undefined,
    scope: filters.date ? 'all' : filters.scope,
    page: filters.page,
    perPage: 12,
  }).then((response) => response.data), [filters])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải lịch đặt bàn.' })
  const items = data?.items || []
  const pagination = data?.pagination
  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }))

  const transition = (reservation, targetStatus) => {
    const config = TRANSITIONS[targetStatus]
    setDialog({
      ...config,
      title: `${config.title} #${reservation.reservationId}`,
      description: `${reservation.customer?.fullName || reservation.customer?.username} · ${reservation.table?.tableName} · ${formatDateTime(reservation.reservationTime)} · ${reservation.guestCount} khách`,
      onConfirm: async (note) => {
        await updateReservationStatusApi(reservation.reservationId, targetStatus, { [config.field]: note || null })
        setFeedback({ tone: 'success', message: config.success })
        reload({ quiet: true })
      },
    })
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">LỊCH ĐÓN KHÁCH</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Đặt chỗ</h1><p className="mt-3 text-sm text-[#625a55]">Xác nhận yêu cầu, tránh trùng khung giờ và điều phối bàn trước giờ khách đến.</p></div>
        <Button variant="outline" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
      </header>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Phạm vi thời gian">
        {SCOPES.map((scope) => {
          const active = !filters.date && filters.scope === scope.value
          return (
            <button key={scope.value} type="button" role="tab" aria-selected={active} onClick={() => setFilters((current) => ({ ...current, scope: scope.value, date: '', page: 1 }))}
              className={`min-h-10 px-4 text-sm font-semibold border transition-colors ${active ? 'moc-inverse bg-[#6f1d32] border-[#6f1d32] text-white' : 'border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18] hover:border-[#6f1d32]/50'}`}>
              {scope.label}
            </button>
          )
        })}
      </div>

      <section className="mt-4 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tên khách hoặc tên bàn..." aria-label="Tìm lượt đặt" />
        <input type="date" value={filters.date} onChange={(event) => updateFilter('date', event.target.value)} className={selectClass} aria-label="Lọc theo ngày" />
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={selectClass} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(RESERVATION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!items.length} emptyMessage="Không có lượt đặt bàn phù hợp.">
          <div className="grid lg:grid-cols-2 gap-4">
            {items.map((reservation) => {
              const actionable = !reservation.isSeated
              return (
                <article key={reservation.reservationId} className="moc-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold ${RESERVATION_STATUS_TONE[reservation.status] || 'bg-[#eee6dc]'}`}>{RESERVATION_STATUS_LABEL[reservation.status]}</span>
                        {reservation.isSeated && <span className="inline-flex items-center gap-1 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900"><Armchair className="h-3.5 w-3.5" />Đã nhận bàn</span>}
                        <span className="text-xs text-[#625a55]">#{reservation.reservationId}</span>
                      </div>
                      <h2 className="mt-3 moc-serif text-2xl truncate">{reservation.customer?.fullName || reservation.customer?.username}</h2>
                      <p className="mt-1 flex items-center gap-2 text-sm text-[#625a55]"><Phone className="h-4 w-4" />{reservation.customer?.phoneNumber || 'Chưa có SĐT'}</p>
                    </div>
                    <CalendarCheck className="h-6 w-6 shrink-0 text-[#6f1d32]" />
                  </div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 border-y border-[var(--moc-line)] py-4 text-sm">
                    <div><span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#625a55]">Thời gian</span><p className="mt-1 font-semibold">{formatDateTime(reservation.reservationTime)}</p></div>
                    <div><span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#625a55]">Bàn & số khách</span><p className="mt-1 flex items-center gap-1.5 font-semibold">{reservation.table?.tableName} · <UsersRound className="h-4 w-4" />{reservation.guestCount}</p></div>
                  </div>
                  {reservation.note && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#625a55]">Khách ghi chú: {reservation.note}</p>}
                  {reservation.internalNote && <p className="mt-2 flex items-start gap-1.5 whitespace-pre-line border-l-2 border-[#6f1d32]/40 pl-3 text-sm leading-6 text-[#211b18]"><LockKeyhole className="mt-1 h-3.5 w-3.5 shrink-0 text-[#6f1d32]" />{reservation.internalNote}</p>}
                  {reservation.hold && reservation.status === 'CONFIRMED' && !reservation.isSeated && (
                    <p className={`mt-2 text-sm ${reservation.hold.holdExpired ? 'font-semibold text-[#8a1c1c]' : 'text-[#625a55]'}`}>
                      Nhận khách {formatDateTime(reservation.hold.seatingOpensAt)} – {formatDateTime(reservation.hold.holdUntil)}{reservation.hold.holdExpired ? ' · đã quá hạn giữ bàn' : ''}
                    </p>
                  )}
                  {reservation.extension && <p className="mt-1 text-sm text-[#625a55]">Gia hạn đến {formatDateTime(reservation.extension.until)} · {reservation.extension.reason}{reservation.extension.by ? ` · ${reservation.extension.by}` : ''}</p>}
                  {reservation.resolution && ['REJECTED', 'CANCELLED', 'NO_SHOW', 'EXPIRED'].includes(reservation.status) && <p className="mt-1 text-sm text-[#8a1c1c]">{reservation.resolution.reason || '—'} · {reservation.resolution.by || 'Hệ thống'} · {formatDateTime(reservation.resolution.at)}</p>}
                  {reservation.isSeated && reservation.actualGuestCount && reservation.actualGuestCount !== reservation.guestCount && <p className="mt-1 text-sm text-[#625a55]">Thực tế {reservation.actualGuestCount} khách · {reservation.seatedTables?.join(' + ')}</p>}
                  {actionable && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {reservation.status === 'PENDING' && <>
                        <Button size="sm" icon={Check} onClick={() => transition(reservation, 'CONFIRMED')}>Xác nhận</Button>
                        <Button size="sm" variant="outline" icon={X} onClick={() => transition(reservation, 'REJECTED')}>Từ chối</Button>
                      </>}
                      {reservation.status === 'CONFIRMED' && <>
                        {reservation.hold?.holdExpired && <Button size="sm" variant="outline" icon={UserX} onClick={() => transition(reservation, 'NO_SHOW')}>Không đến</Button>}
                        <Button size="sm" variant="outline" icon={X} onClick={() => transition(reservation, 'CANCELLED')}>Hủy lịch</Button>
                      </>}
                      {['PENDING', 'CONFIRMED'].includes(reservation.status) && <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setModal({ kind: 'edit', reservation })}>Sửa</Button>}
                      <Button size="sm" variant="ghost" icon={History} onClick={() => setModal({ kind: 'history', reservation })}>Lịch sử</Button>
                    </div>
                  )}
                  {reservation.isSeated && reservation.status === 'CONFIRMED' && <p className="mt-4 text-sm text-[#625a55]">Khách đang dùng bữa. Lượt đặt sẽ tự hoàn thành khi đóng phiên POS.</p>}
                </article>
              )
            })}
          </div>
          {pagination && <Pagination currentPage={pagination.currentPage} lastPage={pagination.totalPages} totalItems={pagination.totalItems} itemLabel="lượt đặt" onPageChange={(page) => setFilters((current) => ({ ...current, page }))} disabled={refreshing} className="mt-2" />}
        </AdminDataState>
      </div>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
      {modal?.kind === 'edit' && <EditReservationModal reservation={modal.reservation} onClose={() => setModal(null)} onDone={(message) => { setModal(null); setFeedback({ tone: 'success', message }); reload({ quiet: true }) }} />}
      {modal?.kind === 'history' && <AuditHistoryModal title={`Lịch sử lượt đặt #${modal.reservation.reservationId}`} load={loadHistory} actionLabels={AUDIT_ACTION_LABEL} onClose={() => setModal(null)} />}
    </div>
  )
}

export default AdminReservationsPage
