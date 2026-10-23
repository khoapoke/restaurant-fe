import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, Loader2 } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { apiErrorMessage } from '../../../../lib/apiError'
import { TABLE_STATUS_META, TableStatus } from '../constants'
import { changeSessionTablesApi, getPosFloorApi } from '../services/posService'

const RELEASE_OPTIONS = [
  { value: 'CLEANING', label: 'Bàn cũ đã dùng · chờ vệ sinh' },
  { value: 'AVAILABLE', label: 'Bàn cũ chưa dùng · trống ngay' },
  { value: 'MAINTENANCE', label: 'Bàn cũ gặp sự cố · chuyển bảo trì' },
]

/**
 * Chuyển phiên sang bàn khác hoặc ghép thêm bàn (SES-05/06/08). Phiên, món, hóa đơn giữ nguyên;
 * khách dùng QR vẫn tiếp tục gọi món ở bàn mới.
 */
export const ChangeTablesModal = ({ session, onClose, onDone }) => {
  const currentIds = useMemo(() => session.tables.map((table) => table.tableId), [session])
  const [tables, setTables] = useState(null)
  const [selected, setSelected] = useState(currentIds)
  const [reason, setReason] = useState('')
  const [releaseAs, setReleaseAs] = useState('CLEANING')
  const [loadError, setLoadError] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getPosFloorApi()
      .then((response) => active && setTables(response.data?.items || []))
      .catch((requestError) => active && setLoadError(apiErrorMessage(requestError, 'Không tải được sơ đồ bàn.')))
    return () => { active = false }
  }, [])

  const releasing = currentIds.filter((id) => !selected.includes(id))
  const capacity = (tables || []).filter((table) => selected.includes(table.tableId)).reduce((sum, table) => sum + table.capacity, 0)
  const selectable = (table) => currentIds.includes(table.tableId) || [TableStatus.AVAILABLE, TableStatus.RESERVED].includes(table.status)

  const toggle = (tableId) => setSelected((value) => (value.includes(tableId) ? value.filter((id) => id !== tableId) : [...value, tableId]))

  const submit = async (event) => {
    event.preventDefault()
    if (!selected.length) { setError('Vui lòng chọn ít nhất một bàn.'); return }
    if (reason.trim().length < 3) { setError('Vui lòng nhập lý do (tối thiểu 3 ký tự).'); return }
    setSubmitting(true)
    setError(null)
    try {
      await changeSessionTablesApi(session.sessionId, { tableIds: selected, reason: reason.trim(), releaseAs })
      onDone(releasing.length ? 'Đã chuyển phiên sang bàn mới. Khách dùng QR tiếp tục gọi món ở bàn mới.' : 'Đã ghép thêm bàn cho phiên.')
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={() => !submitting && onClose()} title={`Chuyển / ghép bàn · Phiên #${session.sessionId}`} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="grid gap-5">
        <p className="text-sm leading-6 text-[#625a55]">Chọn các bàn mà phiên sẽ dùng. Bỏ chọn bàn hiện tại để chuyển khách; chọn thêm bàn để ghép. Bàn đang giữ cho khách đặt trước sẽ bị từ chối nếu trùng giờ.</p>
        {loadError && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{loadError}</p>}
        {!tables && !loadError && <p className="flex items-center gap-2 text-sm text-[#625a55]"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải sơ đồ bàn…</p>}
        {tables && (
          <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
            {tables.map((table) => {
              const enabled = selectable(table)
              const meta = TABLE_STATUS_META[table.status]
              return (
                <label key={table.tableId} className={`flex items-center gap-3 border px-3 py-2.5 text-sm ${selected.includes(table.tableId) ? 'border-[#6f1d32] bg-[#6f1d32]/5' : 'border-[var(--moc-line)] bg-white'} ${enabled ? 'cursor-pointer' : 'opacity-45'}`}>
                  <input type="checkbox" disabled={!enabled} checked={selected.includes(table.tableId)} onChange={() => toggle(table.tableId)} className="h-4 w-4 accent-[#6f1d32]" />
                  <span className="min-w-0 flex-1">
                    <strong className="block">{table.tableName}{currentIds.includes(table.tableId) ? ' · đang dùng' : ''}</strong>
                    <span className="text-xs text-[#625a55]">{table.capacity} chỗ · {meta?.label}{table.upcomingReservation ? ` · đặt ${new Date(table.upcomingReservation.reservationTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                  </span>
                </label>
              )
            })}
          </div>
        )}
        <p className="text-sm">Sức chứa sau thay đổi: <strong>{capacity}</strong> chỗ · phiên có <strong>{session.guestCount}</strong> khách</p>
        {releasing.length > 0 && (
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
            Bàn được trả lại
            <select value={releaseAs} onChange={(event) => setReleaseAs(event.target.value)} className="min-h-11 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18]">
              {RELEASE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#625a55]">
          Lý do
          <textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} placeholder="Ví dụ: Bàn cũ hỏng chân, khách muốn gần cửa sổ, thêm 3 khách" className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal text-[#211b18] outline-none focus:border-[#6f1d32]" />
        </label>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Quay lại</Button>
          <Button type="submit" icon={ArrowRightLeft} isLoading={submitting}>Lưu thay đổi bàn</Button>
        </div>
      </form>
    </Modal>
  )
}

export default ChangeTablesModal
