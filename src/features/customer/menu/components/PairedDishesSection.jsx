import { useState, useEffect } from 'react'
import { Sparkles, Plus, Check, Loader2, RefreshCw } from 'lucide-react'
import { getPairedDishesApi } from '../services/recommendationService'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { useCart } from '../../../../contexts/CartContext'
import { useAuth } from '../../../../contexts/AuthContext'

/**
 * Component hiển thị các món ăn thường được gọi cùng với món hiện tại (Neo4j Market Basket Graph)
 * Tích hợp trong DishDetailModal. Quy chuẩn: < 200 dòng, 4 trạng thái UI.
 */
export const PairedDishesSection = ({ dishId, onSelectDish }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [addedIds, setAddedIds] = useState([])

  const fetchPairedDishes = async () => {
    if (!dishId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getPairedDishesApi(dishId, 4)
      const data = res?.data?.data || res?.data || []
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Không thể tải món gọi cùng từ Neo4j:', err)
      setError('Không thể tải gợi ý món đi kèm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPairedDishes()
    setAddedIds([])
  }, [dishId])

  const handleQuickAdd = async (e, item) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm món vào giỏ hàng!')
      return
    }

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
      <div className="pt-3 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Đang tìm món kết hợp hoàn hảo từ AI...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-900 animate-pulse border border-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>{error}</span>
        <button
          type="button"
          onClick={fetchPairedDishes}
          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
        >
          <RefreshCw className="w-3 h-3" /> Thử lại
        </button>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="pt-4 border-t border-gray-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Thường được gọi cùng món này</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-normal">
            Neo4j AI
          </span>
        </h4>
        <span className="text-[11px] text-gray-500">Bấm để thêm nhanh</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {items.map((item) => {
          const id = item.dishId || item.id || item.ma_mon_an
          const isAdded = addedIds.includes(id)
          const isAddingThis = addingId === id
          const pairedCount = item.pairedCount || 0

          return (
            <div
              key={id}
              onClick={() => onSelectDish && onSelectDish(id)}
              className="group relative flex flex-col justify-between p-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-amber-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className="space-y-1.5">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-900">
                  <img
                    src={resolveDishImage(item.imageUrl, item)}
                    alt={item.dishName}
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {pairedCount > 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-950/80 text-amber-300 backdrop-blur-xs border border-amber-500/30">
                      🔥 {pairedCount} lượt
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-medium text-gray-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.dishName}
                  </h5>
                  <p className="text-[11px] font-bold text-amber-400">
                    {Number(item.price || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isAddingThis}
                  onClick={(e) => handleQuickAdd(e, item)}
                  className={`w-full py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-gray-950 border border-amber-500/30'
                  }`}
                >
                  {isAddingThis ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check className="w-3 h-3" /> Đã thêm
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" /> Thêm vào giỏ
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

export default PairedDishesSection

