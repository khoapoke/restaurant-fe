import { ShieldAlert, Heart, Check } from 'lucide-react'
import { ALLERGENS, DIETARY_PREFERENCES } from '../constants'

/**
 * Tab 2: Quản lý Dị ứng & Sở thích dinh dưỡng
 */
export const AllergiesPreferencesTab = ({
  allergies = [],
  dietaryPreferences = [],
  onToggleAllergy,
  onTogglePreference,
  disabled = false,
}) => {
  return (
    <div className="space-y-8">
      {/* Phần 1: Cảnh báo Dị ứng thực phẩm */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-amber-300 text-sm">Cảnh báo an toàn thực phẩm</h4>
            <p className="text-gray-300 leading-relaxed">
              Hãy chọn các thành phần bạn bị dị ứng. Hệ thống sẽ hiển thị cảnh báo đỏ khi bạn xem món ăn trong thực đơn và bếp trưởng sẽ chủ động kiểm tra kỹ trước khi chế biến.
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
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none relative
                  ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-100">{item.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0
                      ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-gray-950 font-bold'
                          : 'border-gray-700 bg-gray-800/80'
                      }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Phần 2: Sở thích dinh dưỡng */}
      <div className="space-y-4 pt-4 border-t border-gray-800/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400" />
            Sở thích ăn uống & Dinh dưỡng
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Nhà hàng sẽ ưu tiên gắn nhãn và gợi ý các món ăn phù hợp với chế độ ăn kiêng của bạn.
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
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none
                  ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-100">{item.label}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0
                      ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-gray-950 font-bold'
                          : 'border-gray-700 bg-gray-800/80'
                      }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AllergiesPreferencesTab
