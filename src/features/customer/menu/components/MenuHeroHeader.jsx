import { Flame } from 'lucide-react'

/**
 * Sub-component Banner Tiêu Đề Thực Đơn (MenuHeroHeader)
 * - Độ dài < 40 dòng
 */
export default function MenuHeroHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-xs font-semibold text-brand-primary mb-3">
        <Flame className="w-3.5 h-3.5" />
        <span>Mỹ vị tinh hoa &amp; Nghệ thuật ẩm thực</span>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-main">
        Thực Đơn Nhà Hàng
      </h1>
      <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
        Tuyển chọn những tuyệt tác ẩm thực được chế tác từ nguyên liệu tươi hữu cơ và nguồn cảm hứng đương đại.
      </p>
    </div>
  )
}

