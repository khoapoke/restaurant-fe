import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  CloudRain,
  CloudSun,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { getPersonalizedRecommendationsApi } from '../services/recommendationService'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { WEATHER_CONDITIONS } from '../constants'

/**
 * Component Trung Tâm Gợi Ý Thông Minh 2-trong-1 (MenuSmartHub)
 * - Gộp gợi ý Thời tiết & Cá nhân hóa Neo4j thành dạng Tab chuyển đổi
 * - Thu gọn/mở rộng linh hoạt, độ dài < 180 dòng
 */
export default function MenuSmartHub({
  weatherData,
  weatherLoading,
  fallbackDishes = [],
  isAuthenticated,
  onSelectDish,
}) {
  const [activeTab, setActiveTab] = useState('weather')
  const [isExpanded, setIsExpanded] = useState(false)
  const [personalizedDishes, setPersonalizedDishes] = useState([])
  const [personalizedLoading, setPersonalizedLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'personalized' || personalizedDishes.length > 0) return
    const loadPersonalized = async () => {
      setPersonalizedLoading(true)
      try {
        const res = await getPersonalizedRecommendationsApi(4)
        const data = res?.data?.data || res?.data || []
        setPersonalizedDishes(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('Lỗi tải gợi ý Neo4j:', err)
      } finally {
        setPersonalizedLoading(false)
      }
    }
    loadPersonalized()
  }, [isAuthenticated, activeTab, personalizedDishes.length])

  const actualData = weatherData?.data || weatherData
  const weatherObj = actualData?.weather || actualData
  const city = weatherObj?.city || 'TP. Hồ Chí Minh'
  const temperature = weatherObj?.temperatureCelsius ?? 32
  const condition = weatherObj?.condition || 'HOT_SUNNY'
  const advice = weatherObj?.advice || 'Thời tiết lý tưởng để thưởng thức các tuyệt tác ẩm thực.'
  
  const rawWeatherDishes = actualData?.recommendedDishes || []
  const weatherDishes = rawWeatherDishes.length > 0
    ? rawWeatherDishes.slice(0, 4)
    : fallbackDishes.slice(0, 4).map((d) => ({
        dishId: d.dishId || d.id,
        dishName: d.dishName || d.name,
        price: d.price,
        imageUrl: d.imageUrl,
        categoryName: d.categoryName || 'Món ngon gợi ý',
      }))

  const weatherConfig = WEATHER_CONDITIONS[condition] || { label: 'Nắng đẹp' }
  const renderWeatherIcon = () => {
    if (condition === 'RAINY_OR_COLD') return <CloudRain className="w-4 h-4 text-brand-primary" />
    if (condition === 'HOT_SUNNY') return <Sun className="w-4 h-4 text-brand-primary" />
    return <CloudSun className="w-4 h-4 text-brand-primary" />
  }

  const currentDishes = activeTab === 'weather' ? weatherDishes : personalizedDishes

  return (
    <div className="rounded-2xl bg-surface-card border border-border-subtle overflow-hidden shadow-sm transition-all mb-8">
      {/* Header Bar: Tabs chuyển đổi & Nút thu gọn */}
      <div className="px-4 sm:px-6 py-3 bg-surface-card/60 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-bg border border-border-subtle">
          <button
            type="button"
            onClick={() => { setActiveTab('weather'); setIsExpanded(true); }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'weather' ? 'bg-surface-card text-brand-primary shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {renderWeatherIcon()}
            <span>Hợp thời tiết hôm nay</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('personalized'); setIsExpanded(true); }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'personalized' ? 'bg-surface-card text-brand-primary shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Khẩu vị riêng</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Thu gọn' : 'Xem gợi ý'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Nội dung chi tiết */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-bg border border-border-subtle text-xs">
            {activeTab === 'weather' ? (
              <>
                <div className="flex items-center gap-2 font-medium text-text-main">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span>{city} • {temperature}°C ({weatherConfig.label})</span>
                </div>
                <p className="text-text-muted sm:text-right line-clamp-1 italic">&ldquo;{advice}&rdquo;</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-medium text-text-main">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                  <span>Phân tích đồ thị Neo4j tự động loại trừ các thành phần dị ứng đã lưu</span>
                </div>
                {!isAuthenticated && (
                  <Link to="/login" className="text-brand-primary font-semibold hover:underline">
                    Đăng nhập để xem gợi ý cá nhân &rarr;
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Lưới 4 món gợi ý */}
          {(weatherLoading || personalizedLoading) ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 rounded-xl bg-surface-bg animate-pulse border border-border-subtle" />
              ))}
            </div>
          ) : currentDishes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {currentDishes.map((item) => {
                const id = item.dishId || item.id
                const name = item.dishName || item.name
                const price = Number(item.price || 0)
                const img = resolveDishImage(item.imageUrl, item)
                return (
                  <div
                    key={id}
                    onClick={() => onSelectDish && onSelectDish(id)}
                    className="group p-2.5 rounded-xl bg-surface-bg border border-border-subtle hover:border-border-strong transition-all cursor-pointer flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-surface-card mb-2">
                        <img
                          src={img}
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => handleImageError(e, resolveDishImage(null, item))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1">
                        {name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border-subtle text-xs">
                      <span className="font-bold text-brand-primary font-mono">{price.toLocaleString('vi-VN')} đ</span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-4">Chưa có dữ liệu món gợi ý phù hợp.</p>
          )}
        </div>
      )}
    </div>
  )
}
