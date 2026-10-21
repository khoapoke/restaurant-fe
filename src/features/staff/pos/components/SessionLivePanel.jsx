import { useState } from 'react'
import { BellRing, Check, CheckCheck, CreditCard, KeyRound, QrCode, RefreshCcw, Smartphone } from 'lucide-react'
import TableQrModal from '../../../../components/ui/TableQrModal'
import { apiErrorMessage } from '../../../../lib/apiError'
import { acknowledgeServiceRequestApi, completeServiceRequestApi, rotateJoinCodeApi } from '../services/posService'

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
const PAYMENT_LABEL = { CASH: 'tiền mặt', BANK_TRANSFER_QR: 'chuyển khoản QR' }

/** Live Dining trong phiên POS: thiết bị khách đang kết nối, mã QR bàn và yêu cầu phục vụ. */
export const SessionLivePanel = ({ session, onChanged }) => {
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const [qrOpen, setQrOpen] = useState(false)
  const openRequests = (session.serviceRequests || []).filter((request) => ['NEW', 'ACKNOWLEDGED'].includes(request.status))
  const live = session.liveDining

  const [rotating, setRotating] = useState(false)

  const rotateCode = async () => {
    setRotating(true)
    setError(null)
    try {
      await rotateJoinCodeApi(session.sessionId)
      onChanged()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setRotating(false)
    }
  }

  const act = async (request, action) => {
    setBusyId(request.requestId)
    setError(null)
    try {
      await action(request.requestId)
      onChanged()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className={`mb-5 border bg-[#fffdf8] ${openRequests.some((request) => request.status === 'NEW') ? 'border-[#6f1d32]/40 moc-glow' : 'border-[var(--moc-line)]'}`} aria-label="Live Dining của bàn">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-[#211b18]">
          <Smartphone className="h-4 w-4 text-[#6f1d32]" />
          <strong>{live?.connectedGuests || 0} thiết bị khách</strong>
          <span className="text-[#625a55]">đang theo dõi bàn qua QR</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {live?.joinCode && (
            <span className={`inline-flex min-h-11 items-center gap-2 border px-3 text-sm ${live.joinCodeLocked ? 'border-[#b42318]/40 bg-[#fbeaea] text-[#8a1c1c]' : 'border-[#6f1d32]/30 bg-[#6f1d32]/5 text-[#211b18]'}`} title="Khách mới nhập mã này để tham gia gọi món">
              <KeyRound className="h-4 w-4 text-[#6f1d32]" /> Mã bàn <strong className="font-mono text-lg tracking-[0.2em]">{live.joinCode}</strong>{live.joinCodeLocked && ' · đã khóa'}
            </span>
          )}
          <button type="button" onClick={rotateCode} disabled={rotating} className="inline-flex min-h-11 items-center gap-2 border border-[var(--moc-line)] px-3 text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40 disabled:opacity-50">
            <RefreshCcw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} /> {live?.joinCodeLocked ? 'Mở khóa · tạo mã mới' : 'Tạo mã mới'}
          </button>
          <button type="button" onClick={() => setQrOpen(true)} disabled={!live?.qrUrl} className="inline-flex min-h-11 items-center gap-2 border border-[var(--moc-line)] px-3 text-sm font-semibold text-[#211b18] hover:border-[#6f1d32]/40 disabled:opacity-50">
            <QrCode className="h-4 w-4" /> Mã QR bàn
          </button>
        </div>
      </div>
      {error && <p className="border-t border-[var(--moc-line)] px-4 py-2 text-sm text-[#8a1c1c]" role="alert">{error}</p>}
      {openRequests.length > 0 && (
        <ul className="divide-y divide-[var(--moc-line)] border-t border-[var(--moc-line)]">
          {openRequests.map((request) => (
            <li key={request.requestId} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${request.isPriority ? 'bg-[#f3e7d3]/60' : ''}`}>
              {request.isPriority ? <CreditCard className="h-5 w-5 text-[#6f1d32]" /> : <BellRing className="h-5 w-5 text-[#6f1d32]" />}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#211b18]">{request.label} <span className="font-normal text-[#625a55]">· {formatTime(request.createdAt)}</span></p>
                {(request.note || request.preferredMethod) && <p className="text-sm text-[#625a55]">{request.note ? `“${request.note}”` : `Muốn trả bằng ${PAYMENT_LABEL[request.preferredMethod]}`}</p>}
              </div>
              {request.status === 'NEW' ? (
                <button type="button" disabled={busyId === request.requestId} onClick={() => act(request, acknowledgeServiceRequestApi)} className="moc-inverse inline-flex min-h-11 items-center gap-2 bg-[#6f1d32] px-4 text-sm font-bold text-[#fff8ed] disabled:opacity-50"><Check className="h-4 w-4" /> NHẬN</button>
              ) : (
                <button type="button" disabled={busyId === request.requestId} onClick={() => act(request, completeServiceRequestApi)} className="inline-flex min-h-11 items-center gap-2 border border-[#14532d]/40 px-4 text-sm font-bold text-[#14532d] disabled:opacity-50"><CheckCheck className="h-4 w-4" /> XONG</button>
              )}
            </li>
          ))}
        </ul>
      )}
      <TableQrModal isOpen={qrOpen} onClose={() => setQrOpen(false)} tableName={session.tables?.map((table) => table.tableName).join(' + ')} url={live?.qrUrl} />
    </section>
  )
}

export default SessionLivePanel
