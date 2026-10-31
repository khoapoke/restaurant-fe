import { Link } from 'react-router-dom'
import { Construction, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const AdminPlaceholderPage = ({
  title,
  stage,
  description,
  plannedFeatures = [],
}) => {
  return (
    <div className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <Construction className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          {stage}
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          {description ||
            `Module ${title} đã được quy hoạch trong tài liệu admin-roadmap.md và sẵn sàng được triển khai ở bước tiếp theo.`}
        </p>
      </div>

      {plannedFeatures.length > 0 && (
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 text-left space-y-2.5 max-w-md mx-auto">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Tính năng cốt lõi dự kiến:
          </span>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {plannedFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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

