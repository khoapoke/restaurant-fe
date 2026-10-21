import { useCallback, useEffect, useState } from 'react'
import { Armchair, CalendarCheck, Check, Phone, RefreshCw, Search, UsersRound, X } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import Pagination from '../../../components/ui/Pagination'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE, formatDateTime } from '../constants'
import { getAdminReservationsApi, updateReservationStatusApi } from '../services/adminService'

const SCOPES = [
  { value: 'upcoming', label: 'Hôm nay & sắp tới' },
  { value: 'past', label: 'Đã qua' },
  { value: 'all', label: 'Tất cả' },
]

const TRANSITIONS = {
  CONFIRMED: { title: 'Xác nhận lượt đặt', confirmLabel: 'Xác nhận giữ bàn', success: 'Đã xác nhận và giữ bàn cho khách.', reason: { label: 'Ghi chú cho khách (không bắt buộc)', placeholder: 'Ví dụ: Đã giữ bàn cạnh cửa sổ', required: false } },
  REJECTED: { title: 'Từ chối lượt đặt', tone: 'danger', confirmLabel: 'Từ chối', success: 'Đã từ chối lượt đặt.', reason: { label: 'Lý do từ chối', placeholder: 'Ví dụ: Khung giờ đã kín bàn', minLength: 3 } },
  CANCELLED: { title: 'Hủy lượt đặt', tone: 'danger', confirmLabel: 'Hủy lịch', success: 'Đã hủy lượt đặt và giải phóng bàn.', reason: { label: 'Lý do hủy', placeholder: 'Ví dụ: Khách gọi điện báo hủy', minLength: 3 } },
  COMPLETED: { title: 'Đánh dấu hoàn thành', confirmLabel: 'Hoàn thành', success: 'Đã đánh dấu lượt đặt hoàn thành.' },
}

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminReservationsPage = () => {
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', status: '', date: '', scope: 'upcoming', page: 1 })
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)

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
        await updateReservationStatusApi(reservation.reservationId, targetStatus, note || null)
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
                  {reservation.note && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#625a55]">{reservation.note}</p>}
                  {actionable && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {reservation.status === 'PENDING' && <>
                        <Button size="sm" icon={Check} onClick={() => transition(reservation, 'CONFIRMED')}>Xác nhận</Button>
                        <Button size="sm" variant="outline" icon={X} onClick={() => transition(reservation, 'REJECTED')}>Từ chối</Button>
                      </>}
                      {reservation.status === 'CONFIRMED' && <>
                        <Button size="sm" icon={Check} onClick={() => transition(reservation, 'COMPLETED')}>Hoàn thành</Button>
                        <Button size="sm" variant="outline" icon={X} onClick={() => transition(reservation, 'CANCELLED')}>Hủy lịch</Button>
                      </>}
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
    </div>
  )
}

export default AdminReservationsPage
