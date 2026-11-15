import { ALLERGENS } from '../../profile/constants'

/**
 * Sub-component Bảng Bộ Lọc Nâng Cao (MenuFilterPanel)
 * - Lọc theo khoảng giá tối thiểu/tối đa
 * - Lọc theo trạng thái món sẵn sàng phục vụ
 * - Lọc loại trừ chất gây dị ứng theo tiêu chuẩn y tế
 * - Độ dài < 110 dòng
 */
export default function MenuFilterPanel({
  localMinPrice,
  setLocalMinPrice,
  localMaxPrice,
  setLocalMaxPrice,
  localIsAvailable,
  setLocalIsAvailable,
  localAllergens,
  toggleAllergen,
  handleReset,
  handleApply,
}) {
  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Khoảng giá */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-2">
            Khoảng giá (VNĐ)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Từ..."
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-bg border border-border-subtle text-xs text-text-main focus:outline-none focus:border-brand-primary"
            />
            <span className="text-text-dim text-xs">-</span>
            <input
              type="number"
              placeholder="Đến..."
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-bg border border-border-subtle text-xs text-text-main focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Trạng thái phục vụ */}
        <div>
          <label className="text-xs font-semibold text-text-main block mb-2">
            Trạng thái món
          </label>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={localIsAvailable}
              onChange={(e) => setLocalIsAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary accent-amber-500 cursor-pointer"
            />
            <span className="text-xs text-text-body">Chỉ hiển thị món đang sẵn sàng phục vụ</span>
          </label>
        </div>

        {/* Loại trừ dị ứng */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="text-xs font-semibold text-text-main block mb-2">
            Loại trừ chất gây dị ứng
          </label>
          <div className="flex flex-wrap gap-2">
            {(ALLERGENS || ['Hải sản', 'Đậu phộng', 'Trứng', 'Sữa', 'Gluten', 'Đậu nành']).map((alg) => {
              const val = typeof alg === 'object' ? alg.value || alg.label : alg
              const label = typeof alg === 'object' ? alg.label : alg
              const active = localAllergens.includes(val)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleAllergen(val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-status-error/15 text-status-error border border-status-error/30'
                      : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-subtle'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors cursor-pointer"
        >
          Đặt lại
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-surface-bg transition-colors cursor-pointer shadow-sm"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  )
}

