import { Link } from 'react-router-dom'
import { PackageOpen, ArrowRight } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Trạng Thái Danh Sách Đơn Hàng Trống (OrderEmptyState)
 * - Tinh tế Fine-Dining & 0 icon Sparkles
 * - Độ dài < 50 dòng
 */
export default function OrderEmptyState({ selectedStatus = 'ALL' }) {
  const isAll = selectedStatus === 'ALL'

  return (
    <div className="p-10 sm:p-14 text-center rounded-2xl border border-dashed border-border-subtle bg-surface-card/50 space-y-4 my-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto shadow-lg shadow-brand-primary/5">
        <PackageOpen className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-serif font-bold text-text-main">
          {isAll ? 'Chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng'}
        </h3>
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          {isAll
            ? 'Bạn chưa đặt món ăn nào tại nhà hàng. Hãy khám phá các món ăn hảo hạng và ưu đãi gợi ý hôm nay.'
            : 'Hiện không có đơn hàng nào thuộc phân loại trạng thái này trong lịch sử của bạn.'}
        </p>
      </div>

      <div className="pt-2">
        <Link to="/menu">
          <Button variant="primary" size="sm" icon={ArrowRight}>
            Khám phá Thực đơn
          </Button>
        </Link>
      </div>
    </div>
  )
}

