import { Search, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FALLBACK_DISH_IMAGE } from '../../../customer/menu/constants'
import { formatMoney } from '../constants'

export const DishPicker = ({ dishes, categories, onAdd, addingDishId, disabled }) => {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('ALL')

  const visibleDishes = useMemo(() => {
    const normalized = keyword.trim().toLocaleLowerCase('vi-VN')
    return dishes.filter((dish) => {
      const matchesKeyword = !normalized || dish.dishName.toLocaleLowerCase('vi-VN').includes(normalized)
      const matchesCategory = categoryId === 'ALL' || String(dish.categoryId) === categoryId
      return dish.isAvailable && matchesKeyword && matchesCategory
    })
  }, [dishes, keyword, categoryId])

  return (
    <section className="w-full min-w-0 bg-[#fffdf8] border border-[var(--moc-line)] min-h-[620px]">
      <div className="min-w-0 p-5 border-b border-[var(--moc-line)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="moc-eyebrow">THỰC ĐƠN</span>
            <h2 className="mt-2 moc-serif text-3xl">Chọn món</h2>
          </div>
          <span className="text-sm text-[#766e68]">{visibleDishes.length} món</span>
        </div>
        <label className="mt-5 h-12 flex items-center gap-3 px-4 border border-[var(--moc-line)] bg-white focus-within:border-[#6f1d32]">
          <Search className="w-5 h-5 text-[#766e68]" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm món theo tên..." className="w-full bg-transparent outline-none text-base placeholder:text-[#a19891]" />
        </label>
        <div className="max-w-full mt-3 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategoryId('ALL')} className={`shrink-0 min-h-10 px-4 text-sm font-bold ${categoryId === 'ALL' ? 'bg-[#251b19] text-white moc-inverse' : 'border border-[var(--moc-line)]'}`}>TẤT CẢ</button>
          {categories.map((category) => (
            <button key={category.categoryId} type="button" onClick={() => setCategoryId(String(category.categoryId))} className={`shrink-0 min-h-10 px-4 text-sm font-bold ${categoryId === String(category.categoryId) ? 'bg-[#251b19] text-white moc-inverse' : 'border border-[var(--moc-line)]'}`}>
              {category.categoryName.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {visibleDishes.length === 0 ? (
        <div className="min-h-72 grid place-items-center text-center p-8">
          <div><UtensilsCrossed className="w-9 h-9 mx-auto text-[#6f1d32]" /><p className="mt-4 moc-serif text-2xl">Không tìm thấy món phù hợp</p></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 2xl:grid-cols-3 gap-px bg-[var(--moc-line)]">
          {visibleDishes.map((dish) => (
            <article key={dish.dishId} className="bg-[#fffdf8] p-3 sm:p-4 flex flex-col min-w-0">
              <img src={dish.imageUrl || FALLBACK_DISH_IMAGE} alt={dish.dishName} onError={(event) => { event.currentTarget.src = FALLBACK_DISH_IMAGE }} className="w-full aspect-[4/3] object-cover bg-[#eee7dc]" />
              <p className="mt-3 text-xs sm:text-sm font-semibold tracking-[0.05em] text-[#6f1d32] truncate">{dish.categoryName}</p>
              <h3 className="mt-1 text-sm sm:text-base font-semibold leading-5 sm:leading-6 line-clamp-2">{dish.dishName}</h3>
              <div className="mt-auto pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <strong className="text-base text-[#6f1d32]">{formatMoney(dish.price)}</strong>
                <button type="button" disabled={disabled || addingDishId === dish.dishId} onClick={() => onAdd(dish)} aria-label={`Thêm ${dish.dishName}`} className="min-h-10 px-4 bg-[#6f1d32] text-white moc-inverse text-sm font-bold hover:bg-[#49101f] disabled:opacity-50">
                  {addingDishId === dish.dishId ? 'ĐANG THÊM' : 'THÊM MÓN'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default DishPicker
