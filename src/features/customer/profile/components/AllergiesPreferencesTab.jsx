import { ShieldAlert, Heart, Check, AlertCircle } from 'lucide-react'
import { ALLERGENS, DIETARY_PREFERENCES } from '../constants'

/**
 * Tab 2: Quản lý Dị ứng & Sở thích dinh dưỡng (AllergiesPreferencesTab)
 * - Tinh tế Fine-Dining & Đồng bộ Centralized Design Tokens
 * - 0 icon Sparkles
 * - Độ dài < 120 dòng
 */
export default function AllergiesPreferencesTab({
  allergies = [],
  dietaryPreferences = [],
  onToggleAllergy,
  onTogglePreference,
  disabled = false,
}) {
  return (
    <div className="space-y-8">
      {/* Cảnh báo Dị ứng thực phẩm */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20 text-brand-primary">
          <AlertCircle className="w-5 h-5 shrink-0 text-brand-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-text-main text-sm">Cảnh báo an toàn ẩm thực</h4>
            <p className="text-text-muted leading-relaxed">
              Hãy đánh dấu các nguyên liệu bạn bị dị ứng. Khi duyệt thực đơn, các món chứa nguyên liệu này sẽ tự động gắn nhãn cảnh báo đỏ và bếp trưởng sẽ kiểm tra nghiêm ngặt khi chế biến.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALLERGENS.map((item) => {
            const isSelected = allergies.includes(item.value)
            return (
              <button
                key={item.value}
                type="button"
                disabled={disabled}
                onClick={() => onToggleAllergy(item.value)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none relative ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary text-text-main shadow-sm ring-1 ring-brand-primary/30'
                    : 'bg-surface-bg border-border-subtle text-text-muted hover:border-border-strong hover:text-text-main'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-text-main">{item.label}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-brand-primary border-brand-primary text-surface-bg font-bold'
                        : 'border-border-strong bg-surface-card'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[10px] text-text-muted leading-normal">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sở thích dinh dưỡng & Chế độ ăn */}
      <div className="space-y-4 pt-4 border-t border-border-subtle">
        <div>
          <h3 className="text-base font-serif font-bold text-text-main flex items-center gap-2">
            <Heart className="w-4 h-4 text-status-success" />
            <span>Sở thích ăn uống & Dinh dưỡng</span>
          </h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Nhà hàng sẽ ưu tiên gắn nhãn và AI đề xuất các món ăn phù hợp với chế độ ăn uống của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DIETARY_PREFERENCES.map((item) => {
            const isSelected = dietaryPreferences.includes(item.value)
            return (
              <button
                key={item.value}
                type="button"
                disabled={disabled}
                onClick={() => onTogglePreference(item.value)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-status-success/10 border-status-success text-text-main shadow-sm ring-1 ring-status-success/30'
                    : 'bg-surface-bg border-border-subtle text-text-muted hover:border-border-strong hover:text-text-main'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-text-main">{item.label}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-status-success border-status-success text-surface-bg font-bold'
                        : 'border-border-strong bg-surface-card'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[10px] text-text-muted leading-normal">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
