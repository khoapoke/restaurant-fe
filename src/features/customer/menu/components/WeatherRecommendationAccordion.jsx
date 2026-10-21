import { useState } from 'react'
import {
  Sun,
  CloudRain,
  CloudSun,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { WEATHER_CONDITIONS, FALLBACK_DISH_IMAGE } from '../constants'

export const WeatherRecommendationAccordion = ({
  weatherData,
  loading = false,
  onSelectDish,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800" />
          <div className="space-y-1.5">
            <div className="w-32 h-3.5 bg-gray-800 rounded" />
            <div className="w-48 h-3 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="w-24 h-8 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  if (!weatherData?.weather) return null

  const { city, temperatureCelsius, condition, advice } = weatherData.weather
  const { recommendedDishes = [], excludedAllergens = [] } = weatherData

  const conditionConfig = WEATHER_CONDITIONS[condition] || {
    label: condition || 'Bình thường',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  }

  const renderWeatherIcon = () => {
    switch (condition) {
      case 'HOT_SUNNY':
        return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
      case 'RAINY_OR_COLD':
        return <CloudRain className="w-5 h-5 text-blue-400" />
      default:
        return <CloudSun className="w-5 h-5 text-emerald-400" />
    }
  }

  return (
    <div className="rounded-2xl border border-[#6f1d32] bg-[#6f1d32] transition-all duration-200 overflow-hidden shadow-[0_16px_45px_rgba(65,29,23,0.16)]">
      {/* Header bar / Toggle Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
            {renderWeatherIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#ead9ca] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#f2d09a]" />
                {city || 'TP. Hồ Chí Minh'}
              </span>
              <span className="text-sm px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#fff8ed] font-mono font-bold">
                {temperatureCelsius ? `${temperatureCelsius}°C` : '32°C'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#fff8ed] flex items-center gap-1.5 mt-1">
              <span>Gợi ý theo thời tiết:</span>
              <span className="text-[#f2d09a]">{conditionConfig.label}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-[#fff8ed] border border-white/15">
            <Sparkles className="w-3 h-3" />
            <span>{recommendedDishes.length} món phù hợp</span>
          </span>
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#ead9ca] hover:text-white transition-colors"
            aria-label="Thu gọn / Mở rộng"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-4 border-t border-white/15 space-y-4">
          {/* Lời khuyên & cảnh báo dị ứng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#ead9ca]">
            <p className="italic text-[#ead9ca] leading-relaxed max-w-2xl">
              &ldquo;{advice}&rdquo;
            </p>
            {excludedAllergens.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-emerald-100 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-200/25 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã loại trừ: {excludedAllergens.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Danh sách món ăn gợi ý */}
          {recommendedDishes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {recommendedDishes.map((dish) => (
                <div
                  key={dish.dishId}
                  onClick={() => onSelectDish?.(dish.dishId)}
                  className="group bg-[#fffdf8] border border-white/20 hover:border-[#f2d09a] rounded-xl p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-800 relative mb-2">
                    <img
                      src={dish.imageUrl || FALLBACK_DISH_IMAGE}
                      alt={dish.dishName}
                      onError={(e) => {
                        e.target.src = FALLBACK_DISH_IMAGE
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {dish.categoryName && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-xs font-semibold bg-[#251b19] text-[#fff8ed] moc-inverse">
                        {dish.categoryName}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#211b18] group-hover:text-[#6f1d32] transition-colors line-clamp-1">
                      {dish.dishName}
                    </h4>
                    <p className="text-sm font-semibold text-[#6f1d32] font-mono mt-1">
                      {Number(dish.price || 0).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#ead9ca] text-center py-2">
              Không có món ăn gợi ý đặc biệt cho thời điểm này.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default WeatherRecommendationAccordion
