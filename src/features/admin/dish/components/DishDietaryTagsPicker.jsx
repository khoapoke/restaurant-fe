import { ALLERGEN_OPTIONS, WEATHER_TAG_OPTIONS } from '../constants'

/**
 * Bộ chọn Dị ứng & Nhãn Gợi ý Thời tiết (DishDietaryTagsPicker)
 * - 100% Centralized Design Tokens
 * - Độ dài < 80 dòng
 */
export default function DishDietaryTagsPicker({
  allergens = [],
  onToggleAllergen,
  weatherTags = [],
  onToggleWeatherTag,
}) {
  return (
    <div className="space-y-3">
      {/* Cảnh báo Dị ứng (Checkboxes) */}
      <div className="space-y-2 p-3 rounded-xl bg-surface-bg border border-border-subtle">
        <label className="block text-xs font-semibold text-text-muted">
          Chất gây dị ứng (nếu có)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALLERGEN_OPTIONS.map((alg) => {
            const isChecked = allergens.includes(alg.value)
            return (
              <button
                key={alg.value}
                type="button"
                onClick={() => onToggleAllergen(alg.value)}
                className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-brand-primary/15 border-brand-primary/40 text-brand-hover font-semibold'
                    : 'bg-surface-card border-border-subtle text-text-muted hover:border-border-strong'
                }`}
              >
                {alg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Gợi ý Thời tiết (Checkboxes) */}
      <div className="space-y-2 p-3 rounded-xl bg-surface-bg border border-border-subtle">
        <label className="block text-xs font-semibold text-text-muted">
          Thích hợp với thời tiết
        </label>
        <div className="grid grid-cols-3 gap-2">
          {WEATHER_TAG_OPTIONS.map((tag) => {
            const isChecked = weatherTags.includes(tag.value)
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => onToggleWeatherTag(tag.value)}
                className={`p-2 rounded-lg border text-center text-xs transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-brand-primary/15 border-brand-primary/40 text-brand-hover font-semibold'
                    : 'bg-surface-card border-border-subtle text-text-muted hover:border-border-strong'
                }`}
              >
                {tag.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

