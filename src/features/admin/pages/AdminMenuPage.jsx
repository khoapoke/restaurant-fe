import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import Button from '../../../components/ui/Button'
import AdminDataState from '../components/AdminDataState'
import MenuEditorModal from '../components/MenuEditorModal'
import { formatCurrency } from '../constants'
import { createCategoryApi, createDishApi, deleteCategoryApi, deleteDishApi, getAdminCategoriesApi, getAdminDishesApi, toggleCategoryApi, toggleDishAvailabilityApi, toggleDishVisibilityApi, updateCategoryApi, updateDishApi } from '../services/adminService'

export const AdminMenuPage = () => {
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [categoryResponse, dishResponse] = await Promise.all([getAdminCategoriesApi(), getAdminDishesApi({ perPage: 100 })])
      setCategories(categoryResponse.data || []); setDishes(dishResponse.data.items || [])
    } catch (err) { setError(err.response?.data?.message || 'Không thể tải thực đơn quản trị.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    Promise.all([getAdminCategoriesApi(), getAdminDishesApi({ perPage: 100 })])
      .then(([categoryResponse, dishResponse]) => { if (active) { setCategories(categoryResponse.data || []); setDishes(dishResponse.data.items || []) } })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Không thể tải thực đơn quản trị.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const mutate = async (action, successMessage) => {
    setNotice(null)
    try { await action(); setNotice(successMessage); await load() }
    catch (err) { setNotice(err.response?.data?.message || 'Thao tác chưa thành công.') }
  }
  const saveEditor = async (payload) => {
    setSaving(true)
    try {
      if (editor.type === 'dish') await (editor.item ? updateDishApi(editor.item.dishId, payload) : createDishApi(payload))
      else await (editor.item ? updateCategoryApi(editor.item.categoryId, payload) : createCategoryApi(payload))
      setEditor(null); setNotice('Đã lưu thực đơn.'); await load()
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5"><div><span className="moc-eyebrow">BẾP & THỰC ĐƠN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Quản lý thực đơn</h1><p className="mt-3 text-sm text-[#625a55]">Danh mục, giá bán, hình ảnh và trạng thái phục vụ của từng món.</p></div><div className="flex gap-3"><Button variant="outline" icon={Plus} onClick={() => setEditor({ type: 'category' })}>Danh mục</Button><Button icon={Plus} onClick={() => setEditor({ type: 'dish' })}>Thêm món</Button></div></header>
      {notice && <p className="mt-5 border border-[#6f1d32]/20 bg-[#fffdf8] px-4 py-3 text-sm text-[#6f1d32]">{notice}</p>}
      <div className="mt-7"><AdminDataState loading={loading} error={error} onRetry={load} empty={!categories.length && !dishes.length}>
        <section className="moc-panel p-5"><h2 className="moc-serif text-2xl">Danh mục</h2><div className="mt-4 flex flex-wrap gap-3">{categories.map((category) => <div key={category.categoryId} className="flex items-center gap-2 border border-[var(--moc-line)] bg-white px-3 py-2"><span className="text-sm font-semibold">{category.categoryName}</span><span className="text-xs text-[#625a55]">{category.dishesCount ?? 0} món</span><button type="button" onClick={() => mutate(() => toggleCategoryApi(category.categoryId, !category.isVisible), 'Đã cập nhật danh mục.')} className="p-1 text-[#6f1d32]">{category.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button><button type="button" onClick={() => setEditor({ type: 'category', item: category })} className="p-1"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => window.confirm(`Xóa danh mục ${category.categoryName}?`) && mutate(() => deleteCategoryApi(category.categoryId), 'Đã xóa mềm danh mục.')} className="p-1 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>
        <section className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{dishes.map((dish) => <article key={dish.dishId} className="moc-panel overflow-hidden"><div className="aspect-[16/9] bg-[#e7ddd2]"><img src={dish.imageUrl || '/images/menu/pho-bo.jpg'} alt={dish.dishName} className="h-full w-full object-cover" /></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-[#6f1d32]">{dish.categoryName}</p><h3 className="mt-1 moc-serif text-xl">{dish.dishName}</h3></div><strong className="text-sm text-[#6f1d32]">{formatCurrency(dish.price)}</strong></div><p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#625a55]">{dish.description}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => mutate(() => toggleDishAvailabilityApi(dish.dishId, !dish.isAvailable), 'Đã cập nhật tình trạng bán.')} className={`px-2.5 py-1 text-xs font-bold ${dish.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{dish.isAvailable ? 'Còn bán' : 'Tạm hết'}</button><button type="button" onClick={() => mutate(() => toggleDishVisibilityApi(dish.dishId, !dish.isVisible), 'Đã cập nhật hiển thị.')} className="px-2.5 py-1 bg-[#eee6dc] text-xs">{dish.isVisible ? 'Đang hiện' : 'Đang ẩn'}</button></div><div className="mt-5 flex gap-2"><Button size="sm" variant="outline" icon={Pencil} onClick={() => setEditor({ type: 'dish', item: dish })}>Sửa</Button><Button size="sm" variant="ghost" icon={Trash2} onClick={() => window.confirm(`Xóa món ${dish.dishName}?`) && mutate(() => deleteDishApi(dish.dishId), 'Đã xóa mềm món ăn.')}>Xóa</Button></div></div></article>)}</section>
      </AdminDataState></div>
      {!loading && !dishes.length && <div className="mt-5 moc-panel p-10 text-center"><UtensilsCrossed className="mx-auto h-9 w-9 text-[#6f1d32]" /><p className="mt-3 text-sm">Chưa có món ăn.</p></div>}
      {editor && <MenuEditorModal key={`${editor.type}-${editor.item?.dishId || editor.item?.categoryId || 'new'}`} {...editor} categories={categories} saving={saving} onClose={() => !saving && setEditor(null)} onSave={saveEditor} />}
    </div>
  )
}

export default AdminMenuPage
