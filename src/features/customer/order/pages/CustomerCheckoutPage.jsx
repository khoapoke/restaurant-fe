import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import { checkoutApi } from '../services/orderService'
import { FulfillmentType, PaymentMethod } from '../constants'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import CartOrderFlow from '../../cart/components/CartOrderFlow'
import CheckoutFulfillmentSelector from '../components/CheckoutFulfillmentSelector'
import CheckoutRecipientForm from '../components/CheckoutRecipientForm'
import CheckoutPaymentSelector from '../components/CheckoutPaymentSelector'
import CheckoutOrderSummary from '../components/CheckoutOrderSummary'
import QrPaymentModal from '../components/QrPaymentModal'
import Alert from '../../../../components/ui/Alert'

/**
 * Trang Thanh Toán & Đặt Món (CustomerCheckoutPage)
 * - Tinh tế Fine-Dining & Bố cục 2 cột (7/12 - 5/12)
 * - Đồng bộ Navbar HomeHeader, Footer, Stepper CartOrderFlow (Step 2)
 * - Tự động điền thông tin người dùng từ hồ sơ
 * - Độ dài < 160 dòng
 */
export default function CustomerCheckoutPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { cart, totalQuantity, estimatedTotalAmount, fetchCart } = useCart()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (!cart.items || cart.items.length === 0) navigate('/cart')
  }, [isAuthenticated, cart.items, navigate])

  const [formData, setFormData] = useState({
    recipientName: user?.userProfile?.fullName || user?.username || '',
    recipientPhone: user?.userProfile?.phoneNumber || '',
    shippingAddress: user?.userProfile?.address || '',
    fulfillmentType: FulfillmentType.DELIVERY,
    paymentMethod: PaymentMethod.BANK_TRANSFER_QR,
    orderNote: '',
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        recipientName: prev.recipientName || user?.userProfile?.fullName || user?.username || '',
        recipientPhone: prev.recipientPhone || user?.userProfile?.phoneNumber || '',
        shippingAddress: prev.shippingAddress || user?.userProfile?.address || '',
      }))
    }
  }, [user])

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [createdOrderId, setCreatedOrderId] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleValidate = () => {
    const errs = {}
    if (!formData.recipientName.trim()) errs.recipientName = 'Vui lòng nhập họ tên người nhận'
    if (!formData.recipientPhone.trim()) errs.recipientPhone = 'Vui lòng nhập số điện thoại'
    if (formData.fulfillmentType === FulfillmentType.DELIVERY && !formData.shippingAddress.trim()) {
      errs.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng chi tiết'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    const errs = handleValidate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setIsSubmitting(true)
    try {
      const response = await checkoutApi({
        fulfillmentType: formData.fulfillmentType,
        recipientName: formData.recipientName.trim(),
        recipientPhone: formData.recipientPhone.trim(),
        shippingAddress:
          formData.fulfillmentType === FulfillmentType.DELIVERY
            ? formData.shippingAddress.trim()
            : undefined,
        paymentMethod: formData.paymentMethod,
        orderNote: formData.orderNote.trim() || undefined,
      })

      const newOrder = response.data?.data || response.data
      const orderId = newOrder?.orderId || newOrder?.order_id || newOrder?.id
      await fetchCart()

      if (formData.paymentMethod === PaymentMethod.BANK_TRANSFER_QR) {
        setCreatedOrderId(orderId)
        setShowQrModal(true)
      } else {
        navigate('/orders', { state: { successMessage: `Đặt hàng thành công đơn #${orderId}!` } })
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-card border border-border-subtle transition-colors"
              title="Quay lại Giỏ hàng"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight">
                Thanh toán & Giao nhận
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Xác nhận thông tin nhận món và chọn phương thức thanh toán</p>
            </div>
          </div>
          <CartOrderFlow currentStep={2} />
        </div>

        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <CheckoutFulfillmentSelector
              selectedType={formData.fulfillmentType}
              onSelectType={(type) => setFormData((p) => ({ ...p, fulfillmentType: type }))}
            />
            <CheckoutRecipientForm
              formData={formData}
              onChange={handleChange}
              errors={errors}
              fulfillmentType={formData.fulfillmentType}
            />
            <CheckoutPaymentSelector
              selectedMethod={formData.paymentMethod}
              onSelectMethod={(method) => setFormData((p) => ({ ...p, paymentMethod: method }))}
            />
          </div>

          <div className="lg:col-span-5">
            <CheckoutOrderSummary
              items={cart.items || []}
              totalQuantity={totalQuantity}
              estimatedTotalAmount={estimatedTotalAmount}
              isSubmitting={isSubmitting}
            />
          </div>
        </form>
      </main>

      <QrPaymentModal
        orderId={createdOrderId}
        isOpen={showQrModal}
        onClose={() => { setShowQrModal(false); navigate('/orders') }}
        onPaymentSuccess={() => {
          setShowQrModal(false)
          navigate('/orders', { state: { successMessage: `Thanh toán thành công đơn #${createdOrderId}!` } })
        }}
      />

      <HomeFooter />
    </div>
  )
}
