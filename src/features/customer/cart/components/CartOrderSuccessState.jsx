import { CheckCircle2, QrCode, History, Utensils, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../../components/ui/Button'
import { PaymentMethod } from '../../order/constants'

/**
 * Màn hình Đặt Hàng Thành Công (Chặng 3 CartOrderFlow)
 * - Hiển thị mã đơn hàng, tóm tắt thanh toán & giao nhận
 * - Nút "Mã QR để thanh toán online" (nếu là chuyển khoản QR)
 * - Nút "Lịch sử đơn đặt hàng" dẫn đến danh sách đơn
 * - 0 icon Sparkles, chuẩn Centralized Design Tokens, < 120 dòng
 */
export default function CartOrderSuccessState({
  orderData = {},
  onOpenQrModal,
  onNavigateOrders,
}) {
  const isQrPayment = orderData.paymentMethod === PaymentMethod.BANK_TRANSFER_QR
  const totalAmountNum = Number(orderData.totalAmount || 0)

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border border-border-subtle bg-surface-card text-center max-w-2xl mx-auto my-6 shadow-2xl backdrop-blur-xl">
      {/* Icon hoàn tất đơn viền trạng thái thành công */}
      <div className="w-20 h-20 rounded-3xl bg-status-success/10 border border-status-success/30 flex items-center justify-center text-status-success shadow-lg shadow-status-success/10 mb-5">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-semibold uppercase tracking-wider mb-3">
        Đặt món thành công
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main mb-2">
        Đơn hàng #{orderData.orderId || '---'} đã được tiếp nhận!
      </h2>

      <p className="text-sm text-text-muted max-w-md leading-relaxed mb-6">
        Cảm ơn bạn đã lựa chọn Lumière Restaurant. Đội ngũ bếp đang chuẩn bị những món ăn tinh tế nhất cho bạn.
      </p>

      {/* Khối thông tin chi tiết nhanh */}
      <div className="w-full max-w-md bg-surface-bg/70 border border-border-subtle rounded-2xl p-4 text-xs space-y-2.5 mb-8 text-left">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Mã đơn hàng:</span>
          <span className="font-mono font-bold text-brand-primary">#{orderData.orderId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Phương thức thanh toán:</span>
          <span className="font-medium text-text-main">
            {isQrPayment ? 'Chuyển khoản VietQR' : 'Tiền mặt khi nhận món'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Hình thức nhận món:</span>
          <span className="font-medium text-text-main">
            {orderData.fulfillmentType === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Tự lấy tại quầy'}
          </span>
        </div>
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
          <span className="text-text-muted font-medium">Tổng tiền:</span>
          <span className="text-base font-extrabold text-brand-primary font-mono">
            {totalAmountNum.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Các nút hành động chính */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        {/* Nút 1: Mã QR để thanh toán online (chỉ hiện khi thanh toán QR) */}
        {isQrPayment && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            icon={QrCode}
            onClick={onOpenQrModal}
            className="w-full sm:flex-1 shadow-lg shadow-brand-primary/20"
          >
            Mã QR để thanh toán online
          </Button>
        )}

        {/* Nút 2: Lịch sử đơn đặt hàng */}
        <Button
          type="button"
          variant={isQrPayment ? 'outline' : 'primary'}
          size="lg"
          icon={Receipt}
          onClick={onNavigateOrders}
          className="w-full sm:flex-1"
        >
          Lịch sử đơn đặt hàng
        </Button>
      </div>

      {/* Link phụ: Khám phá thêm thực đơn */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary mt-6 transition-colors"
      >
        <Utensils className="w-3.5 h-3.5" />
        <span>Khám phá thêm món ăn khác tại thực đơn</span>
      </Link>
    </div>
  )
}

