import { useState } from 'react'
import { BellRing, CircleSlash, Clock3, KeyRound, Loader2, LockKeyhole, Minus, Plus, UsersRound, Wrench } from 'lucide-react'
import { apiErrorMessage } from '../../../lib/apiError'
import { formatWait, minutesSince } from '../../../lib/useNow'
import { VisitStatus } from '../constants'

const Stepper = ({ value, onChange, min = 1, max = 30 }) => (
  <div className="flex items-center rounded-full border border-[var(--moc-line)] bg-white">
    <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Giảm số khách" className="grid h-12 w-12 place-items-center rounded-full text-[#211b18] disabled:opacity-35">
      <Minus className="h-5 w-5" />
    </button>
    <output className="w-10 text-center moc-serif text-2xl" aria-live="polite">{value}</output>
    <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Tăng số khách" className="grid h-12 w-12 place-items-center rounded-full text-[#211b18] disabled:opacity-35">
      <Plus className="h-5 w-5" />
    </button>
  </div>
)

const CheckInForm = ({ table, onSubmit, disabledReason }) => {
  const [guestName, setGuestName] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = guestName.trim()
    if (!name) {
      setError('Vui lòng cho Mộc biết tên gọi của bạn.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ guestName: name, guestCount })
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Chưa gửi được yêu cầu. Vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="moc-fade-in rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(65,29,23,0.08)] sm:p-7" noValidate>
      <span className="moc-eyebrow">NHẬN BÀN</span>
      <h2 className="mt-3 moc-serif text-3xl font-medium leading-tight text-[#211b18]">Chào mừng đến Mộc.</h2>
      <p className="mt-2 text-[15px] leading-6 text-[#625a55]">{table.tableName} chưa được mở phục vụ. Gửi yêu cầu để nhân viên chuẩn bị bàn và mở thực đơn cho bạn.</p>

      <label className="mt-6 block text-sm font-semibold text-[#211b18]" htmlFor="dine-guest-name">Tên gọi của bạn</label>
      <input
        id="dine-guest-name"
        value={guestName}
        onChange={(event) => setGuestName(event.target.value)}
        maxLength={40}
        autoComplete="given-name"
        placeholder="Ví dụ: Chị Mai"
        className="mt-2 h-12 w-full rounded-2xl border border-[var(--moc-line)] bg-white px-4 text-base text-[#211b18] outline-none placeholder:text-[#8a817a] focus:border-[#6f1d32] focus:ring-2 focus:ring-[#6f1d32]/15"
      />

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#211b18]"><UsersRound className="h-4 w-4 text-[#6f1d32]" /> Số khách</span>
        <Stepper value={guestCount} onChange={setGuestCount} max={Math.max(2, (table.capacity || 4) * 2)} />
      </div>

      {error && <p className="mt-4 rounded-2xl bg-[#fbeaea] px-4 py-3 text-sm text-[#8a1c1c]" role="alert">{error}</p>}
      {disabledReason && <p className="mt-4 rounded-2xl bg-[#f3e7d3] px-4 py-3 text-sm text-[#6b4a12]">{disabledReason}</p>}

      <button
        type="submit"
        disabled={submitting || !!disabledReason}
        className="moc-inverse mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] px-6 text-base font-semibold text-[#fff8ed] shadow-[0_14px_30px_rgba(111,29,50,0.28)] transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <BellRing className="h-5 w-5" />}
        {submitting ? 'Đang gửi yêu cầu...' : 'Yêu cầu nhận bàn'}
      </button>
    </form>
  )
}

/**
 * Bàn đã có phiên: thiết bị mới cần mã bàn 4 số (nhân viên đọc hoặc khách cùng bàn chia sẻ).
 * Mã thay đổi theo từng phiên nên QR in cố định không tự cấp quyền vào bữa ăn của người khác.
 */
const JoinCodeForm = ({ table, locked, waitingForStaff, onJoin }) => {
  const [code, setCode] = useState('')
  const [guestName, setGuestName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!/^\d{4}$/.test(code)) {
      setError('Mã bàn gồm 4 chữ số.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onJoin(guestName.trim() || undefined, code)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Chưa tham gia được bàn. Vui lòng thử lại.'))
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  if (locked) {
    return (
      <section className="moc-fade-in rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-6 text-center sm:p-8" role="alert">
        <LockKeyhole className="mx-auto h-11 w-11 text-[#6f1d32]" />
        <h2 className="mt-4 moc-serif text-3xl font-medium text-[#211b18]">Mã bàn đang tạm khóa</h2>
        <p className="mt-2 text-[15px] leading-6 text-[#625a55]">{table.tableName} đã nhận quá nhiều mã sai. Vui lòng nhờ nhân viên tạo mã mới, trang sẽ cho bạn nhập lại.</p>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="moc-fade-in rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(65,29,23,0.08)] sm:p-7" noValidate>
      <span className="moc-eyebrow">THAM GIA BÀN</span>
      <h2 className="mt-3 moc-serif text-3xl font-medium leading-tight text-[#211b18]">{table.tableName} đang phục vụ</h2>
      <p className="mt-2 text-[15px] leading-6 text-[#625a55]">
        Nhập <strong className="text-[#211b18]">mã bàn 4 số</strong> do nhân viên cung cấp, hoặc xem trên điện thoại của người đã gọi món cùng bàn (mục “Mời bạn cùng bàn”).
        {waitingForStaff && ' Yêu cầu nhận bàn của bạn vẫn đang chờ, nhân viên cũng có thể xác nhận trực tiếp.'}
      </p>
      <label htmlFor="dine-join-code" className="mt-6 block text-sm font-semibold text-[#211b18]">Mã bàn</label>
      <input
        id="dine-join-code"
        value={code}
        onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 4)); setError(null) }}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="• • • •"
        className="mt-2 h-14 w-full rounded-2xl border border-[var(--moc-line)] bg-white px-4 text-center font-mono text-3xl tracking-[0.6em] text-[#211b18] outline-none placeholder:text-[#b9aea3] focus:border-[#6f1d32] focus:ring-2 focus:ring-[#6f1d32]/15"
      />
      <label htmlFor="dine-join-name" className="mt-4 block text-sm font-semibold text-[#211b18]">Tên gọi <span className="font-normal text-[#625a55]">(không bắt buộc)</span></label>
      <input id="dine-join-name" value={guestName} onChange={(event) => setGuestName(event.target.value)} maxLength={40} placeholder="Ví dụ: Anh Nam" className="mt-2 h-12 w-full rounded-2xl border border-[var(--moc-line)] bg-white px-4 text-base outline-none placeholder:text-[#8a817a] focus:border-[#6f1d32]" />
      {error && <p className="mt-4 rounded-2xl bg-[#fbeaea] px-4 py-3 text-sm text-[#8a1c1c]" role="alert">{error}</p>}
      <button type="submit" disabled={submitting} className="moc-inverse mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6f1d32] px-6 text-base font-semibold text-[#fff8ed] shadow-[0_14px_30px_rgba(111,29,50,0.28)] transition active:scale-[0.98] disabled:opacity-60">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
        {submitting ? 'Đang kiểm tra mã...' : 'Tham gia gọi món'}
      </button>
    </form>
  )
}

