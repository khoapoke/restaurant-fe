import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, UtensilsCrossed } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Trạng Thái Giỏ Hàng Trống (CartEmptyState)
 * - 0 icon Sparkles
 * - Đồng bộ Design Tokens
 * - Độ dài < 50 dòng
 */
export default function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 rounded-3xl border border-dashed border-border-subtle bg-surface-card/60 text-center max-w-2xl mx-auto my-6">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-xl shadow-brand-primary/5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-primary text-surface-bg flex items-center justify-center font-bold text-xs">
          0
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium mb-3">
        <UtensilsCrossed className="w-3.5 h-3.5" />
        <span>Thực đơn phong phú đang chờ đón bạn</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-serif font-bold text-text-main mb-2">
        Chưa có gì mới
      </h3>

      <p className="text-sm text-text-muted max-w-md leading-relaxed mb-8">
        Bạn chưa thêm món ăn nào vào giỏ hàng. Hãy khám phá các món ăn hảo hạng và ưu đãi gợi ý theo thời tiết tại nhà hàng.
      </p>

      <Link to="/menu">
        <Button variant="primary" size="lg" icon={ArrowRight}>
          Khám phá Thực đơn ngay
        </Button>
      </Link>
    </div>
  )
}
