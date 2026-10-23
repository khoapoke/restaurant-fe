import { useCallback, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Pencil, Users, X } from 'lucide-react'
import MocSiteHeader from '../../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../../components/navigation/MocFooter'
import Button from '../../../../components/ui/Button'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../../components/ui/FeedbackBanner'
import Skeleton from '../../../../components/ui/Skeleton'
import { useApiResource } from '../../../../lib/useApiResource'
import ReservationForm from '../components/ReservationForm'
import { formatReservationDate, RESERVATION_STATUS_LABEL, RESERVATION_STATUS_STYLE } from '../constants'
import { cancelReservationApi, createReservationApi, getReservationsApi, updateReservationApi } from '../services/reservationService'

const ReservationCard = ({ reservation, onEdit, onCancel }) => (
  <article className="border border-[var(--moc-line)] bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${RESERVATION_STATUS_STYLE[reservation.status]}`}>{RESERVATION_STATUS_LABEL[reservation.status]}</span><h3 className="mt-3 moc-serif text-xl">{reservation.table?.tableName}</h3></div>
      <span className="text-sm text-[#625a55]">#{reservation.reservationId}</span>
    </div>
    <div className="mt-4 grid gap-2 text-sm text-[#625a55]">
      <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" /> {formatReservationDate(reservation.reservationTime)}</p>
      <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /> {reservation.guestCount} khách</p>
      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {reservation.table?.location}</p>
    </div>
    {reservation.note && <p className="mt-3 whitespace-pre-line border-t border-[var(--moc-line)] pt-3 text-sm leading-6">{reservation.note}</p>}
    {reservation.statusReason && <p className="mt-3 text-sm text-[#8a1c1c]">Lý do từ nhà hàng: {reservation.statusReason}</p>}
    {reservation.status === 'CONFIRMED' && reservation.holdUntil && !reservation.isSeated && <p className="mt-3 text-sm text-[#625a55]">Mộc giữ bàn đến {new Date(reservation.holdUntil).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}. Nếu đến trễ hơn, vui lòng gọi trước để được gia hạn.</p>}
    {reservation.status === 'EXPIRED' && <p className="mt-3 text-sm text-[#625a55]">Yêu cầu chưa được xác nhận trước giờ hẹn nên đã hết hạn. Bạn có thể đặt lượt mới.</p>}
    {reservation.isSeated && <p className="mt-3 text-sm text-emerald-800">Bạn đã được nhận bàn. Mọi thay đổi xin trao đổi trực tiếp với nhân viên.</p>}
    {reservation.canModify && (
      <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" icon={Pencil} onClick={() => onEdit(reservation)}>Đổi lịch</Button><Button size="sm" variant="ghost" icon={X} onClick={() => onCancel(reservation)}>Hủy</Button></div>
    )}
    {!reservation.canModify && !reservation.isSeated && ['PENDING', 'CONFIRMED'].includes(reservation.status) && (
      <p className="mt-4 flex items-center gap-2 text-sm text-[#625a55]"><Clock3 className="h-4 w-4" />Đã gần giờ đến (dưới 60 phút). Vui lòng gọi nhà hàng nếu cần thay đổi.</p>
    )}
  </article>
)

