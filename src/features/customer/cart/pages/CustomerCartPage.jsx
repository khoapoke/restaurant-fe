import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import CartItemRow from '../components/CartItemRow'
import CartSummaryCard from '../components/CartSummaryCard'
import CartEmptyState from '../components/CartEmptyState'
import CartOrderSuccessState from '../components/CartOrderSuccessState'
import CartOrderFlow from '../components/CartOrderFlow'
import DeleteCartItemModal from '../components/DeleteCartItemModal'
import QrPaymentModal from '../../order/components/QrPaymentModal'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'

/**
 * Trang Giỏ Hàng Khách Hàng (CustomerCartPage)
 * - Tích hợp Chặng 3 Đặt món thành công (CartOrderSuccessState)
 * - Đồng bộ Navbar HomeHeader & HomeFooter
 * - Quản lý an toàn 4 trạng thái UI (Loading, Empty, Data, Success)
 * - Độ dài < 170 dòng
 */
export default function CustomerCartPage() {
  const navigate = useNavigate()
  const location = useLocation()
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

  const successOrder = location.state?.orderSuccess ? location.state : null

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [deleteModalItem, setDeleteModalItem] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

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

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner tiêu đề trang & Chỉ báo quy trình */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-brand-primary" />
              <span>{successOrder ? 'Đặt món hoàn tất' : 'Giỏ hàng của bạn'}</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              {successOrder
                ? `Đơn hàng #${successOrder.orderId} đã được ghi nhận vào hệ thống`
                : items.length > 0
                ? `${totalQuantity} món đang được chuẩn bị đặt`
                : 'Khám phá và đặt ngay món ăn bạn yêu thích'}
            </p>
          </div>

          <CartOrderFlow currentStep={successOrder ? 3 : 1} />
        </div>

        {/* Thông báo Alert nếu có */}
        {toastMessage && (
          <Alert
            type={toastMessage.type || 'info'}
            message={toastMessage.text}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Trạng thái 1: Đặt hàng thành công (Chặng 3) */}
        {successOrder ? (
          <CartOrderSuccessState
            orderData={successOrder}
            onOpenQrModal={() => setShowQrModal(true)}
            onNavigateOrders={() => navigate('/orders')}
          />
        ) : loading && items.length === 0 ? (
          /* Trạng thái 2: Đang tải giỏ hàng */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Trạng thái 3: Giỏ hàng trống */
          <CartEmptyState />
        ) : (
          /* Trạng thái 4: Danh sách món ăn & Thẻ thanh toán */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
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

            <div className="lg:col-span-4">
              <CartSummaryCard
                totalQuantity={totalQuantity}
                estimatedTotalAmount={estimatedTotalAmount}
                hasUnavailableItems={hasUnavailableItems}
                onCheckout={() => navigate('/checkout')}
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

      {/* Modal thanh toán QR khi bấm nút từ màn hình thành công */}
      {successOrder && (
        <QrPaymentModal
          orderId={successOrder.orderId}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          onPaymentSuccess={() => {
            setShowQrModal(false)
            navigate('/orders', {
              state: { successMessage: `Thanh toán thành công đơn #${successOrder.orderId}!` },
            })
          }}
        />
      )}

      <HomeFooter />
    </div>
  )
}
