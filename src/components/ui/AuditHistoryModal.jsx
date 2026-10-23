import { useEffect, useState } from 'react'
import { History, Loader2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { apiErrorMessage } from '../../lib/apiError'

const formatDateTime = (value) => new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })

const ROLE_LABEL = { ADMIN: 'Quản lý', STAFF: 'Nhân viên', CUSTOMER: 'Khách hàng' }

const describeValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const changes = (before, after) => {
  const keys = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])]
  return keys
    .filter((key) => describeValue(before?.[key]) !== describeValue(after?.[key]))
    .map((key) => ({ key, from: before ? describeValue(before[key]) : null, to: describeValue(after?.[key]) }))
}

/**
 * Nhật ký thao tác chỉ đọc (AUD-01): ai, lúc nào, làm gì, lý do, trước/sau.
 * `load` trả về Promise của phản hồi API `{ data: AuditLog[] }`.
 */
export const AuditHistoryModal = ({ title, load, actionLabels = {}, onClose }) => {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    load()
      .then((response) => active && setEntries(response.data || []))
      .catch((requestError) => active && setError(apiErrorMessage(requestError, 'Không tải được lịch sử thao tác.')))
    return () => { active = false }
  }, [load])

  return (
    <Modal isOpen onClose={onClose} title={title} maxWidth="max-w-2xl">
      <div className="grid gap-4">
        {!entries && !error && <p className="flex items-center gap-2 text-sm text-[#625a55]"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải lịch sử…</p>}
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
        {entries && entries.length === 0 && <p className="flex items-center gap-2 text-sm text-[#625a55]"><History className="h-4 w-4" /> Chưa có thao tác nào được ghi lại.</p>}
        {entries && entries.length > 0 && (
          <ol className="grid gap-3">
            {entries.map((entry) => (
              <li key={entry.logId} className="border border-[var(--moc-line)] bg-white px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong>{actionLabels[entry.action] || entry.action}</strong>
                  <span className="text-xs text-[#625a55]">{formatDateTime(entry.createdAt)} · {entry.actor || 'Hệ thống'}{ROLE_LABEL[entry.actorRole] ? ` · ${ROLE_LABEL[entry.actorRole]}` : ''}</span>
                </div>
                {entry.reason && <p className="mt-1 text-[#211b18]">Lý do: {entry.reason}</p>}
                {changes(entry.before, entry.after).length > 0 && (
                  <ul className="mt-2 grid gap-0.5 text-xs text-[#625a55]">
                    {changes(entry.before, entry.after).slice(0, 6).map((change) => (
                      <li key={change.key}><span className="font-semibold">{change.key}</span>: {change.from !== null ? `${change.from} → ` : ''}{change.to}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
        <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>Đóng</Button></div>
      </div>
    </Modal>
  )
}

export default AuditHistoryModal
