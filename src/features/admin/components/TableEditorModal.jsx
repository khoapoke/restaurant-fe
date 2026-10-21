import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { apiErrorMessage } from '../../../lib/apiError'
import { MANUAL_TABLE_STATUSES, TABLE_STATUS_LABEL } from '../constants'

const AUTOMATIC_STATUS_HINT = {
  OCCUPIED: 'Bàn đang có phiên POS. Trạng thái sẽ tự chuyển khi nhân viên đóng phiên.',
  RESERVED: 'Bàn đang được giữ cho lượt đặt hôm nay. Có thể chuyển Bảo trì sau khi hủy hoặc chuyển lượt đặt.',
}

export const TableEditorModal = ({ table, onClose, onSave, saving }) => {
  const isNew = !table
  const lockedStatus = table && !MANUAL_TABLE_STATUSES.includes(table.status) ? table.status : null
  const statusOptions = isNew ? ['AVAILABLE', 'MAINTENANCE'] : MANUAL_TABLE_STATUSES
  const [form, setForm] = useState({ tableName: table?.tableName || '', capacity: table?.capacity || 4, location: table?.location || '', status: table?.status || 'AVAILABLE' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setErrors((current) => ({ ...current, [event.target.name]: null }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    const nextErrors = {}
    if (!form.tableName.trim()) nextErrors.tableName = 'Vui lòng nhập tên bàn.'
    const capacity = Number(form.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) nextErrors.capacity = 'Sức chứa từ 1 đến 30 khách.'
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }

    const payload = { tableName: form.tableName.trim(), capacity, location: form.location.trim() || null }
    if (!lockedStatus && (isNew || form.status !== table.status)) payload.status = form.status
    try { await onSave(payload) }
    catch (requestError) { setError(apiErrorMessage(requestError, 'Không thể lưu bàn ăn.')) }
  }

  return (
    <Modal isOpen onClose={onClose} title={isNew ? 'Thêm bàn mới' : `Chỉnh sửa ${table.tableName}`}>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <Input name="tableName" label="Tên bàn" value={form.tableName} onChange={update} error={errors.tableName} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input name="capacity" label="Sức chứa" type="number" min="1" max="30" value={form.capacity} onChange={update} error={errors.capacity} required />
          <label className="grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">
            Trạng thái
            {lockedStatus ? (
              <span className="min-h-12 flex items-center border border-[var(--moc-line)] bg-[#f5f0e7] px-3 text-sm font-semibold normal-case tracking-normal text-[#211b18]">{TABLE_STATUS_LABEL[lockedStatus]} · tự động</span>
            ) : (
              <select name="status" value={form.status} onChange={update} className="min-h-12 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#211b18]">
                {statusOptions.map((value) => <option key={value} value={value}>{TABLE_STATUS_LABEL[value]}</option>)}
              </select>
            )}
          </label>
        </div>
        {lockedStatus && <p className="bg-[#f5f0e7] p-3 text-sm text-[#625a55]">{AUTOMATIC_STATUS_HINT[lockedStatus]}</p>}
        <Input name="location" label="Vị trí" value={form.location} onChange={update} placeholder="Tầng 1 - Sảnh chính" helperText="Phần trước dấu “-” được dùng để nhóm khu vực trên sơ đồ POS." />
        {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose} disabled={saving}>Đóng</Button><Button type="submit" isLoading={saving}>Lưu bàn</Button></div>
      </form>
    </Modal>
  )
}

export default TableEditorModal
