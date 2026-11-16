import { Headphones, RefreshCw } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export const AdminChatHeader = ({ loading, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-main">Trực Chat & Hỗ trợ Khách hàng</h2>
          <p className="text-xs text-text-muted">
            Tiếp nhận các phiên yêu cầu người thật và giải đáp trực tiếp cho thực khách (Hybrid CS)
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        icon={RefreshCw}
        isLoading={loading}
        onClick={onRefresh}
      >
        Làm mới
      </Button>
    </div>
  )
}

export default AdminChatHeader

