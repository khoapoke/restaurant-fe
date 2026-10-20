import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, MapPin, Pencil, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MocSiteHeader from '../../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../../components/navigation/MocFooter'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import { useAuth } from '../../../../contexts/AuthContext'
import { Role } from '../../../auth/constants'
import ReservationForm from '../components/ReservationForm'
import { formatReservationDate, RESERVATION_STATUS_LABEL, RESERVATION_STATUS_STYLE } from '../constants'
import { cancelReservationApi, createReservationApi, getReservationsApi, updateReservationApi } from '../services/reservationService'

export const CustomerReservationsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
    else if (role !== Role.CUSTOMER) navigate('/', { replace: true })
  }, [isAuthenticated, role, navigate])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setReservations((await getReservationsApi({ perPage: 50 })).data.items || []) }
    catch (err) { setError(err.response?.data?.message || 'Không thể tải lịch đặt bàn.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    if (!isAuthenticated || role !== Role.CUSTOMER) return undefined
    let active = true
    getReservationsApi({ perPage: 50 })
      .then((response) => { if (active) setReservations(response.data.items || []) })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải lịch đặt bàn.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isAuthenticated, role])

  const save = async (payload) => {
    setSubmitting(true); setNotice(null)
    try {
      const response = editing ? await updateReservationApi(editing.reservationId, payload) : await createReservationApi(payload)
      setNotice(response.message); setEditing(null); await load()
    } finally { setSubmitting(false) }
  }
  const cancel = async (reservation) => {
    if (!window.confirm(`Hủy lượt đặt tại ${reservation.table?.tableName}?`)) return
    setCancellingId(reservation.reservationId); setNotice(null)
    try { const response = await cancelReservationApi(reservation.reservationId); setNotice(response.message); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Không thể hủy lượt đặt.') }
    finally { setCancellingId(null) }
  }

  return (
    <div className="moc-page-shell"><MocSiteHeader />
      <main className="max-w-[1280px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <header><span className="moc-eyebrow">TRẢI NGHIỆM TẠI MỘC</span><h1 className="mt-4 moc-serif text-4xl sm:text-6xl font-medium tracking-[-0.04em]">Đặt bàn</h1><p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-[#625a55]">Chọn thời gian, số khách và không gian phù hợp. Mộc sẽ xác nhận để chuẩn bị bàn chỉn chu trước khi bạn đến.</p></header>
        <div className="mt-9 grid xl:grid-cols-[1fr_1.05fr] gap-6 items-start">
          <ReservationForm key={editing?.reservationId || 'new'} reservation={editing} onSubmit={save} onCancelEdit={() => setEditing(null)} submitting={submitting} />
          <section className="moc-panel p-5 sm:p-7"><div className="flex items-center gap-3"><CalendarDays className="h-6 w-6 text-[#6f1d32]" /><h2 className="moc-serif text-2xl sm:text-3xl">Lịch của bạn</h2></div>
            {notice && <p className="mt-5 border border-[#6f1d32]/20 bg-[#6f1d32]/5 p-3 text-sm text-[#6f1d32]">{notice}</p>}
            {loading && <div className="mt-6 grid gap-3"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>}
            {!loading && error && <div className="mt-6 bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><Button size="sm" className="mt-4" onClick={load}>Thử lại</Button></div>}
            {!loading && !error && !reservations.length && <div className="mt-6 border border-dashed border-[var(--moc-line)] p-8 text-center"><CalendarDays className="mx-auto h-8 w-8 text-[#6f1d32]" /><p className="mt-3 text-sm text-[#625a55]">Bạn chưa có lịch đặt bàn nào.</p></div>}
            {!loading && !error && <div className="mt-6 grid gap-3">{reservations.map((reservation) => { const editable = ['PENDING', 'CONFIRMED'].includes(reservation.status); return <article key={reservation.reservationId} className="border border-[var(--moc-line)] bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${RESERVATION_STATUS_STYLE[reservation.status]}`}>{RESERVATION_STATUS_LABEL[reservation.status]}</span><h3 className="mt-3 moc-serif text-xl">{reservation.table?.tableName}</h3></div><span className="text-xs text-[#625a55]">#{reservation.reservationId}</span></div><div className="mt-4 grid gap-2 text-sm text-[#625a55]"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatReservationDate(reservation.reservationTime)}</p><p className="flex items-center gap-2"><Users className="h-4 w-4" /> {reservation.guestCount} khách</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {reservation.table?.location}</p></div>{reservation.note && <p className="mt-3 whitespace-pre-line border-t border-[var(--moc-line)] pt-3 text-sm leading-6">{reservation.note}</p>}{editable && <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" icon={Pencil} onClick={() => setEditing(reservation)}>Sửa</Button><Button size="sm" variant="ghost" icon={X} isLoading={cancellingId === reservation.reservationId} onClick={() => cancel(reservation)}>Hủy</Button></div>}</article> })}</div>}
          </section>
        </div>
      </main><MocFooter /></div>
  )
}

export default CustomerReservationsPage
