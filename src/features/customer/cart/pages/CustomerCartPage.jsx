import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import CartItemRow from '../components/CartItemRow'
import CartSummaryCard from '../components/CartSummaryCard'
import CartEmptyState from '../components/CartEmptyState'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import Alert from '../../../../components/ui/Alert'

export const CustomerCartPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const {
    cart,
    loading,
    totalQuantity,
    estimatedTotalAmount,
    fetchCart,
    updateQuantity,
    removeFromCart,
    isDishUpdating,
  } = useCart()

  // Điều hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [deleteModalItem, setDeleteModalItem] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  const items = cart.items || []
  const hasUnavailableItems = items.some((i) => i.isAvailable === false)

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return
    try {
      await removeFromCart(deleteModalItem.dishId)
      setDeleteModalItem(null)
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Không thể xóa món ăn khỏi giỏ hàng. Vui lòng thử lại.',
      })
    }
  }

  const handleCheckoutClick = () => {
    // Thông báo tạm thời theo yêu cầu người dùng
    setToastMessage({
      type: 'info',
      text: 'Tính năng Đặt hàng & Thanh toán QR sẽ được hoàn thiện ở module tiếp theo.',
    })
  }

  // UI STATE 1: LOADING
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-gray-100 p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Quay lại Thực đơn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Giỏ hàng của bạn
              </h1>
              <p className="text-[11px] text-gray-400">
                {items.length > 0 ? `${totalQuantity} món đang chọn` : 'Chưa có món'}
              </p>
            </div>
          </div>

          <Link to="/menu">
            <Button variant="ghost" size="sm">
              Xem thực đơn
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <Alert
            type={toastMessage.type || 'info'}
            message={toastMessage.text}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* UI STATE 2: ERROR */}
        {fetchError && (
          <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-xs text-red-400">{fetchError}</p>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchCart}>
              Tải lại giỏ hàng
            </Button>
          </div>
        )}

        {/* UI STATE 3: EMPTY */}
        {!loading && items.length === 0 ? (
          <CartEmptyState />
        ) : (
          /* UI STATE 4: DATA LIST (Layout 2 cột) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái (8/12): Danh sách món ăn */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-bold text-gray-300">
                  Món ăn đã chọn ({items.length})
                </h3>
                <span className="text-xs text-gray-500">
                  Nhấn + / - để điều chỉnh số lượng
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

            {/* Cột phải (4/12): Thẻ tóm tắt đơn hàng & Checkout */}
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

      {/* Modal Xác nhận Xóa món */}
      <Modal
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        title="Xác nhận xóa món"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            Bạn có chắc chắn muốn bỏ món{' '}
            <strong className="text-amber-400">
              &ldquo;{deleteModalItem?.dishName}&rdquo;
            </strong>{' '}
            khỏi giỏ hàng không?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalItem(null)}
            >
              Giữ lại
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleConfirmDelete}
            >
              Xóa món
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerCartPage
