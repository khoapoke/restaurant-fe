import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { TABLE_STATUS_LABEL } from '../constants'

export const TableEditorModal = ({ table, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ tableName: table?.tableName || '', capacity: table?.capacity || 4, location: table?.location || '', status: table?.status || 'AVAILABLE' })
  const [error, setError] = useState(null)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setError(null)
    try { await onSave({ ...form, capacity: Number(form.capacity) }) }
    catch (err) { setError(err.response?.data?.message || 'Không thể lưu bàn ăn.') }
  }

  return (
    <Modal isOpen onClose={onClose} title={table ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}>
      <form onSubmit={submit} className="grid gap-4">
        <Input name="tableName" label="Tên bàn" value={form.tableName} onChange={update} required />
        <div className="grid sm:grid-cols-2 gap-4"><Input name="capacity" label="Sức chứa" type="number" min="1" max="30" value={form.capacity} onChange={update} required /><label className="grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">Trạng thái<select name="status" value={form.status} onChange={update} className="min-h-12 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal">{Object.entries(TABLE_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        <Input name="location" label="Vị trí" value={form.location} onChange={update} placeholder="Tầng 1 - Sảnh chính" />
        {error && <p className="bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Đóng</Button><Button type="submit" isLoading={saving}>Lưu bàn</Button></div>
      </form>
    </Modal>
  )
}

export default TableEditorModal
