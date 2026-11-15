import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import CartItemRow from '../components/CartItemRow'
import CartSummaryCard from '../components/CartSummaryCard'
import CartEmptyState from '../components/CartEmptyState'
import CartOrderFlow from '../components/CartOrderFlow'
import DeleteCartItemModal from '../components/DeleteCartItemModal'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'

/**
 * Trang Giỏ Hàng Khách Hàng (CustomerCartPage)
 * - Đồng bộ Navbar HomeHeader (Badge giỏ hàng, Avatar Hover Logout) & HomeFooter
 * - Bố cục Fine-Dining 2 cột bất đối xứng (8/12 - 4/12)
 * - Thanh chỉ báo tiến trình đặt hàng CartOrderFlow
 * - Quản lý an toàn trạng thái xóa bằng DeleteCartItemModal
 * - Độ dài < 150 dòng
 */
export default function CustomerCartPage() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const {
    cart,
    loading,
    totalQuantity,
    estimatedTotalAmount,
    updateQuantity,
    removeFromCart,
    isDishUpdating,
  } = useCart()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [deleteModalItem, setDeleteModalItem] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const items = cart?.items || []
  const hasUnavailableItems = items.some((i) => i.isAvailable === false)

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return
    try {
      setIsDeleting(true)
      await removeFromCart(deleteModalItem.dishId)
      setDeleteModalItem(null)
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Không thể xóa món ăn khỏi giỏ hàng. Vui lòng thử lại.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCheckoutClick = () => {
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner tiêu đề trang & Chỉ báo quy trình */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-brand-primary" />
              <span>Giỏ hàng của bạn</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              {items.length > 0 ? `${totalQuantity} món đang được chuẩn bị đặt` : 'Khám phá và đặt ngay món ăn bạn yêu thích'}
            </p>
          </div>

          <CartOrderFlow currentStep={1} />
        </div>

        {/* Thông báo Alert */}
        {toastMessage && (
          <Alert
            type={toastMessage.type || 'info'}
            message={toastMessage.text}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Trạng thái 1: Loading */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Trạng thái 2: Giỏ hàng trống */
          <CartEmptyState />
        ) : (
          /* Trạng thái 3: Danh sách món ăn & Thẻ thanh toán */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            {/* Cột trái (8/12) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold text-text-main">
                  Món ăn đã chọn ({items.length})
                </h3>
                <span className="text-xs text-text-muted">
                  Bấm + / - để điều chỉnh số lượng
                </span>
              </div>

              {items.map((item) => (
                <CartItemRow
                  key={item.dishId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRequestDelete={(it) => setDeleteModalItem(it)}
                  isUpdating={isDishUpdating(item.dishId)}
                />
              ))}
            </div>

            {/* Cột phải (4/12) */}
            <div className="lg:col-span-4">
              <CartSummaryCard
                totalQuantity={totalQuantity}
                estimatedTotalAmount={estimatedTotalAmount}
                hasUnavailableItems={hasUnavailableItems}
                onCheckout={handleCheckoutClick}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal xác nhận xóa món */}
      <DeleteCartItemModal
        isOpen={Boolean(deleteModalItem)}
        item={deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

  
    </div>
  )
}