export const CustomerReservationsPage = () => {
  const [feedback, setFeedback] = useState(null)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialog, setDialog] = useState(null)

  const loader = useCallback(() => getReservationsApi({ perPage: 50 }).then((response) => ({ items: response.data.items || [], fetchedAt: Date.now() })), [])
  const { data, loading, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải lịch đặt bàn.' })

  const { upcoming, history } = useMemo(() => {
    const items = data?.items || []
    const isUpcoming = (reservation) => ['PENDING', 'CONFIRMED'].includes(reservation.status) && new Date(reservation.reservationTime).getTime() > data.fetchedAt - 2 * 60 * 60 * 1000
    return {
      upcoming: items.filter(isUpcoming).sort((a, b) => new Date(a.reservationTime) - new Date(b.reservationTime)),
      history: items.filter((reservation) => !isUpcoming(reservation)),
    }
  }, [data])

  const save = async (payload) => {
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = editing ? await updateReservationApi(editing.reservationId, payload) : await createReservationApi(payload)
      const status = response.data?.status
      setFeedback({ tone: 'success', message: editing
        ? (status === 'PENDING' ? 'Đã cập nhật lịch. Mộc sẽ xác nhận lại trong thời gian sớm nhất.' : 'Đã cập nhật lượt đặt bàn.')
        : 'Đã gửi yêu cầu đặt bàn. Mộc sẽ xác nhận trong thời gian sớm nhất.' })
      setEditing(null)
      reload({ quiet: true })
    } finally {
      setSubmitting(false)
    }
  }

  const cancel = (reservation) => setDialog({
    title: `Hủy lượt đặt #${reservation.reservationId}`,
    tone: 'danger',
    description: `${reservation.table?.tableName} · ${formatReservationDate(reservation.reservationTime)} · ${reservation.guestCount} khách`,
    details: 'Bàn sẽ được giải phóng cho khách khác. Bạn có thể đặt lại bất cứ lúc nào.',
    confirmLabel: 'Hủy lượt đặt',
    cancelLabel: 'Giữ lịch',
    onConfirm: async () => {
      await cancelReservationApi(reservation.reservationId)
      setFeedback({ tone: 'success', message: 'Đã hủy lượt đặt bàn.' })
      if (editing?.reservationId === reservation.reservationId) setEditing(null)
      reload({ quiet: true })
    },
  })

  const startEdit = (reservation) => {
    setEditing(reservation)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="moc-page-shell"><MocSiteHeader />
      <main className="max-w-[1280px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <header><span className="moc-eyebrow">TRẢI NGHIỆM TẠI MỘC</span><h1 className="mt-4 moc-serif text-4xl sm:text-6xl font-medium tracking-[-0.04em]">Đặt bàn</h1><p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-[#625a55]">Chọn thời gian, số khách và không gian phù hợp. Mộc sẽ xác nhận để chuẩn bị bàn chỉn chu trước khi bạn đến.</p></header>
        <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-6" />
        <div className="mt-8 grid xl:grid-cols-[1fr_1.05fr] gap-6 items-start">
          <ReservationForm key={editing?.reservationId || 'new'} reservation={editing} onSubmit={save} onCancelEdit={() => setEditing(null)} submitting={submitting} />
          <section className="moc-panel p-5 sm:p-7" aria-labelledby="my-reservations">
            <div className="flex items-center gap-3"><CalendarDays className="h-6 w-6 text-[#6f1d32]" /><h2 id="my-reservations" className="moc-serif text-2xl sm:text-3xl">Lịch của bạn</h2></div>
            {loading && <div className="mt-6 grid gap-3" role="status" aria-label="Đang tải lịch đặt bàn"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>}
            {!loading && error && <div className="mt-6 border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert"><p>{error}</p><Button size="sm" className="mt-4" onClick={() => reload()}>Thử lại</Button></div>}
            {!loading && !error && !data?.items?.length && <div className="mt-6 border border-dashed border-[var(--moc-line)] p-8 text-center"><CalendarDays className="mx-auto h-8 w-8 text-[#6f1d32]" /><p className="mt-3 text-sm text-[#625a55]">Bạn chưa có lịch đặt bàn nào. Hãy chọn một buổi tối ở biểu mẫu bên cạnh.</p></div>}
            {!loading && !error && data?.items?.length > 0 && (
              <>
                <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#625a55]">Sắp tới ({upcoming.length})</h3>
                {upcoming.length ? <div className="mt-3 grid gap-3">{upcoming.map((reservation) => <ReservationCard key={reservation.reservationId} reservation={reservation} onEdit={startEdit} onCancel={cancel} />)}</div> : <p className="mt-3 text-sm text-[#625a55]">Không có lịch sắp tới.</p>}
                {history.length > 0 && (
                  <details className="mt-6 group">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.12em] text-[#625a55]">Lịch sử ({history.length})</summary>
                    <div className="mt-3 grid gap-3">{history.map((reservation) => <ReservationCard key={reservation.reservationId} reservation={reservation} onEdit={startEdit} onCancel={cancel} />)}</div>
                  </details>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
      <MocFooter /></div>
  )
}

export default CustomerReservationsPage
