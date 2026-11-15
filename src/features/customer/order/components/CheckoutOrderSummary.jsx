import { ShieldCheck, ArrowRight, UtensilsCrossed } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { resolveDishImage, handleImageError } from '../../../../utils/imageUtils'

/**
 * Thẻ Tóm Tắt Đơn Hàng & Đặt Món (CheckoutOrderSummary)
 * - Sticky top-24, cuộn mượt danh sách món
 * - Đồng bộ Centralized Design Tokens
 * - Độ dài < 110 dòng
 */
export default function CheckoutOrderSummary({
  items = [],
  totalQuantity = 0,
  estimatedTotalAmount = 0,
  isSubmitting = false,
}) {
  const totalNumber = Number(estimatedTotalAmount || 0)

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 space-y-5 sticky top-24 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h3 className="text-sm font-serif font-bold text-text-main flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-brand-primary" />
          <span>Món ăn trong đơn ({totalQuantity})</span>
        </h3>
        <span className="text-[11px] text-text-muted">{items.length} loại món</span>
      </div>

      {/* Danh sách cuộn món ăn */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-border-subtle/50">
        {items.map((it) => (
          <div key={it.dishId} className="flex items-center justify-between text-xs gap-3 pt-2.5 first:pt-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={resolveDishImage(it.imageUrl, it)}
                alt={it.dishName}
                onError={(e) => handleImageError(e, resolveDishImage(null, it))}
                className="w-10 h-10 rounded-lg object-cover bg-surface-bg border border-border-subtle shrink-0"
              />
              <div className="truncate">
                <p className="text-text-main font-semibold truncate">{it.dishName}</p>
                <p className="text-[11px] text-text-muted font-mono">
                  x{it.quantity} • {Number(it.unitPrice).toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-text-main shrink-0">
              {Number(it.subTotal).toLocaleString('vi-VN')} đ
            </span>
          </div>
        ))}
      </div>

      {/* Chi tiết tính tiền */}
      <div className="pt-3 border-t border-border-subtle space-y-2 text-xs text-text-muted">
        <div className="flex justify-between">
          <span>Tạm tính tiền món:</span>
          <span className="font-mono font-semibold text-text-main">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>
        <div className="flex justify-between">
          <span>Phí giao hàng:</span>
          <span className="text-status-success font-medium">Miễn phí</span>
        </div>
        <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-text-main block">Tổng thanh toán:</span>
            <span className="text-[10px] text-text-muted">(Đã bao gồm thuế VAT)</span>
          </div>
          <span className="text-xl font-extrabold text-brand-primary font-mono">
            {totalNumber.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Nút đặt món */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        icon={ArrowRight}
        loading={isSubmitting}
        disabled={isSubmitting || items.length === 0}
        className="w-full shadow-lg shadow-brand-primary/10"
      >
        Xác nhận Đặt món ngay
      </Button>

      {/* Cam kết */}
      <div className="pt-3 border-t border-border-subtle/80 flex items-start gap-2 text-[11px] text-text-muted">
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Đảm bảo bảo mật thông tin & chất lượng món ăn nóng hổi hảo hạng.
        </p>
      </div>
    </div>
  )
}

