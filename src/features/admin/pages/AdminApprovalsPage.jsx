import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import { useApiResource } from '../../../lib/useApiResource'
import AdminDataState from '../components/AdminDataState'
import { formatDateTime } from '../constants'
import { APPROVAL_STATUS_LABEL, VOID_REASONS } from '../../staff/pos/constants'
import { approveRequestApi, declineRequestApi, getApprovalRequestsApi } from '../services/adminService'

const STATUSES = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

const describePayload = (approval) => {
  const payload = approval.payload || {}
  if (approval.type === 'ITEM_VOID') {
    const reason = VOID_REASONS.find((option) => option.value === payload.reason)?.label
    return `Món #${approval.targetId}${payload.quantity ? ` · ${payload.quantity} phần` : ''}${reason ? ` · ${reason}` : ''}`
  }
  if (approval.type === 'SEAT_OUTSIDE_WINDOW') return `Lượt đặt #${approval.targetId} · ${payload.guestCount || '?'} khách${payload.relocationReason ? ` · đổi bàn: ${payload.relocationReason}` : ''}`
  if (approval.type === 'SESSION_WRITE_OFF') return `Phiên #${approval.targetId}`
  return `#${approval.targetId}`
}

/**
 * Yêu cầu vượt quyền từ nhân viên (ADR-024): quản lý duyệt trên tài khoản của mình, không nhập
 * mật khẩu trên máy nhân viên. Duyệt là thực hiện luôn thao tác trong cùng giao dịch.
 */
export const AdminApprovalsPage = () => {
  const [status, setStatus] = useState('PENDING')
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)
  const loader = useCallback(() => getApprovalRequestsApi({ status }).then((response) => response.data), [status])
  const { data, loading, refreshing, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải yêu cầu duyệt.' })
  const approvals = data || []

  const decide = (approval, approve) => setDialog({
    title: `${approve ? 'Duyệt' : 'Từ chối'}: ${approval.label}`,
    tone: approve ? 'primary' : 'danger',
    description: approval.reason,
    details: `${describePayload(approval)} · gửi bởi ${approval.requestedBy || '—'} lúc ${formatDateTime(approval.createdAt)}`,
    confirmLabel: approve ? 'Duyệt và thực hiện' : 'Từ chối yêu cầu',
    reason: approve ? { label: 'Ghi chú của quản lý', required: false, maxLength: 500 } : { label: 'Lý do từ chối', minLength: 3, maxLength: 500 },
    onConfirm: async (note) => {
      if (approve) await approveRequestApi(approval.approvalId, note || null)
      else await declineRequestApi(approval.approvalId, note)
      setFeedback({ tone: 'success', message: approve ? `Đã duyệt và thực hiện: ${approval.label}.` : `Đã từ chối: ${approval.label}.` })
      reload({ quiet: true })
    },
  })

  return (
    <div className="max-w-[1200px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">KIỂM SOÁT</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Duyệt yêu cầu</h1><p className="mt-3 text-sm text-[#625a55]">Hủy món đã chế biến, nhận khách ngoài khung giờ, ghi nhận thất thu. Mỗi quyết định được lưu người duyệt, thời điểm và ghi chú.</p></div>
        <Button variant="outline" icon={RefreshCw} isLoading={refreshing && !loading} onClick={() => reload({ quiet: true })}>Làm mới</Button>
      </header>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Trạng thái">
        {STATUSES.map((option) => (
          <button key={option.value} type="button" role="tab" aria-selected={status === option.value} onClick={() => setStatus(option.value)} className={`min-h-10 border px-4 text-sm font-semibold ${status === option.value ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-white' : 'border-[var(--moc-line)] bg-[#fffdf8] text-[#211b18]'}`}>{option.label}</button>
        ))}
      </div>

      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-4" />

      <div className="mt-5">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={!approvals.length} emptyMessage={status === 'PENDING' ? 'Không có yêu cầu nào đang chờ duyệt.' : 'Chưa có yêu cầu nào.'}>
          <div className="grid gap-3">
            {approvals.map((approval) => (
              <article key={approval.approvalId} className="moc-panel flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-[#6f1d32]" />
                    <strong>{approval.label}</strong>
                    <span className="bg-[#eee6dc] px-2 py-0.5 text-xs font-bold">{APPROVAL_STATUS_LABEL[approval.status]}</span>
                    {approval.tableNames?.length > 0 && <span className="text-[#625a55]">{approval.tableNames.join(' + ')}</span>}
                  </p>
                  <p className="mt-2 text-sm text-[#211b18]">{approval.reason}</p>
                  <p className="mt-1 text-xs text-[#625a55]">{describePayload(approval)} · {approval.requestedBy} · {formatDateTime(approval.createdAt)}</p>
                  {approval.decidedBy && <p className="mt-1 text-xs text-[#625a55]">{approval.status === 'APPROVED' ? 'Duyệt' : 'Xử lý'} bởi {approval.decidedBy} · {formatDateTime(approval.decidedAt)}{approval.decisionNote ? ` — ${approval.decisionNote}` : ''}</p>}
                  {approval.sessionId && <Link to={`/staff/sessions/${approval.sessionId}`} className="mt-2 inline-block text-xs font-semibold text-[#6f1d32] underline underline-offset-4">Mở phiên #{approval.sessionId}</Link>}
                </div>
                {approval.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" icon={CheckCircle2} onClick={() => decide(approval, true)}>Duyệt</Button>
                    <Button size="sm" variant="ghost" icon={XCircle} onClick={() => decide(approval, false)}>Từ chối</Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </AdminDataState>
      </div>

      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminApprovalsPage
