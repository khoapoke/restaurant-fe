import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, Check, Search, X } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import AdminDataState from '../components/AdminDataState'
import { formatDateTime, RESERVATION_STATUS_LABEL } from '../constants'
import { getAdminReservationsApi, updateReservationStatusApi } from '../services/adminService'

export const AdminReservationsPage = () => {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setItems((await getAdminReservationsApi({ ...filters, keyword: filters.keyword || undefined, status: filters.status || undefined, perPage: 50 })).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải lịch đặt bàn.') }
    finally { setLoading(false) }
  }, [filters])
  useEffect(() => {
    let active = true
    getAdminReservationsApi({ ...filters, keyword: filters.keyword || undefined, status: filters.status || undefined, perPage: 50 })
      .then((response) => { if (active) setItems(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải lịch đặt bàn.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters])

  const transition = async (reservation, targetStatus) => {
    const needsReason = ['REJECTED', 'CANCELLED'].includes(targetStatus)
    const adminNote = needsReason ? window.prompt('Nhập ghi chú cho khách:') : null
    if (needsReason && !adminNote) return
    setPendingId(reservation.reservationId); setNotice(null)
    try { const response = await updateReservationStatusApi(reservation.reservationId, targetStatus, adminNote); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể cập nhật lượt đặt.') }
    finally { setPendingId(null) }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <header><span className="moc-eyebrow">LỊCH ĐÓN KHÁCH</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Đặt chỗ</h1><p className="mt-3 text-sm text-[#625a55]">Xác nhận yêu cầu, tránh trùng khung giờ và điều phối bàn trước giờ khách đến.</p></header>
      <section className="mt-8 moc-panel p-4 flex flex-col md:flex-row gap-3"><Input icon={Search} value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="Tên khách hoặc tên bàn..." /><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm"><option value="">Mọi trạng thái</option>{Object.entries(RESERVATION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
      {notice && <p className="mt-4 border border-[#6f1d32]/20 bg-[#fffdf8] px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}
      <div className="mt-5"><AdminDataState loading={loading} error={error} onRetry={load} empty={!items.length}>
        <div className="grid lg:grid-cols-2 gap-4">{items.map((reservation) => <article key={reservation.reservationId} className="moc-panel p-5"><div className="flex items-start justify-between gap-4"><div><span className="text-xs font-bold text-[#6f1d32]">#{reservation.reservationId} · {RESERVATION_STATUS_LABEL[reservation.status]}</span><h2 className="mt-2 moc-serif text-2xl">{reservation.customer?.fullName || reservation.customer?.username}</h2><p className="mt-1 text-sm text-[#625a55]">{reservation.customer?.phoneNumber || 'Chưa có SĐT'}</p></div><CalendarCheck className="h-6 w-6 text-[#6f1d32]" /></div><div className="mt-5 grid sm:grid-cols-2 gap-3 border-y border-[var(--moc-line)] py-4 text-sm"><div><span className="text-xs text-[#625a55]">Thời gian</span><p className="mt-1 font-semibold">{formatDateTime(reservation.reservationTime)}</p></div><div><span className="text-xs text-[#625a55]">Bàn & số khách</span><p className="mt-1 font-semibold">{reservation.table?.tableName} · {reservation.guestCount} khách</p></div></div>{reservation.note && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#625a55]">{reservation.note}</p>}<div className="mt-5 flex flex-wrap gap-2">{reservation.status === 'PENDING' && <><Button size="sm" icon={Check} isLoading={pendingId === reservation.reservationId} onClick={() => transition(reservation, 'CONFIRMED')}>Xác nhận</Button><Button size="sm" variant="danger" icon={X} disabled={pendingId === reservation.reservationId} onClick={() => transition(reservation, 'REJECTED')}>Từ chối</Button></>}{reservation.status === 'CONFIRMED' && <><Button size="sm" icon={Check} isLoading={pendingId === reservation.reservationId} onClick={() => transition(reservation, 'COMPLETED')}>Hoàn thành</Button><Button size="sm" variant="danger" onClick={() => transition(reservation, 'CANCELLED')}>Hủy lịch</Button></>}</div></article>)}</div>
      </AdminDataState></div>
    </div>
  )
}

export default AdminReservationsPage
