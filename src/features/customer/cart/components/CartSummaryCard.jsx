import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Utensils } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const CartSummaryCard = ({
  totalQuantity = 0,
  estimatedTotalAmount = 0,
  hasUnavailableItems = false,
  onCheckout,
}) => {
  const totalNumber = Number(estimatedTotalAmount || 0)

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-24 backdrop-blur-xl shadow-xl">
      <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3">
        Tóm tắt đơn hàng
      </h3>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-gray-300">
          <span>Tổng số món:</span>
          <span className="font-semibold text-gray-100">{totalQuantity} món</span>
        </div>

        <div className="flex items-center justify-between text-gray-300">
          <span>Tạm tính tiền món:</span>
          <span className="font-mono font-semibold text-gray-100">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-300">
          <span>Phí phục vụ & giao món:</span>
          <span className="text-emerald-400 font-medium">Miễn phí giao hàng</span>
        </div>

        <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Tổng dự kiến:</span>
            <span className="text-[10px] text-gray-500">(Đã bao gồm thuế VAT)</span>
          </div>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {hasUnavailableItems && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
          Có món tạm hết hàng trong giỏ. Vui lòng xóa món đó để tiếp tục đặt hàng.
        </div>
      )}

      {/* Button Checkout */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        icon={ArrowRight}
        disabled={hasUnavailableItems || totalQuantity === 0}
        onClick={onCheckout}
        className="w-full shadow-lg shadow-amber-500/10"
      >
        Tiến hành Đặt hàng
      </Button>

      {/* Link tiếp tục mua */}
      <Link
        to="/menu"
        className="flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium pt-1 text-center"
      >
        <Utensils className="w-3.5 h-3.5" />
        <span>Tiếp tục chọn thêm món khác</span>
      </Link>

      {/* Cam kết chất lượng */}
      <div className="pt-4 border-t border-gray-800/80 flex items-start gap-2.5 text-[11px] text-gray-400">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Đóng gói chuyên dụng giữ nhiệt 100%, đảm bảo chất lượng ẩm thực hảo hạng khi đến tay bạn.
        </p>
      </div>
    </div>
  )
}

export default CartSummaryCard
