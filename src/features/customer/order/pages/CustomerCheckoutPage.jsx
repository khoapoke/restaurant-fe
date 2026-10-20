import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Banknote,
  Truck,
  Utensils,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useCart } from '../../../../contexts/CartContext'
import { checkoutApi } from '../services/orderService'
import { FulfillmentType, PaymentMethod } from '../constants'
import { FALLBACK_DISH_IMAGE } from '../../menu/constants'
import QrPaymentModal from '../components/QrPaymentModal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'

export const CustomerCheckoutPage = () => {
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await checkoutApi({
        fulfillmentType: formData.fulfillmentType,
        recipientName: formData.recipientName.trim(),
        recipientPhone: formData.recipientPhone.trim(),
        shippingAddress:
          formData.fulfillmentType === FulfillmentType.DELIVERY
            ? formData.shippingAddress.trim()
            : `${formData.fulfillmentType} tại nhà hàng`,
        paymentMethod: formData.paymentMethod,
        orderNote: formData.orderNote.trim() || undefined,
      })

      const newOrder = response.data
      await fetchCart() // Đồng bộ xóa sạch giỏ hàng

      if (formData.paymentMethod === PaymentMethod.BANK_TRANSFER_QR) {
        setCreatedOrderId(newOrder.orderId)
        setShowQrModal(true)
      } else {
        navigate('/orders', {
          state: { successMessage: `Đặt hàng thành công đơn #${newOrder.orderId}!` },
        })
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col">
      <header className="border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
          </Link>
          <span className="text-sm font-bold tracking-wider text-white">CHECKOUT • ĐẶT HÀNG</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái (7/12): Form thông tin & Phương thức */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}

            {/* Khung 1: Hình thức nhận món */}
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" /> Hình thức nhận món
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: FulfillmentType.DELIVERY, label: 'Giao hàng', icon: Truck },
                  { type: FulfillmentType.DINE_IN, label: 'Ăn tại chỗ', icon: Utensils },
                  { type: FulfillmentType.TAKEAWAY, label: 'Tự đến lấy', icon: ShoppingBag },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, fulfillmentType: item.type }))}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer
                      ${
                        formData.fulfillmentType === item.type
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Khung 2: Thông tin người nhận */}
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Thông tin người nhận & Địa chỉ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Họ tên người nhận"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  error={errors.recipientName}
                  required
                />
                <Input
                  label="Số điện thoại liên hệ"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  error={errors.recipientPhone}
                  required
                />
                {formData.fulfillmentType === FulfillmentType.DELIVERY && (
                  <div className="sm:col-span-2">
                    <Input
                      label="Địa chỉ giao hàng"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      error={errors.shippingAddress}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                      required
                    />
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-300 block mb-1">
                    Ghi chú cho nhà hàng / tài xế
                  </label>
                  <textarea
                    name="orderNote"
                    value={formData.orderNote}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ví dụ: Gọi điện trước khi giao, ít cay, không hành..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Khung 3: Phương thức thanh toán */}
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Phương thức thanh toán</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, paymentMethod: PaymentMethod.BANK_TRANSFER_QR }))
                  }
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer
                    ${
                      formData.paymentMethod === PaymentMethod.BANK_TRANSFER_QR
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                >
                  <QrCode className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-100">Chuyển khoản VietQR</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Quét mã QR tự động xác nhận</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, paymentMethod: PaymentMethod.CASH }))
                  }
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer
                    ${
                      formData.paymentMethod === PaymentMethod.CASH
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-100">Tiền mặt</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Thanh toán khi nhận món ăn</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải (5/12): Xem lại đơn hàng & Chốt đơn */}
          <div className="lg:col-span-5 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-24 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3">
              Món ăn trong đơn ({totalQuantity})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.items?.map((it) => (
                <div key={it.dishId} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.imageUrl || FALLBACK_DISH_IMAGE}
                      alt={it.dishName}
                      onError={(e) => {
                        e.target.src = FALLBACK_DISH_IMAGE
                      }}
                      className="w-9 h-9 rounded-lg object-cover bg-gray-950 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-gray-200 font-medium truncate">{it.dishName}</p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        x{it.quantity} • {Number(it.unitPrice).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-gray-200 shrink-0">
                    {Number(it.subTotal).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Tạm tính tiền món:</span>
                <span className="font-mono">{Number(estimatedTotalAmount).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="text-emerald-400">Miễn phí</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Tổng thanh toán:</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {Number(estimatedTotalAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full shadow-lg shadow-amber-500/20"
            >
              Xác nhận Đặt món ngay
            </Button>
          </div>
        </form>
      </main>

      <QrPaymentModal
        orderId={createdOrderId}
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false)
          navigate('/orders')
        }}
        onPaymentSuccess={() => {
          setShowQrModal(false)
          navigate('/orders')
        }}
      />
    </div>
  )
}

export default CustomerCheckoutPage
