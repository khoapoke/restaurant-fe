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
import { WEATHER_CONDITIONS } from '../constants'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

export const WeatherRecommendationAccordion = ({
  weatherData,
  loading = false,
  onSelectDish,
  fallbackDishes = [],
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

  // Bóc tách an toàn đa cấu trúc: { data: { weather: ... } } hoặc { weather: ... }
  const actualData = weatherData?.data || weatherData
  const weatherObj = actualData?.weather || actualData

  if (!weatherObj || (!weatherObj.condition && !weatherObj.temperatureCelsius && !weatherObj.city)) {
    return null
  }

  const city = weatherObj.city || weatherObj.thanh_pho || 'TP. Hồ Chí Minh'
  const temperatureCelsius = weatherObj.temperatureCelsius ?? weatherObj.nhiet_do ?? 32
  const condition = weatherObj.condition || weatherObj.thoi_tiet || 'HOT_SUNNY'
  const advice =
    weatherObj.advice ||
    weatherObj.loi_khuyen ||
    'Thời tiết thích hợp để thưởng thức các món ăn đặc sắc tại Lumière.'

  const excludedAllergens = actualData?.excludedAllergens || actualData?.di_ung_loai_tru || []

  // Danh sách món gợi ý: nếu API thời tiết chưa trả món thì lấy top 4 món từ thực đơn hiện có
  const rawRecommended = actualData?.recommendedDishes || actualData?.mon_an_goi_y || []
  const recommendedDishes =
    rawRecommended.length > 0
      ? rawRecommended
      : fallbackDishes.slice(0, 4).map((d) => ({
          dishId: d.dishId || d.id,
          dishName: d.dishName || d.ten_mon_an || d.name,
          price: d.price || d.gia,
          imageUrl: d.imageUrl || d.hinh_anh,
          categoryName: d.categoryName || d.category?.categoryName || 'Món ngon gợi ý',
        }))

  const conditionConfig = WEATHER_CONDITIONS[condition] || {
    label: condition || 'Nắng đẹp',
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
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-md
        ${conditionConfig.bgColor} ${conditionConfig.borderColor} bg-gray-950/70`}
    >
      {/* Header bar / Toggle Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-center shrink-0 shadow-inner">
            {renderWeatherIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                {city || 'TP. Hồ Chí Minh'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-200 font-mono font-bold">
                {temperatureCelsius ? `${temperatureCelsius}°C` : '32°C'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>Gợi ý theo thời tiết:</span>
              <span className={conditionConfig.accentColor}>{conditionConfig.label}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            <span>{recommendedDishes.length} món phù hợp</span>
          </span>
          <button
            type="button"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Thu gọn / Mở rộng"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-800/40 space-y-4">
          {/* Lời khuyên & cảnh báo dị ứng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-300">
            <p className="italic text-gray-300 leading-relaxed max-w-2xl">
              &ldquo;{advice}&rdquo;
            </p>
            {excludedAllergens.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
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
                  className="group bg-gray-900/80 border border-gray-800 hover:border-amber-500/50 rounded-xl p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-amber-500/5"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-800 relative mb-2">
                    <img
                      src={resolveDishImage(dish.imageUrl, dish)}
                      alt={dish.dishName}
                      onError={(e) => handleImageError(e, resolveDishImage(null, dish))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {dish.categoryName && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-950/80 text-gray-200 backdrop-blur-sm">
                        {dish.categoryName}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {dish.dishName}
                    </h4>
                    <p className="text-xs font-semibold text-amber-400 font-mono mt-1">
                      {Number(dish.price || 0).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">
              Không có món ăn gợi ý đặc biệt cho thời điểm này.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default WeatherRecommendationAccordion
