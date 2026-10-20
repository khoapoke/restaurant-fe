import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { getDishDetailApi } from '../services/menuService'
import { FALLBACK_DISH_IMAGE } from '../constants'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import { AlertTriangle, CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react'

export const DishDetailModal = ({ dishId, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [addedNotice, setAddedNotice] = useState(false)
  const [addError, setAddError] = useState(null)

  /* eslint-disable react-hooks/set-state-in-effect -- Modal state must reset and load when its selected dish changes. */
  useEffect(() => {
    if (!dishId || !isOpen) {
      setDish(null)
      setError(null)
      setQuantity(1)
      setAddedNotice(false)
      setAddError(null)
      return
    }

    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getDishDetailApi(dishId)
        setDish(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết món ăn.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [dishId, isOpen])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAddError('Vui lòng đăng nhập tài khoản để thêm món vào giỏ hàng.')
      return
    }

    setIsAdding(true)
    setAddError(null)
    try {
      await addToCart({
        dishId: dish.dishId,
        quantity,
      })
      setAddedNotice(true)
      setTimeout(() => setAddedNotice(false), 3000)
    } catch (err) {
      setAddError(
        err.response?.data?.message || 'Không thể thêm món vào giỏ hàng. Vui lòng thử lại.'
      )
    } finally {
      setIsAdding(false)
    }
  }

  const priceNumber = Number(dish?.price || 0)
  const isAvailable = dish?.isAvailable !== false

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dish?.dishName || 'Chi tiết món ăn'}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-gray-400">Đang nạp thực đơn từ bếp trưởng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      ) : dish ? (
        <div className="space-y-5">
          {/* Ảnh lớn */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-950">
            <img
              src={dish.imageUrl || FALLBACK_DISH_IMAGE}
              alt={dish.dishName}
              onError={(e) => {
                e.target.src = FALLBACK_DISH_IMAGE
              }}
              className="w-full h-full object-cover"
            />
            {dish.category?.categoryName && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-950/80 text-amber-400 backdrop-blur-md border border-gray-800">
                {dish.category.categoryName}
              </span>
            )}
          </div>

          {/* Tiêu đề & Giá */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{dish.dishName}</h2>
              <span
                className={`inline-block mt-1 text-xs font-medium ${
                  isAvailable ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isAvailable ? '● Sẵn sàng phục vụ' : '● Tạm ngưng phục vụ'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-400 block">Đơn giá</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {priceNumber.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Giới thiệu món
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {dish.description || 'Món ăn đặc sắc mang phong vị ẩm thực thượng hạng.'}
            </p>
          </div>

          {/* Nguyên liệu chính */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Nguyên liệu tuyển chọn
              </h4>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs bg-gray-800/80 text-gray-300 border border-gray-700/60"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cảnh báo dị ứng */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Cảnh báo chất gây dị ứng</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Món ăn này có chứa các thành phần sau:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dish.allergens.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thông báo thêm giỏ hàng thành công */}
          {addedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Đã thêm {quantity} phần &ldquo;{dish.dishName}&rdquo; vào giỏ hàng!</span>
            </div>
          )}

          {/* Thông báo lỗi khi thêm giỏ hàng */}
          {addError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
            {/* Bộ chọn số lượng */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Số lượng:</span>
              <div className="flex items-center border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!isAvailable || quantity <= 1 || isAdding}
                  className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-gray-100 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!isAvailable || isAdding}
                  className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button variant="ghost" size="md" onClick={onClose} disabled={isAdding}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={ShoppingBag}
                isLoading={isAdding}
                disabled={!isAvailable || isAdding}
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng • {(priceNumber * quantity).toLocaleString('vi-VN')} đ
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default DishDetailModal
