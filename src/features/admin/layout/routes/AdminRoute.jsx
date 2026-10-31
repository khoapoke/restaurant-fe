import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Route Guard bảo vệ phân hệ Quản trị Admin
 * - Chưa đăng nhập -> Chuyển hướng về /login
 * - Đã đăng nhập nhưng không có vai trò ADMIN -> Hiển thị màn hình từ chối truy cập
 * - Có vai trò ADMIN -> Cho phép truy cập
 */
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center text-center p-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-xs text-gray-400 font-medium">Đang xác thực quyền quản trị...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center text-center p-6 text-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Truy cập bị từ chối</h2>
        <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
          Tài khoản của bạn ({user?.username}) mang vai trò <span className="font-mono text-amber-400 font-semibold">{user?.role}</span>, không có đặc quyền truy cập khu vực Quản trị hệ thống (yêu cầu vai trò <span className="font-mono text-emerald-400 font-semibold">ADMIN</span>).
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

