import { useMemo, useState } from 'react'
import { Plus, Search, SearchX, X } from 'lucide-react'
import { ALLERGEN_LABEL, FALLBACK_DISH_IMAGE, formatVnd } from '../constants'

const normalize = (value) => (value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

const DishTile = ({ dish, inCart, onOpen, onQuickAdd }) => {
  const soldOut = !dish.isAvailable
  return (
    <article className={`group relative overflow-hidden rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8] shadow-[0_10px_30px_rgba(65,29,23,0.06)] ${soldOut ? 'opacity-80' : ''}`}>
      <button type="button" onClick={() => onOpen(dish)} className="block w-full text-left" aria-label={`Xem ${dish.dishName}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eee6dc]">
          <img
            src={dish.imageUrl || FALLBACK_DISH_IMAGE}
            alt={dish.dishName}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = FALLBACK_DISH_IMAGE }}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? 'grayscale' : ''}`}
          />
          {soldOut && <span className="absolute left-3 top-3 rounded-full bg-[#211b18]/85 px-3 py-1 text-xs font-semibold text-[#fff8ed]">Tạm hết món</span>}
          {inCart > 0 && <span key={inCart} className="moc-pop moc-inverse absolute right-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-[#6f1d32] px-2 text-sm font-bold text-[#fff8ed]">{inCart}</span>}
        </div>
        <div className="p-4 pb-16">
          <h3 className="moc-serif text-xl font-medium leading-snug text-[#211b18]">{dish.dishName}</h3>
          {dish.description && <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#625a55]">{dish.description}</p>}
          {dish.allergens?.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-1.5">
              {dish.allergens.map((allergen) => <span key={allergen} className="rounded-full bg-[#f3e7d3] px-2 py-0.5 text-xs font-semibold text-[#6b4a12]">{ALLERGEN_LABEL[allergen] || allergen}</span>)}
            </p>
          )}
        </div>
      </button>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between">
        <strong className="text-lg font-bold text-[#6f1d32]">{formatVnd(dish.price)}</strong>
        <button
          type="button"
          onClick={() => onQuickAdd(dish)}
          disabled={soldOut}
          aria-label={`Thêm ${dish.dishName} vào giỏ`}
          className="moc-inverse pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-[#6f1d32] text-[#fff8ed] shadow-[0_10px_20px_rgba(111,29,50,0.3)] transition active:scale-90 disabled:bg-[#b9aea3] disabled:shadow-none"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}

export const MenuSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8]">
        <div className="aspect-[4/3] animate-pulse bg-[#eae1d6]" />
        <div className="space-y-2 p-4"><div className="h-5 w-2/3 animate-pulse rounded bg-[#eae1d6]" /><div className="h-4 w-full animate-pulse rounded bg-[#f0e8de]" /></div>
      </div>
    ))}
  </div>
)

/** Thực đơn tại bàn: tìm kiếm, danh mục cuộn ngang, thẻ món ảnh lớn. */
export const MenuBrowser = ({ menu, loading, error, onRetry, quantityOf, onOpenDish, onQuickAdd }) => {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('ALL')

  const categories = useMemo(() => {
    const used = new Set((menu?.dishes || []).map((dish) => dish.categoryId))
    return (menu?.categories || []).filter((category) => used.has(category.categoryId))
  }, [menu])

  const visible = useMemo(() => {
    const query = normalize(keyword.trim())
    return (menu?.dishes || [])
      .filter((dish) => categoryId === 'ALL' || dish.categoryId === categoryId)
      .filter((dish) => !query || normalize(dish.dishName).includes(query) || normalize(dish.description).includes(query))
      .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
  }, [menu, keyword, categoryId])

  return (
    <section aria-labelledby="dine-menu-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="moc-eyebrow">THỰC ĐƠN</span>
          <h2 id="dine-menu-title" className="mt-2 moc-serif text-3xl font-medium text-[#211b18]">Chọn món cho bàn</h2>
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-4 mt-4 bg-[#f5f0e7]/95 px-4 pb-3 pt-2 backdrop-blur">
        <label className="relative block">
          <span className="sr-only">Tìm món</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a817a]" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm phở, bún chả, trà đào..."
            className="h-12 w-full rounded-full border border-[var(--moc-line)] bg-[#fffdf8] pl-12 pr-12 text-base text-[#211b18] outline-none placeholder:text-[#8a817a] focus:border-[#6f1d32] focus:ring-2 focus:ring-[#6f1d32]/15"
          />
          {keyword && (
            <button type="button" onClick={() => setKeyword('')} aria-label="Xóa tìm kiếm" className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[#625a55]"><X className="h-4 w-4" /></button>
          )}
        </label>
        <div className="moc-scroll-x -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Danh mục món">
          {[{ categoryId: 'ALL', categoryName: 'Tất cả' }, ...categories].map((category) => {
            const active = categoryId === category.categoryId
            return (
              <button
                key={category.categoryId}
                type="button"
                aria-pressed={active}
                onClick={() => setCategoryId(category.categoryId)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${active ? 'moc-inverse border-[#6f1d32] bg-[#6f1d32] text-[#fff8ed]' : 'border-[var(--moc-line)] bg-[#fffdf8] text-[#3d2f2a]'}`}
              >
                {category.categoryName}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2">
        {loading && <MenuSkeleton />}
        {!loading && error && (
          <div className="rounded-[24px] border border-[var(--moc-line)] bg-[#fffdf8] p-6 text-center">
            <p className="text-[15px] text-[#625a55]">Chưa tải được thực đơn. Kiểm tra kết nối rồi thử lại.</p>
            <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-full border border-[#6f1d32]/35 px-5 text-sm font-semibold text-[#6f1d32]">Thử lại</button>
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center">
            <SearchX className="mx-auto h-9 w-9 text-[#6f1d32]" />
            <p className="mt-3 text-[15px] text-[#625a55]">Không có món phù hợp với “{keyword}”. Thử từ khóa khác nhé.</p>
          </div>
        )}
        {!loading && !error && visible.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((dish) => <DishTile key={dish.dishId} dish={dish} inCart={quantityOf(dish.dishId)} onOpen={onOpenDish} onQuickAdd={onQuickAdd} />)}
          </div>
        )}
      </div>
    </section>
  )
}

export default MenuBrowser
