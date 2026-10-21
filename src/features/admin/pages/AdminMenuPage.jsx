import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import FeedbackBanner from '../../../components/ui/FeedbackBanner'
import Input from '../../../components/ui/Input'
import { apiErrorMessage } from '../../../lib/apiError'
import { useApiResource } from '../../../lib/useApiResource'
import { FALLBACK_DISH_IMAGE } from '../../customer/menu/constants'
import AdminDataState from '../components/AdminDataState'
import MenuEditorModal from '../components/MenuEditorModal'
import { formatCurrency } from '../constants'
import { createCategoryApi, createDishApi, deleteCategoryApi, deleteDishApi, getAdminCategoriesApi, getAdminDishesApi, toggleCategoryApi, toggleDishAvailabilityApi, toggleDishVisibilityApi, updateCategoryApi, updateDishApi } from '../services/adminService'

const selectClass = 'min-h-12 border border-[var(--moc-line)] bg-white px-4 text-sm text-[#211b18] outline-none focus:border-[#6f1d32]'

export const AdminMenuPage = () => {
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', categoryId: '', availability: '' })
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pendingKey, setPendingKey] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => (current.keyword === keywordInput.trim() ? current : { ...current, keyword: keywordInput.trim() })), 350)
    return () => window.clearTimeout(timer)
  }, [keywordInput])

  const loader = useCallback(() => Promise.all([
    getAdminCategoriesApi(),
    getAdminDishesApi({
      perPage: 100,
      keyword: filters.keyword || undefined,
      categoryId: filters.categoryId || undefined,
      isAvailable: filters.availability === '' ? undefined : filters.availability,
    }),
  ]).then(([categoryResponse, dishResponse]) => ({ categories: categoryResponse.data || [], dishes: dishResponse.data.items || [] })), [filters])
  const { data, loading, error, reload } = useApiResource(loader, { fallbackError: 'Không thể tải thực đơn quản trị.' })
  const categories = data?.categories || []
  const dishes = data?.dishes || []

  const mutate = async (key, action, successMessage) => {
    setPendingKey(key)
    setFeedback(null)
    try {
      await action()
      setFeedback({ tone: 'success', message: successMessage })
      reload({ quiet: true })
    } catch (requestError) {
      setFeedback({ tone: 'error', message: apiErrorMessage(requestError) })
    } finally {
      setPendingKey(null)
    }
  }

  const saveEditor = async (payload) => {
    setSaving(true)
    try {
      if (editor.type === 'dish') await (editor.item ? updateDishApi(editor.item.dishId, payload) : createDishApi(payload))
      else await (editor.item ? updateCategoryApi(editor.item.categoryId, payload) : createCategoryApi(payload))
      setFeedback({ tone: 'success', message: editor.type === 'dish' ? `Đã lưu món ${payload.dishName}.` : `Đã lưu danh mục ${payload.categoryName}.` })
      setEditor(null)
      reload({ quiet: true })
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteCategory = (category) => setDialog({
    title: `Xóa danh mục ${category.categoryName}`,
    tone: 'danger',
    description: 'Danh mục sẽ được xóa mềm và các món trong danh mục sẽ bị ẩn khỏi thực đơn khách hàng. Lịch sử đơn hàng vẫn được giữ nguyên.',
    confirmLabel: 'Xóa danh mục',
    onConfirm: async () => {
      await deleteCategoryApi(category.categoryId)
      setFeedback({ tone: 'success', message: `Đã xóa danh mục ${category.categoryName}.` })
      reload({ quiet: true })
    },
  })

  const confirmDeleteDish = (dish) => setDialog({
    title: `Xóa món ${dish.dishName}`,
    tone: 'danger',
    description: 'Món sẽ được xóa mềm: ngừng bán, ẩn khỏi thực đơn và POS. Đơn hàng cũ có món này vẫn hiển thị đầy đủ.',
    confirmLabel: 'Xóa món',
    onConfirm: async () => {
      await deleteDishApi(dish.dishId)
      setFeedback({ tone: 'success', message: `Đã xóa món ${dish.dishName}.` })
      reload({ quiet: true })
    },
  })

  return (
    <div className="max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><span className="moc-eyebrow">BẾP & THỰC ĐƠN</span><h1 className="mt-3 moc-serif text-4xl sm:text-5xl">Quản lý thực đơn</h1><p className="mt-3 text-sm text-[#625a55]">Danh mục, giá bán, hình ảnh và trạng thái phục vụ của từng món.</p></div>
        <div className="flex flex-wrap gap-3"><Button variant="outline" icon={Plus} onClick={() => setEditor({ type: 'category' })}>Danh mục</Button><Button icon={Plus} onClick={() => setEditor({ type: 'dish' })} disabled={!categories.length}>Thêm món</Button></div>
      </header>
      <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} className="mt-5" />

      <div className="mt-7">
        <AdminDataState loading={loading} error={error} onRetry={() => reload()} empty={false}>
          <section className="moc-panel p-5">
            <h2 className="moc-serif text-2xl">Danh mục</h2>
            {categories.length === 0 ? <p className="mt-3 text-sm text-[#625a55]">Chưa có danh mục. Hãy tạo danh mục trước khi thêm món.</p> : (
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <div key={category.categoryId} className={`flex items-center gap-2 border px-3 py-2 ${category.isVisible ? 'border-[var(--moc-line)] bg-white' : 'border-dashed border-[#6f1d32]/30 bg-[#f5f0e7]'}`}>
                    <span className="text-sm font-semibold">{category.categoryName}</span>
                    <span className="text-xs text-[#625a55]">{category.dishesCount ?? 0} món{category.isVisible ? '' : ' · đang ẩn'}</span>
                    <button type="button" disabled={pendingKey === `category-${category.categoryId}`} onClick={() => mutate(`category-${category.categoryId}`, () => toggleCategoryApi(category.categoryId, !category.isVisible), category.isVisible ? `Đã ẩn danh mục ${category.categoryName}.` : `Đã hiện danh mục ${category.categoryName}.`)} className="p-1.5 text-[#6f1d32] hover:bg-[#6f1d32]/8 disabled:opacity-40" aria-label={category.isVisible ? `Ẩn ${category.categoryName}` : `Hiện ${category.categoryName}`}>{category.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button type="button" onClick={() => setEditor({ type: 'category', item: category })} className="p-1.5 hover:bg-[#6f1d32]/8" aria-label={`Sửa ${category.categoryName}`}><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => confirmDeleteCategory(category)} className="p-1.5 text-red-700 hover:bg-red-50" aria-label={`Xóa ${category.categoryName}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 moc-panel p-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Input icon={Search} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tìm món theo tên..." aria-label="Tìm món" />
            <select value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))} className={selectClass} aria-label="Lọc danh mục">
              <option value="">Mọi danh mục</option>
              {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}
            </select>
            <select value={filters.availability} onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))} className={selectClass} aria-label="Lọc tình trạng bán">
              <option value="">Mọi tình trạng</option><option value="true">Còn bán</option><option value="false">Tạm hết</option>
            </select>
          </section>

          {dishes.length === 0 ? (
            <div className="mt-5 min-h-48 grid place-items-center border border-dashed border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center text-sm text-[#625a55]">Không có món phù hợp.</div>
          ) : (
            <section className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {dishes.map((dish) => {
                const busy = pendingKey === `dish-${dish.dishId}`
                return (
                  <article key={dish.dishId} className={`moc-panel overflow-hidden flex flex-col ${dish.isVisible ? '' : 'opacity-80'}`}>
                    <div className="relative aspect-[16/9] bg-[#e7ddd2]">
                      <img src={dish.imageUrl || FALLBACK_DISH_IMAGE} alt={dish.dishName} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_DISH_IMAGE }} className="h-full w-full object-cover" />
                      {!dish.isVisible && <span className="absolute left-3 top-3 bg-[#251b19]/85 px-2.5 py-1 text-xs font-bold text-white moc-inverse">Đang ẩn khỏi thực đơn</span>}
                    </div>
                    <div className="p-5 flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold text-[#6f1d32]">{dish.categoryName}</p><h3 className="mt-1 moc-serif text-xl">{dish.dishName}</h3></div><strong className="shrink-0 text-sm text-[#6f1d32]">{formatCurrency(dish.price)}</strong></div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#625a55]">{dish.description || 'Chưa có mô tả.'}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" disabled={busy} onClick={() => mutate(`dish-${dish.dishId}`, () => toggleDishAvailabilityApi(dish.dishId, !dish.isAvailable), dish.isAvailable ? `${dish.dishName} đã chuyển sang tạm hết.` : `${dish.dishName} đã mở bán lại.`)} className={`min-h-9 px-3 text-xs font-bold disabled:opacity-50 ${dish.isAvailable ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`} aria-label={`Đổi tình trạng bán của ${dish.dishName}`}>{dish.isAvailable ? 'Còn bán · bấm để báo hết' : 'Tạm hết · bấm để mở bán'}</button>
                        <button type="button" disabled={busy} onClick={() => mutate(`dish-${dish.dishId}`, () => toggleDishVisibilityApi(dish.dishId, !dish.isVisible), dish.isVisible ? `Đã ẩn ${dish.dishName}.` : `Đã hiện ${dish.dishName}.`)} className="min-h-9 px-3 bg-[#eee6dc] text-xs font-semibold text-[#211b18] disabled:opacity-50">{dish.isVisible ? 'Ẩn món' : 'Hiện món'}</button>
                      </div>
                      <div className="mt-auto pt-5 flex gap-2"><Button size="sm" variant="outline" icon={Pencil} onClick={() => setEditor({ type: 'dish', item: dish })}>Sửa</Button><Button size="sm" variant="ghost" icon={Trash2} onClick={() => confirmDeleteDish(dish)}>Xóa</Button></div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}
        </AdminDataState>
      </div>

      {editor && <MenuEditorModal key={`${editor.type}-${editor.item?.dishId || editor.item?.categoryId || 'new'}`} {...editor} categories={categories} saving={saving} onClose={() => !saving && setEditor(null)} onSave={saveEditor} />}
      {dialog && <ConfirmDialog key={dialog.title} isOpen {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default AdminMenuPage
