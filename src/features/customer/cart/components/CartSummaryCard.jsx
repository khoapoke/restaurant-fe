import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Utensils } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Thẻ Tóm Tắt Đơn Hàng (CartSummaryCard)
 * - Tinh tế Fine-Dining & Sticky cố định bên phải
 * - Đồng bộ Centralized Design Tokens
 * - Giữ nguyên các hàng tính tiền & Cam kết bảo ôn 100%
 * - Độ dài < 90 dòng
 */
export default function CartSummaryCard({
  totalQuantity = 0,
  estimatedTotalAmount = 0,
  hasUnavailableItems = false,
  onCheckout,
}) {
  const totalNumber = Number(estimatedTotalAmount || 0)

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 space-y-5 sticky top-24 backdrop-blur-xl shadow-xl">
      <h3 className="text-base font-serif font-bold text-text-main border-b border-border-subtle pb-3">
        Thông tin đơn hàng
      </h3>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-text-muted">
          <span>Tổng số món:</span>
          <span className="font-semibold text-text-main">{totalQuantity} món</span>
        </div>

        <div className="flex items-center justify-between text-text-muted">
          <span>Tạm tính tiền món:</span>
          <span className="font-mono font-semibold text-text-main">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div className="flex items-center justify-between text-text-muted">
          <span>Phí phục vụ & giao món:</span>
          <span className="text-status-success font-medium">Miễn phí giao hàng</span>
        </div>

        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-text-main block">Tổng dự kiến:</span>
            <span className="text-[10px] text-text-muted">(Đã bao gồm thuế VAT)</span>
          </div>
          <span className="text-xl font-extrabold text-brand-primary font-mono">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {hasUnavailableItems && (
        <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs leading-relaxed">
          Có món tạm hết hàng trong giỏ. Vui lòng xóa món đó để tiếp tục đặt hàng.
        </div>
      )}

      {/* Button Checkout */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        disabled={hasUnavailableItems || totalQuantity === 0}
        onClick={onCheckout}
        className="w-full shadow-lg shadow-brand-primary/10"
      >
        Đặt hàng
      </Button>

      {/* Link tiếp tục mua */}
      <Link
        to="/menu"
        className="flex items-center justify-center gap-1.5 text-xs text-brand-primary hover:underline font-medium pt-1 text-center"
      >
        <Utensils className="w-3.5 h-3.5" />
        <span>Tiếp tục chọn thêm món khác</span>
      </Link>

      {/* Cam kết chất lượng */}
      <div className="pt-4 border-t border-border-subtle flex items-start gap-2.5 text-[11px] text-text-muted">
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Đóng gói chuyên dụng giữ nhiệt 100%, đảm bảo chất lượng ẩm thực hảo hạng khi đến tay bạn.
        </p>
      </div>
    </div>
  )
}
