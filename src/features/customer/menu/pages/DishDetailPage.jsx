import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getDishDetailApi } from '../services/menuService'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import PairedDishesSection from '../components/PairedDishesSection'
import DishActionSection from '../components/DishActionSection'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'
import Button from '../../../../components/ui/Button'
import { BRAND_NAME } from '@/constants/brand'
import { ArrowLeft, ShoppingBag, ChefHat, RefreshCw } from 'lucide-react'

/**
 * Trang Chi tiết Món ăn Độc Lập (DishDetailPage)
 * Chuẩn mực Design System:
 * - Standalone: Thanh điều hướng tinh gọn ở đầu trang, không Footer
 * - Đầy đủ 4 trạng thái UI: Loading, Error, Empty, Data
 * - Kết nối PairedDishesSection (Neo4j Graph) & DishActionSection
 * - Độ dài < 170 dòng
 */
export default function DishDetailPage() {
  const { dishId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, totalQuantity } = useCart()

  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [addedNotice, setAddedNotice] = useState(false)
  const [addError, setAddError] = useState(null)

  const fetchDetail = useCallback(async () => {
    if (!dishId) return
    setLoading(true)
    setError(null)
    setAddError(null)
    try {
      const response = await getDishDetailApi(dishId)
      const data = response?.data?.data || response?.data
      if (!data) throw new Error('Không tìm thấy thông tin món ăn')
      setDish(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết món ăn.')
    } finally {
      setLoading(false)
    }
  }, [dishId])

  useEffect(() => {
    fetchDetail()
    setQuantity(1)
    setAddedNotice(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchDetail])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAddError('Vui lòng đăng nhập để thêm món vào giỏ hàng.')
      return
    }
    setIsAdding(true)
    setAddError(null)
    try {
      await addToCart({ dishId: dish.dishId || dish.id, quantity })
      setAddedNotice(true)
      setTimeout(() => setAddedNotice(false), 3000)
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Không thể thêm món vào giỏ. Vui lòng thử lại.')
    } finally {
      setIsAdding(false)
    }
  }

  const priceNumber = Number(dish?.price || 0)
  const isAvailable = dish?.isAvailable !== false
  const resolvedImg = resolveDishImage(dish?.imageUrl, dish)

  return (
    <div className="min-h-screen bg-surface-bg text-text-body flex flex-col selection:bg-brand-primary selection:text-surface-bg">
      {/* Top Bar Tối Giản */}
      <nav className="sticky top-0 z-30 w-full bg-surface-bg/95 backdrop-blur-md border-b border-border-subtle py-3 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-card border border-border-subtle transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thực đơn</span>
          </Link>

      

          <Link
            to="/cart"
            className="relative p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
            title="Xem giỏ hàng"
          >
            <ShoppingBag className="w-4 h-4 text-brand-primary" />
            {totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-primary text-surface-bg font-bold text-[10px] flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Nội dung chính */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3 rounded" />
              <Skeleton className="h-10 w-3/4 rounded" />
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-12 w-1/2 rounded-xl" />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <Alert variant="error" title="Không thể tải món ăn" message={error} />
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchDetail}>
              Thử lại
            </Button>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && dish && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Cột trái: Ảnh món ăn */}
              <div className="relative rounded-2xl overflow-hidden border border-border-subtle bg-surface-card shadow-lg">
                <div className="aspect-[4/3] w-full overflow-hidden bg-surface-bg">
                  <img
                    src={resolvedImg}
                    alt={dish.dishName}
                    onError={(e) => handleImageError(e, resolveDishImage(null, dish))}
                    className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                      !isAvailable ? 'grayscale opacity-60' : ''
                    }`}
                  />
                </div>
                {dish.categoryName && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-surface-bg/90 backdrop-blur-md border border-border-subtle text-brand-primary">
                    {dish.categoryName}
                  </span>
                )}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-status-error/20 text-status-error border border-status-error/30">
                      Tạm hết món
                    </span>
                  </div>
                )}
              </div>

              {/* Cột phải: Thông tin & Thao tác */}
              <DishActionSection
                dish={dish}
                priceNumber={priceNumber}
                isAvailable={isAvailable}
                quantity={quantity}
                setQuantity={setQuantity}
                handleAddToCart={handleAddToCart}
                isAdding={isAdding}
                addedNotice={addedNotice}
                addError={addError}
              />
            </div>

            {/* Món ăn kèm hoàn hảo */}
            <div className="pt-10 border-t border-border-subtle">
              <PairedDishesSection
                dishId={dish.dishId || dish.id}
                onSelectDish={(id) => navigate(`/menu/${id}`)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