const PendingCard = ({ visit, now, onCancel }) => {
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)
  const waited = minutesSince(visit.requestedAt, now)

  const handleCancel = async () => {
    setCancelling(true)
    setError(null)
    try {
      await onCancel()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <section className="moc-fade-in rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-6 text-center shadow-[0_18px_50px_rgba(65,29,23,0.08)] sm:p-8" aria-live="polite">
      <div className="relative mx-auto grid h-24 w-24 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[#6f1d32]/15 moc-ring" />
        <span className="absolute inset-3 rounded-full bg-[#6f1d32]/10 moc-ring [animation-delay:0.6s]" />
        <span className="moc-inverse relative grid h-16 w-16 place-items-center rounded-full bg-[#6f1d32] text-[#fff8ed]"><BellRing className="h-7 w-7" /></span>
      </div>
      <h2 className="mt-6 moc-serif text-3xl font-medium text-[#211b18]">Đã báo nhân viên</h2>
      <p className="mt-2 text-[15px] leading-6 text-[#625a55]">Cảm ơn {visit.guestName || 'bạn'}. Nhân viên sẽ xác nhận bàn cho {visit.guestCount} khách trong giây lát, trang sẽ tự mở thực đơn.</p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f1e9de] px-4 py-2 text-sm font-semibold text-[#3d2f2a]"><Clock3 className="h-4 w-4" /> Đã chờ {formatWait(waited).toLowerCase()}</p>
      {error && <p className="mt-4 text-sm text-[#8a1c1c]" role="alert">{error}</p>}
      <button type="button" onClick={handleCancel} disabled={cancelling} className="mt-6 min-h-12 w-full rounded-full border border-[#6f1d32]/35 px-6 text-sm font-semibold text-[#6f1d32] disabled:opacity-60">
        {cancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
      </button>
    </section>
  )
}

const ClosedVisitCard = ({ visit, onRetry }) => {
  const meta = {
    [VisitStatus.REJECTED]: { title: 'Nhân viên chưa thể nhận bàn', body: visit.rejectReason || 'Vui lòng liên hệ nhân viên để được hỗ trợ.' },
    [VisitStatus.EXPIRED]: { title: 'Yêu cầu đã hết hạn', body: 'Yêu cầu chưa được xử lý kịp. Bạn có thể gửi lại hoặc vẫy nhân viên gần nhất.' },
    [VisitStatus.CANCELLED]: { title: 'Bạn đã hủy yêu cầu', body: 'Gửi lại bất cứ khi nào bạn sẵn sàng.' },
  }[visit.status]

  return (
    <section className="moc-fade-in rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-6 text-center sm:p-8">
      <CircleSlash className="mx-auto h-11 w-11 text-[#6f1d32]" />
      <h2 className="mt-4 moc-serif text-3xl font-medium text-[#211b18]">{meta?.title}</h2>
      <p className="mt-2 text-[15px] leading-6 text-[#625a55]">{meta?.body}</p>
      <button type="button" onClick={onRetry} className="moc-inverse mt-6 min-h-12 w-full rounded-full bg-[#6f1d32] px-6 text-sm font-semibold text-[#fff8ed]">
        Gửi lại yêu cầu nhận bàn
      </button>
    </section>
  )
}

/** Màn hình trước khi khách vào thực đơn: gửi yêu cầu nhận bàn, chờ, bị từ chối, bảo trì. */
export const EntryStage = ({ state, now, onCheckIn, onCancelCheckIn, onStartOver, onJoin }) => {
  const { table, entry, visit } = state

  if (!table.inService) {
    return (
      <section className="rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-7 text-center">
        <Wrench className="mx-auto h-11 w-11 text-[#6f1d32]" />
        <h2 className="mt-4 moc-serif text-3xl font-medium text-[#211b18]">Bàn đang tạm nghỉ</h2>
        <p className="mt-2 text-[15px] leading-6 text-[#625a55]">{table.tableName} đang được bảo trì. Nhân viên Mộc sẽ sắp xếp chỗ ngồi khác cho bạn.</p>
      </section>
    )
  }

  if (entry.hasActiveSession) {
    return <JoinCodeForm table={table} locked={entry.joinCodeLocked} waitingForStaff={visit?.status === VisitStatus.PENDING} onJoin={onJoin} />
  }

  if (visit?.status === VisitStatus.PENDING) return <PendingCard visit={visit} now={now} onCancel={onCancelCheckIn} />
  if (visit && [VisitStatus.REJECTED, VisitStatus.EXPIRED, VisitStatus.CANCELLED].includes(visit.status)) {
    return <ClosedVisitCard visit={visit} onRetry={onStartOver} />
  }

  return (
    <CheckInForm
      table={table}
      onSubmit={onCheckIn}
      disabledReason={entry.hasPendingCheckIn ? 'Một thiết bị khác tại bàn vừa gửi yêu cầu nhận bàn. Trang sẽ tự cập nhật khi nhân viên mở bàn.' : null}
    />
  )
}

export default EntryStage
