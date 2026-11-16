import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Route Guard bảo vệ phân hệ Quản trị Admin
 * - Chưa đăng nhập -> Chuyển hướng về /login
 * - Đã đăng nhập nhưng không có vai trò ADMIN -> Hiển thị màn hình từ chối truy cập
 * - Có vai trò ADMIN -> Cho phép truy cập
 * - 100% Centralized Design Tokens, < 60 dòng
 */
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center text-center p-4">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
        <p className="text-xs text-text-muted font-medium">Đang xác thực quyền quản trị T-ResMK...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center text-center p-6 text-text-main">
        <div className="w-16 h-16 rounded-2xl bg-status-error/10 border border-status-error/30 flex items-center justify-center text-status-error mb-4 shadow-lg shadow-status-error/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Truy cập bị từ chối</h2>
        <p className="text-xs text-text-muted max-w-sm mb-6 leading-relaxed">
          Tài khoản của bạn ({user?.username}) mang vai trò <span className="font-mono text-brand-primary font-semibold">{user?.role}</span>, không có đặc quyền truy cập khu vực Quản trị hệ thống (yêu cầu vai trò <span className="font-mono text-status-success font-semibold">ADMIN</span>).
        </p>
        <Button
          variant="secondary"
          size="md"
          icon={ArrowLeft}
          onClick={() => window.location.replace('/')}
        >
          Quay lại Trang khách hàng
        </Button>
      </div>
    )
  }

  return children
}

export default AdminRoute
