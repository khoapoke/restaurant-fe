import { useState, useEffect } from 'react'
import { Plus, Check, Loader2, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { getPairedDishesApi } from '../services/recommendationService'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { useCart } from '../../../../contexts/CartContext'
import { useAuth } from '../../../../contexts/AuthContext'

/**
 * Component hiển thị các món ăn thường được gọi cùng với món hiện tại (Neo4j Market Basket Graph)
 * Tích hợp trong DishDetailPage. Quy chuẩn: < 200 dòng, 4 trạng thái UI.
 */
export default function PairedDishesSection({ dishId, onSelectDish }) {
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
      <div className="pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-brand-primary">
          <UtensilsCrossed className="w-4 h-4 animate-pulse" />
          <span>Đang tìm món kết hợp hoàn hảo từ Neo4j Graph...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-surface-card animate-pulse border border-border-subtle" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
        <span>{error}</span>
        <button
          type="button"
          onClick={fetchPairedDishes}
          className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-hover"
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
    <div className="pt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-surface-card border border-border-subtle flex items-center justify-center text-brand-primary">
          <UtensilsCrossed className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-main">
            Thường được kết hợp cùng
          </h3>
          <p className="text-[11px] text-text-muted">
            Dựa trên phân tích khẩu vị và trải nghiệm thực khách tại nhà hàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {items.map((item) => {
          const id = item.dishId || item.id || item.ma_mon_an
          const name = item.dishName || item.ten_mon_an || item.name
          const price = Number(item.price || item.gia || 0)
          const img = resolveDishImage(item.imageUrl || item.hinh_anh, item)
          const isAdded = addedIds.includes(id)
          const isAddingThis = addingId === id

          return (
            <div
              key={id}
              onClick={() => onSelectDish && onSelectDish(id)}
              className="group p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-surface-bg mb-2">
                  <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => handleImageError(e, resolveDishImage(null, item))}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1 mb-1">
                  {name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-1 mt-1 border-t border-border-subtle">
                <span className="text-xs font-bold text-brand-primary font-mono">
                  {price.toLocaleString('vi-VN')} đ
                </span>
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, item)}
                  disabled={isAddingThis}
                  title="Thêm nhanh vào giỏ"
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-status-success text-surface-bg'
                      : 'bg-surface-bg border border-border-subtle text-text-main hover:text-brand-primary hover:border-border-strong'
                  }`}
                >
                  {isAddingThis ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isAdded ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
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
