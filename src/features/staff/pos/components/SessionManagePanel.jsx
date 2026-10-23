import { useCallback, useState } from 'react'
import { ArrowRightLeft, CheckCircle2, CircleOff, Clock3, History, ShieldAlert, ShieldCheck, UserRoundMinus, UsersRound, XCircle } from 'lucide-react'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import AuditHistoryModal from '../../../../components/ui/AuditHistoryModal'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { apiErrorMessage } from '../../../../lib/apiError'
import { APPROVAL_STATUS_LABEL, AUDIT_ACTION_LABEL, formatMoney } from '../constants'
import ChangeTablesModal from './ChangeTablesModal'
import {
  approveApprovalApi,
  cancelApprovalApi,
  changeGuestCountApi,
  createApprovalApi,
  finishWithoutChargeApi,
  getSessionHistoryApi,
  rejectApprovalApi,
  writeOffSessionApi,
} from '../services/posService'

const formatTime = (value) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

const GuestCountModal = ({ session, onClose, onDone }) => {
  const capacity = session.tables.reduce((sum, table) => sum + table.capacity, 0)
  const [count, setCount] = useState(session.guestCount)
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await changeGuestCountApi(session.sessionId, count, reason.trim() || null)
      onDone(`Đã cập nhật số khách thành ${count}.`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title="Đổi số khách" maxWidth="max-w-md">
      <form onSubmit={submit} className="grid gap-4">
        <p className="text-sm text-[#625a55]">Các bàn của phiên có {capacity} chỗ. Nếu khách đông hơn, hãy ghép thêm bàn trước.</p>
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
          Số khách thực tế
          <input type="number" min="1" max={capacity} value={count} onChange={(event) => setCount(Number(event.target.value))} className="min-h-11 border border-[var(--moc-line)] bg-white px-3 text-base font-semibold normal-case tracking-normal text-[#211b18]" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
          Ghi chú (không bắt buộc)
          <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} placeholder="Ví dụ: Thêm 2 bạn đến muộn" className="min-h-11 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18]" />
        </label>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" isLoading={submitting} disabled={count < 1}>Lưu số khách</Button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * Điều chỉnh phiên đang phục vụ: số khách, chuyển/ghép bàn, giờ phải trả bàn, yêu cầu duyệt,
 * lịch sử thao tác và ghi nhận thất thu khi khách bỏ về (SES-04/05/06/08/09, AUD-01).
 */
export const SessionManagePanel = ({ session, isAdmin, currentUserId, outstanding, onChanged, onNotice, onError }) => {
  const [modal, setModal] = useState(null)
  const [dialog, setDialog] = useState(null)
  const active = ['OPEN', 'AWAITING_PAYMENT'].includes(session.status)
  const approvals = session.approvals || []
  const pending = approvals.filter((approval) => approval.status === 'PENDING')
  const expectedEnd = session.expectedEndAt ? new Date(session.expectedEndAt) : null
  const overdue = active && expectedEnd && expectedEnd < new Date()
  const hasSentItems = session.orders?.some((order) => order.items?.some((item) => !['DRAFT', 'CANCELLED'].includes(item.kitchenStatus)))
  const allItems = (session.orders || []).flatMap((order) => order.items || [])
  // Mọi món đã gửi bếp đều bị hủy/từ chối, không còn phần tính tiền, chưa có hóa đơn (review E).
  const nothingCharged = session.status === 'OPEN'
    && allItems.length > 0
    && allItems.every((item) => ['CANCELLED', 'REJECTED'].includes(item.kitchenStatus) && Number(item.billedQuantity || 0) === 0)
    && allItems.some((item) => item.voidReason)
    && !(session.invoice && session.invoice.status !== 'VOID')
  const loadHistory = useCallback(() => getSessionHistoryApi(session.sessionId), [session.sessionId])

  const done = (message) => {
    setModal(null)
    onNotice(message)
    onChanged()
  }

  const decide = (approval, approve) => setDialog({
    title: approve ? `Duyệt: ${approval.label}` : `Từ chối: ${approval.label}`,
    tone: approve ? 'primary' : 'danger',
    description: approval.reason,
    details: `Người gửi: ${approval.requestedBy || '—'}`,
    confirmLabel: approve ? 'Duyệt và thực hiện' : 'Từ chối yêu cầu',
    reason: approve
      ? { label: 'Ghi chú của quản lý', required: false, maxLength: 500 }
      : { label: 'Lý do từ chối', minLength: 3, maxLength: 500 },
    onConfirm: async (note) => {
      if (approve) await approveApprovalApi(approval.approvalId, note || null)
      else await rejectApprovalApi(approval.approvalId, note)
      onNotice(approve ? 'Đã duyệt và thực hiện yêu cầu.' : 'Đã từ chối yêu cầu.')
      onChanged()
    },
  })

  const withdraw = async (approval) => {
    try {
      await cancelApprovalApi(approval.approvalId)
      onNotice('Đã rút yêu cầu duyệt.')
      onChanged()
    } catch (requestError) {
      onError(apiErrorMessage(requestError))
    }
  }

  const writeOff = () => setDialog({
    title: isAdmin ? 'Ghi nhận thất thu & đóng phiên' : 'Báo khách bỏ về chưa thanh toán',
    tone: 'danger',
    description: isAdmin
      ? `Phiên sẽ đóng với khoản thất thu ${formatMoney(outstanding)}. Hóa đơn không bị ghi là đã thanh toán; tiền đã nhận được giữ nguyên.`
      : `Gửi quản lý duyệt ghi nhận thất thu ${formatMoney(outstanding)}. Phiên giữ nguyên tới khi quản lý quyết định.`,
    confirmLabel: isAdmin ? 'Ghi nhận thất thu' : 'Gửi quản lý duyệt',
    reason: { label: 'Mô tả sự việc', placeholder: 'Ví dụ: Khách rời đi lúc 20:15, đã gọi điện không liên lạc được', minLength: 3 },
    onConfirm: async (note) => {
      if (isAdmin) await writeOffSessionApi(session.sessionId, note)
      else await createApprovalApi({ type: 'SESSION_WRITE_OFF', targetId: session.sessionId, reason: note })
      onNotice(isAdmin ? 'Đã đóng phiên với khoản thất thu.' : 'Đã gửi yêu cầu ghi nhận thất thu cho quản lý.')
      onChanged()
    },
  })

  const finishWithoutCharge = () => setDialog({
    title: 'Kết thúc phiên không tính tiền',
    description: 'Mọi món đã bị hủy hoặc bếp từ chối nên khách không phải trả tiền. Phiên đóng, lịch sử món được giữ nguyên, bàn chuyển sang chờ vệ sinh.',
    confirmLabel: 'Kết thúc phiên',
    reason: { label: 'Ghi chú', placeholder: 'Ví dụ: Bếp hết nguyên liệu, khách không gọi món khác', minLength: 3 },
    onConfirm: async (note) => {
      await finishWithoutChargeApi(session.sessionId, note)
      onNotice('Đã kết thúc phiên không phát sinh tiền. Bàn đang chờ vệ sinh.')
      onChanged()
    },
  })

  return (
    <section className="mb-5 border border-[var(--moc-line)] bg-[#fffdf8] p-4" aria-label="Điều chỉnh phiên">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {expectedEnd && active && (
            <span className={`inline-flex items-center gap-1.5 ${overdue ? 'font-semibold text-[#8a1c1c]' : 'text-[#625a55]'}`}>
              <Clock3 className="h-4 w-4" />{overdue ? `Đã quá giờ dự kiến trả bàn (${formatTime(expectedEnd)})` : `Dự kiến trả bàn ${formatTime(expectedEnd)}`}
            </span>
          )}
          {session.writeOff && <span className="font-semibold text-[#8a1c1c]">Thất thu {formatMoney(session.writeOff.amount)} · {session.writeOff.reason}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {active && <Button size="sm" variant="outline" icon={UsersRound} onClick={() => setModal('guests')}>Số khách</Button>}
          {active && <Button size="sm" variant="outline" icon={ArrowRightLeft} onClick={() => setModal('tables')}>Chuyển / ghép bàn</Button>}
          <Button size="sm" variant="ghost" icon={History} onClick={() => setModal('history')}>Lịch sử</Button>
          {active && hasSentItems && outstanding > 0 && <Button size="sm" variant="ghost" icon={UserRoundMinus} onClick={writeOff}>Khách bỏ về</Button>}
          {nothingCharged && <Button size="sm" variant="outline" icon={CircleOff} onClick={finishWithoutCharge}>Kết thúc phiên (không tính tiền)</Button>}
        </div>
      </div>

      {approvals.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {approvals.slice(0, 5).map((approval) => (
            <li key={approval.approvalId} className={`flex flex-wrap items-center justify-between gap-3 border px-3 py-2.5 text-sm ${approval.status === 'PENDING' ? 'border-amber-300 bg-amber-50' : 'border-[var(--moc-line)] bg-white'}`}>
              <span className="min-w-0">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  {approval.status === 'PENDING' ? <ShieldAlert className="h-4 w-4 text-amber-700" /> : approval.status === 'APPROVED' ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <XCircle className="h-4 w-4 text-[#8a1c1c]" />}
                  {approval.label} · {APPROVAL_STATUS_LABEL[approval.status]}
                </span>
                <span className="block text-[#625a55]">{approval.reason} — {approval.requestedBy}{approval.decisionNote ? ` · QL: ${approval.decisionNote}` : ''}</span>
              </span>
              {approval.status === 'PENDING' && (
                <span className="flex gap-2">
                  {isAdmin && <Button size="sm" icon={ShieldCheck} onClick={() => decide(approval, true)}>Duyệt</Button>}
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => decide(approval, false)}>Từ chối</Button>}
                  {!isAdmin && approval.requestedById === currentUserId && <Button size="sm" variant="ghost" onClick={() => withdraw(approval)}>Rút yêu cầu</Button>}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {pending.length > 0 && !isAdmin && <p className="mt-2 text-xs text-[#625a55]">Quản lý duyệt trên tài khoản của mình (màn Quản trị → Duyệt yêu cầu hoặc tại phiên này).</p>}

      {modal === 'guests' && <GuestCountModal session={session} onClose={() => setModal(null)} onDone={done} />}
      {modal === 'tables' && <ChangeTablesModal session={session} onClose={() => setModal(null)} onDone={done} />}
      {modal === 'history' && <AuditHistoryModal title={`Lịch sử phiên #${session.sessionId}`} load={loadHistory} actionLabels={AUDIT_ACTION_LABEL} onClose={() => setModal(null)} />}
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </section>
  )
}

export default SessionManagePanel
