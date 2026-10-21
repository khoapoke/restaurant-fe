import { BellRing, Check, CheckCheck, Clock3, CreditCard, QrCode, X } from 'lucide-react'
import { formatWait, minutesSince } from '../../../../lib/useNow'

const PAYMENT_LABEL = { CASH: 'tiền mặt', BANK_TRANSFER_QR: 'chuyển khoản QR' }

const WaitChip = ({ since, now, warnAfter = 3 }) => {
  const minutes = minutesSince(since, now)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${minutes >= warnAfter ? 'text-[#8a1c1c]' : 'text-[#625a55]'}`}>
      <Clock3 className="h-3.5 w-3.5" /> chờ {formatWait(minutes).toLowerCase()}
    </span>
  )
}

/**
 * Hàng đợi vận hành trực tiếp trên sơ đồ bàn: yêu cầu nhận bàn qua QR và yêu cầu phục vụ.
 * Yêu cầu thanh toán luôn được đẩy lên đầu (backend sắp xếp sẵn).
 */
export const LiveQueuePanel = ({ queue, now, busyKey, onAcceptCheckIn, onRejectCheckIn, onAcknowledge, onComplete, onOpenTable }) => {
  const checkIns = queue?.checkIns || []
  const requests = queue?.serviceRequests || []
  const total = checkIns.length + requests.length

  return (
    <section className="border border-[var(--moc-line)] bg-[#fffdf8]" aria-labelledby="live-queue-title" aria-live="polite">
      <header className="moc-inverse flex flex-wrap items-center justify-between gap-3 bg-[#251b19] px-5 py-4 text-[#fff8ed]">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#6f1d32]">
            <BellRing className="h-5 w-5" />
            {total > 0 && <span className="absolute inset-0 rounded-full bg-[#6f1d32] moc-ring" />}
          </span>
          <div>
            <h2 id="live-queue-title" className="text-base font-bold">Hàng đợi Live Dining</h2>
            <p className="text-sm text-[#fff8ed]/80">{total ? `${checkIns.length} nhận bàn · ${requests.filter((request) => request.status === 'NEW').length} yêu cầu mới` : 'Không có yêu cầu đang chờ'}</p>
          </div>
        </div>
        {queue?.counts?.paymentRequests > 0 && <span className="inline-flex items-center gap-2 bg-[#e8c48a] px-3 py-1.5 text-sm font-bold text-[#211b18]"><CreditCard className="h-4 w-4" /> {queue.counts.paymentRequests} bàn xin thanh toán</span>}
      </header>

      {total === 0 && <p className="px-5 py-6 text-sm text-[#625a55]">Khách quét QR tại bàn để gửi yêu cầu nhận bàn, gọi nhân viên hoặc xin thanh toán. Yêu cầu mới sẽ xuất hiện ở đây trong vài giây.</p>}

      {total > 0 && (
        <ul className="grid divide-y divide-[var(--moc-line)] lg:grid-cols-2 lg:divide-y-0">
          {checkIns.map((checkIn) => (
            <li key={`c-${checkIn.visitId}`} className="moc-fade-in flex flex-wrap items-center gap-3 border-[var(--moc-line)] px-5 py-4 lg:border-b lg:odd:border-r">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#6f1d32]/10 text-[#6f1d32]"><QrCode className="h-5 w-5" /></span>
              <div className="min-w-[11rem] flex-1">
                <p className="text-[15px] font-bold text-[#211b18]">{checkIn.tableName} · xin nhận bàn</p>
                <p className="text-sm text-[#625a55]">{checkIn.guestName || 'Khách'} · {checkIn.guestCount} khách</p>
                <WaitChip since={checkIn.requestedAt} now={now} />
              </div>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => onRejectCheckIn(checkIn)} disabled={busyKey === `c-${checkIn.visitId}`} className="min-h-11 border border-[var(--moc-line)] px-3 text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40 disabled:opacity-50" aria-label={`Từ chối ${checkIn.tableName}`}>
                  <X className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onAcceptCheckIn(checkIn)} disabled={busyKey === `c-${checkIn.visitId}`} className="moc-inverse min-h-11 bg-[#6f1d32] px-4 text-sm font-bold text-[#fff8ed] hover:bg-[#49101f] disabled:opacity-50">
                  NHẬN KHÁCH
                </button>
              </div>
            </li>
          ))}
          {requests.map((request) => {
            const busy = busyKey === `r-${request.requestId}`
            return (
              <li key={`r-${request.requestId}`} className={`moc-fade-in flex flex-wrap items-center gap-3 border-[var(--moc-line)] px-5 py-4 lg:border-b lg:odd:border-r ${request.isPriority ? 'bg-[#f3e7d3]/60' : ''}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${request.isPriority ? 'moc-inverse bg-[#6f1d32] text-[#fff8ed]' : 'bg-[#f1e9de] text-[#6f1d32]'}`}>
                  {request.isPriority ? <CreditCard className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
                </span>
                <button type="button" onClick={() => onOpenTable(request)} className="min-w-[11rem] flex-1 text-left">
                  <p className="text-[15px] font-bold text-[#211b18]">{request.tableName} · {request.label}</p>
                  <p className="text-sm text-[#625a55]">
                    {request.note ? `“${request.note}”` : request.preferredMethod ? `Muốn trả bằng ${PAYMENT_LABEL[request.preferredMethod]}` : request.status === 'ACKNOWLEDGED' ? `${request.handledBy || 'Nhân viên'} đang xử lý` : 'Chưa có người nhận'}
                  </p>
                  <WaitChip since={request.createdAt} now={now} warnAfter={request.isPriority ? 2 : 4} />
                </button>
                {request.status === 'NEW' ? (
                  <button type="button" onClick={() => onAcknowledge(request)} disabled={busy} className="moc-inverse ml-auto inline-flex min-h-11 items-center gap-2 bg-[#6f1d32] px-4 text-sm font-bold text-[#fff8ed] hover:bg-[#49101f] disabled:opacity-50">
                    <Check className="h-4 w-4" /> NHẬN
                  </button>
                ) : (
                  <button type="button" onClick={() => onComplete(request)} disabled={busy} className="ml-auto inline-flex min-h-11 items-center gap-2 border border-[#14532d]/40 px-4 text-sm font-bold text-[#14532d] hover:bg-[#e3f1e6] disabled:opacity-50">
                    <CheckCheck className="h-4 w-4" /> XONG
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default LiveQueuePanel
