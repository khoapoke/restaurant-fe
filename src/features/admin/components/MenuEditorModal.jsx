import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

const listToText = (value) => (value || []).join(', ')
const textToList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)

export const MenuEditorModal = ({ type, item, categories, onClose, onSave, saving }) => {
  const isDish = type === 'dish'
  const [form, setForm] = useState(isDish ? {
    dishName: item?.dishName || '', price: item?.price || '', description: item?.description || '', imageUrl: item?.imageUrl || '',
    categoryId: item?.categoryId || categories[0]?.categoryId || '', ingredients: listToText(item?.ingredients), allergens: listToText(item?.allergens),
  } : {
    categoryName: item?.categoryName || '', description: item?.description || '', displayOrder: item?.displayOrder ?? categories.length + 1,
  })
  const [error, setError] = useState(null)

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setError(null)
    const payload = isDish ? {
      ...form, price: Number(form.price), categoryId: Number(form.categoryId), ingredients: textToList(form.ingredients), allergens: textToList(form.allergens),
      weatherTags: item?.weatherTags || ['PLEASANT_NORMAL'], isAvailable: item?.isAvailable ?? true, isVisible: item?.isVisible ?? true,
    } : { ...form, displayOrder: Number(form.displayOrder), isVisible: item?.isVisible ?? true }
    try { await onSave(payload) } catch (err) { setError(err.response?.data?.message || 'Không thể lưu dữ liệu.') }
  }

  return (
    <Modal isOpen onClose={onClose} title={`${item ? 'Chỉnh sửa' : 'Thêm'} ${isDish ? 'món ăn' : 'danh mục'}`} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="grid gap-4">
        <Input name={isDish ? 'dishName' : 'categoryName'} label={isDish ? 'Tên món' : 'Tên danh mục'} value={isDish ? form.dishName : form.categoryName} onChange={update} required />
        {isDish && <div className="grid sm:grid-cols-2 gap-4"><Input name="price" type="number" min="0" label="Giá bán" value={form.price} onChange={update} required /><label className="grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">Danh mục<select name="categoryId" value={form.categoryId} onChange={update} className="min-h-12 border border-[var(--moc-line)] bg-white px-3 text-sm font-normal normal-case tracking-normal" required>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label></div>}
        <label className="grid gap-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#625a55]">Mô tả<textarea name="description" value={form.description} onChange={update} rows="3" className="border border-[var(--moc-line)] bg-white p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#6f1d32]" /></label>
        {isDish ? <>
          <Input name="imageUrl" label="Đường dẫn ảnh" value={form.imageUrl} onChange={update} placeholder="/images/menu/ten-mon.jpg" />
          <Input name="ingredients" label="Nguyên liệu" value={form.ingredients} onChange={update} helperText="Ngăn cách bằng dấu phẩy" />
          <Input name="allergens" label="Chất dị ứng" value={form.allergens} onChange={update} helperText="Ví dụ: PEANUT, EGG, DAIRY" />
        </> : <Input name="displayOrder" type="number" min="0" label="Thứ tự hiển thị" value={form.displayOrder} onChange={update} />}
        {error && <p className="bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Đóng</Button><Button type="submit" isLoading={saving}>Lưu thay đổi</Button></div>
      </form>
    </Modal>
  )
}

export default MenuEditorModal
