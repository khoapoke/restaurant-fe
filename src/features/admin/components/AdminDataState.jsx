import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'

export const AdminDataState = ({ loading, error, empty, onRetry, emptyMessage = 'Chưa có dữ liệu phù hợp.', emptyAction, children }) => {
  if (loading) {
    return <div className="grid gap-4" role="status" aria-label="Đang tải dữ liệu"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
  }

  if (error) {
    return (
      <div className="min-h-64 grid place-items-center border border-red-200 bg-red-50 p-8 text-center" role="alert">
        <div><AlertTriangle className="mx-auto h-9 w-9 text-red-700" /><p className="mt-3 text-sm text-red-800">{error}</p><Button className="mt-5" icon={RefreshCw} onClick={onRetry}>Thử lại</Button></div>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="min-h-56 grid place-items-center border border-dashed border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center">
        <div><Inbox className="mx-auto h-9 w-9 text-[#6f1d32]" /><p className="mt-3 text-sm text-[#625a55]">{emptyMessage}</p>{emptyAction && <div className="mt-5">{emptyAction}</div>}</div>
      </div>
    )
  }

  return children
}

export default AdminDataState
