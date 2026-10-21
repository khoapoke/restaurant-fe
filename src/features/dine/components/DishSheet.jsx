import { useState } from 'react'
import { Minus, Plus, ShieldAlert } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { ALLERGEN_LABEL, FALLBACK_DISH_IMAGE, MAX_NOTE_LENGTH, MAX_QUANTITY, formatVnd } from '../constants'

/** Chi tiết món: ảnh lớn, mô tả, dị ứng, chọn số lượng và ghi chú riêng. */
export const DishSheet = ({ dish, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  if (!dish) return null
  const soldOut = !dish.isAvailable

  return (
    <BottomSheet
      open={!!dish}
      onClose={onClose}
      title={dish.dishName}
      subtitle={dish.categoryName}
      labelledBy="dine-dish-title"
      footer={(
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-[var(--moc-line)] bg-white">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1 || soldOut} aria-label="Giảm số lượng" className="grid h-12 w-12 place-items-center disabled:opacity-35"><Minus className="h-5 w-5" /></button>
            <output className="w-8 text-center text-lg font-bold" aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))} disabled={quantity >= MAX_QUANTITY || soldOut} aria-label="Tăng số lượng" className="grid h-12 w-12 place-items-center disabled:opacity-35"><Plus className="h-5 w-5" /></button>
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onAdd(dish, quantity, note)}
            className="moc-inverse min-h-12 flex-1 rounded-full bg-[#6f1d32] px-5 text-[15px] font-semibold text-[#fff8ed] transition active:scale-[0.98] disabled:bg-[#b9aea3]"
          >
            {soldOut ? 'Tạm hết món' : `Thêm · ${formatVnd(dish.price * quantity)}`}
          </button>
        </div>
      )}
    >
      <div className="-mx-5 overflow-hidden sm:mx-0 sm:rounded-[20px]">
        <img src={dish.imageUrl || FALLBACK_DISH_IMAGE} alt={dish.dishName} onError={(event) => { event.currentTarget.src = FALLBACK_DISH_IMAGE }} className="aspect-[16/10] w-full object-cover" />
      </div>
      <p className="mt-4 text-2xl font-bold text-[#6f1d32]">{formatVnd(dish.price)}</p>
      {dish.description && <p className="mt-2 text-[15px] leading-6 text-[#3d2f2a]">{dish.description}</p>}

      {dish.ingredients?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[#211b18]">Thành phần</h3>
          <p className="mt-1 text-sm leading-6 text-[#625a55]">{dish.ingredients.join(' · ')}</p>
        </div>
      )}

      <div className={`mt-4 flex gap-3 rounded-2xl p-3 text-sm ${dish.allergens?.length ? 'bg-[#f3e7d3] text-[#6b4a12]' : 'bg-[#eef4ee] text-[#1f5a35]'}`}>
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{dish.allergens?.length ? `Có chứa: ${dish.allergens.map((allergen) => ALLERGEN_LABEL[allergen] || allergen).join(', ')}. Báo nhân viên nếu bạn bị dị ứng.` : 'Không ghi nhận chất gây dị ứng phổ biến.'}</p>
      </div>

      <label htmlFor="dine-dish-note" className="mt-5 block text-sm font-semibold text-[#211b18]">Ghi chú cho bếp <span className="font-normal text-[#625a55]">(không bắt buộc)</span></label>
      <textarea
        id="dine-dish-note"
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE_LENGTH))}
        rows={2}
        placeholder="Ít cay, không hành, để riêng nước dùng..."
        className="mt-2 w-full resize-none rounded-2xl border border-[var(--moc-line)] bg-white px-4 py-3 text-base text-[#211b18] outline-none placeholder:text-[#8a817a] focus:border-[#6f1d32] focus:ring-2 focus:ring-[#6f1d32]/15"
      />
      <p className="mt-1 text-right text-xs text-[#625a55]">{note.length}/{MAX_NOTE_LENGTH}</p>
    </BottomSheet>
  )
}

export default DishSheet
