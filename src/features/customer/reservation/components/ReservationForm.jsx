import { useMemo, useState } from 'react'
import { CalendarDays, Clock3, Search, Users } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { getAvailableTablesApi } from '../services/reservationService'
import { apiErrorMessage } from '../../../../lib/apiError'

const datePart = (value) => value ? value.slice(0, 10) : ''
const timePart = (value) => value ? value.slice(11, 16) : ''
const todayInput = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
const SPECIAL_KEYWORDS = ['sinh nhật', 'phòng riêng', 'vip', 'chay', 'trang trí']

export const ReservationForm = ({ reservation, onSubmit, onCancelEdit, submitting }) => {
  const initialDate = useMemo(() => reservation ? datePart(reservation.reservationTime) : '', [reservation])
  const initialTime = useMemo(() => reservation ? timePart(reservation.reservationTime) : '19:00', [reservation])
  const [form, setForm] = useState({ date: initialDate, time: initialTime, guestCount: reservation?.guestCount || 2, note: reservation?.note || '', tableId: reservation?.table?.tableId || '' })
  const [tables, setTables] = useState(reservation?.table ? [reservation.table] : [])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  const update = (event) => {
    const { name, value } = event.target
    setError(null)
    setForm((current) => ({ ...current, [name]: value, ...(['date', 'time', 'guestCount'].includes(name) && !reservation ? { tableId: '' } : {}) }))
    if (['date', 'time', 'guestCount'].includes(name) && !reservation) setTables([])
  }
  const isSpecialRequest = SPECIAL_KEYWORDS.some((keyword) => form.note.toLocaleLowerCase('vi-VN').includes(keyword))
  const validateSlot = () => {
    if (!form.date || !form.time || !form.guestCount) return 'Hãy chọn ngày, giờ và số khách trước.'
    const guests = Number(form.guestCount)
    if (!Number.isInteger(guests) || guests < 1 || guests > 30) return 'Số khách từ 1 đến 30 người.'
    const minutesAhead = (new Date(`${form.date}T${form.time}:00`).getTime() - Date.now()) / 60000
    if (minutesAhead < (isSpecialRequest ? 120 : 30)) return isSpecialRequest ? 'Yêu cầu đặc biệt cần đặt trước ít nhất 2 giờ.' : 'Vui lòng đặt trước giờ đến ít nhất 30 phút.'
    return null
  }
  const findTables = async () => {
    const slotError = validateSlot()
    if (slotError) { setError(slotError); return }
    setSearching(true); setError(null)
    try {
      const response = await getAvailableTablesApi({ date: form.date, time: form.time, guestCount: Number(form.guestCount) })
      setTables(response.data.items || [])
      setForm((current) => ({ ...current, tableId: response.data.items?.some((table) => String(table.tableId) === String(current.tableId)) ? current.tableId : '' }))
      if (!response.data.items?.length) setError('Chưa có bàn phù hợp ở khung giờ này. Hãy thử giờ khác.')
    } catch (err) { setError(apiErrorMessage(err, 'Không thể tìm bàn trống.')) }
    finally { setSearching(false) }
  }
  const submit = async (event) => {
    event.preventDefault(); setError(null)
    const slotError = validateSlot()
    if (slotError) { setError(slotError); return }
    if (!form.tableId) { setError('Hãy bấm “Kiểm tra bàn trống” và chọn một bàn phù hợp.'); return }
    try {
      await onSubmit({ tableId: Number(form.tableId), reservationTime: `${form.date} ${form.time}:00`, guestCount: Number(form.guestCount), note: form.note || null })
      if (!reservation) setForm({ date: '', time: '19:00', guestCount: 2, note: '', tableId: '' })
    } catch (err) { setError(apiErrorMessage(err, 'Không thể lưu lượt đặt bàn.')) }
  }

  return (
    <form onSubmit={submit} className="moc-panel p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><span className="moc-eyebrow">{reservation ? 'CHỈNH SỬA' : 'TÌM BÀN'}</span><h2 className="mt-3 moc-serif text-2xl sm:text-3xl">{reservation ? `Lượt đặt #${reservation.reservationId}` : 'Chọn một buổi tối thật vừa ý.'}</h2></div>{reservation && <Button size="sm" variant="ghost" onClick={onCancelEdit}>Đóng</Button>}</div>
      <div className="mt-6 grid sm:grid-cols-3 gap-4"><Input name="date" type="date" label="Ngày đến" icon={CalendarDays} value={form.date} onChange={update} min={todayInput()} required /><Input name="time" type="time" label="Giờ đến" icon={Clock3} value={form.time} onChange={update} required /><Input name="guestCount" type="number" min="1" max="30" label="Số khách" icon={Users} value={form.guestCount} onChange={update} required /></div>
      <Button type="button" variant="outline" icon={Search} isLoading={searching} className="mt-4" onClick={findTables}>Kiểm tra bàn trống</Button>
      {tables.length > 0 && <div className="mt-5 grid sm:grid-cols-2 gap-3">{tables.map((table) => <label key={table.tableId} className={`cursor-pointer border p-4 transition-colors ${String(form.tableId) === String(table.tableId) ? 'border-[#6f1d32] bg-[#6f1d32]/5' : 'border-[var(--moc-line)] bg-white hover:border-[#6f1d32]/40'}`}><input type="radio" name="tableId" value={table.tableId} checked={String(form.tableId) === String(table.tableId)} onChange={update} className="sr-only" /><strong>{table.tableName}</strong><p className="mt-1 text-sm text-[#625a55]">{table.capacity} khách · {table.location}</p></label>)}</div>}
      <label className="mt-5 grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">Ghi chú trải nghiệm<textarea name="note" value={form.note} onChange={update} rows="3" placeholder="Ghế trẻ em, món chay, sinh nhật..." className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#6f1d32]" /></label>
      <p className="mt-3 text-xs leading-5 text-[#625a55]">Yêu cầu đặc biệt cần đặt trước ít nhất 2 giờ. Lượt đặt chỉ được giữ chính thức sau khi nhà hàng xác nhận.</p>
      {reservation?.status === 'CONFIRMED' && <p className="mt-3 border border-[#6f1d32]/20 bg-[#6f1d32]/5 p-3 text-sm text-[#6f1d32]">Lượt đặt đã được xác nhận. Nếu đổi giờ, bàn hoặc số khách, nhà hàng sẽ xác nhận lại.</p>}
      {error && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <Button type="submit" isLoading={submitting} className="mt-5 w-full sm:w-auto">{reservation ? 'Lưu thay đổi' : 'Gửi yêu cầu đặt bàn'}</Button>
    </form>
  )
}

export default ReservationForm
