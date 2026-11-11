import { useState, useEffect } from 'react'
import { Sparkles, Plus, Check, Loader2, Heart, ChevronRight, RefreshCw } from 'lucide-react'
import { getPersonalizedRecommendationsApi } from '../services/recommendationService'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { useCart } from '../../../../contexts/CartContext'

/**
 * Component hiển thị danh sách món gợi ý cá nhân hóa dựa trên Collaborative Filtering (Neo4j)
 * Dành cho khách hàng đã đăng nhập trên CustomerMenuPage. Quy chuẩn: < 200 dòng, 4 trạng thái UI.
 */
export const PersonalizedRecommendationSection = ({ onSelectDish }) => {
  const { addToCart } = useCart()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [addedIds, setAddedIds] = useState([])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPersonalizedRecommendationsApi(5)
      const data = res?.data?.data || res?.data || []
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Lỗi tải gợi ý cá nhân hóa từ Neo4j:', err)
      setError('Không thể tải gợi ý cá nhân hóa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const handleQuickAdd = async (e, item) => {
    e.stopPropagation()
    const id = item.dishId || item.id || item.ma_mon_an
    setAddingId(id)
    try {
      await addToCart({ dishId: id, quantity: 1 })
      setAddedIds((prev) => [...prev, id])
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((i) => i !== id))
      }, 2500)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm món vào giỏ.')
    } finally {
      setAddingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 via-amber-600/5 to-transparent border border-amber-500/20">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-amber-400">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Hệ thống AI đang phân tích khẩu vị của bạn...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-900 animate-pulse border border-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span>{error}</span>
        <button
          type="button"
          onClick={fetchRecommendations}
          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Thử lại
        </button>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/20 via-gray-950 to-gray-950 border border-amber-500/25 shadow-xl shadow-amber-500/5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Heart className="w-4 h-4 fill-amber-400/30" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              Gợi ý dành riêng cho bạn
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Neo4j AI
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Được tính toán dựa trên lịch sử đặt món và sở thích của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const id = item.dishId || item.id || item.ma_mon_an
          const isAdded = addedIds.includes(id)
          const isAddingThis = addingId === id
          const affinity = item.affinityScore || 0

          return (
            <div
              key={id}
              onClick={() => onSelectDish && onSelectDish(id)}
              className="group relative flex flex-col justify-between p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 duration-200"
            >
              <div className="space-y-2">
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-950">
                  <img
                    src={resolveDishImage(item.imageUrl, item)}
                    alt={item.dishName}
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {affinity > 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500 text-gray-950 shadow-md">
                      Khớp {affinity * 10 > 98 ? 98 : affinity * 10 + 60}%
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-amber-400/80 font-medium line-clamp-1">
                    {item.categoryName || 'Món đặc sắc'}
                  </div>
                  <h4 className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.dishName}
                  </h4>
                  <p className="text-xs font-bold text-amber-400">
                    {Number(item.price || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              <div className="pt-2.5 mt-auto">
                <button
                  type="button"
                  disabled={isAddingThis}
                  onClick={(e) => handleQuickAdd(e, item)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-gray-950 font-medium shadow'
                  }`}
                >
                  {isAddingThis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Đã thêm
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Thêm vào giỏ
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PersonalizedRecommendationSection

