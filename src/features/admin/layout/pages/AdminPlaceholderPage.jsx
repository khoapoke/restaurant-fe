import { Link } from 'react-router-dom'
import { Construction, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Trang Giữ Chỗ Tính Năng Đang Phát Triển (AdminPlaceholderPage)
 * - 100% Centralized Design Tokens
 * - Độ dài < 60 dòng
 */
export const AdminPlaceholderPage = ({
  title,
  stage,
  description,
  plannedFeatures = [],
}) => {
  return (
    <div className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary flex items-center justify-center mx-auto shadow-lg shadow-brand-primary/10">
        <Construction className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/20 text-xs font-mono font-bold uppercase tracking-wider">
          {stage}
        </span>
        <h2 className="text-2xl font-bold text-text-main tracking-tight">{title}</h2>
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          {description ||
            `Module ${title} hiện đang trong giai đoạn chuẩn bị và sẽ được triển khai ở bước tiếp theo.`}
        </p>
      </div>

      {plannedFeatures.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle text-left space-y-2.5 max-w-md mx-auto">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            Tính năng cốt lõi dự kiến:
          </span>
          <ul className="space-y-1.5 text-xs text-text-body">
            {plannedFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Link to="/admin/dashboard">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Về Dashboard Tổng quan
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default AdminPlaceholderPage
