import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import {
  Menu,
  ExternalLink,
  LogOut,
  Shield,
  User,
} from 'lucide-react'
import Button from '../../../../components/ui/Button'

const routeTitles = {
  '/admin/dashboard': 'Báo cáo & Thống kê Dashboard',
  '/admin/dishes': 'Quản lý Món ăn',
  '/admin/categories': 'Quản lý Danh mục',
  '/admin/orders': 'Quản lý Đơn hàng',
  '/admin/payments': 'Giao dịch Thanh toán',
  '/admin/tables': 'Sơ đồ Bàn ăn',
  '/admin/reservations': 'Điều phối Đặt bàn',
  '/admin/accounts': 'Quản lý Người dùng',
}

export const AdminHeader = ({ onOpenMobile }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const currentTitle = routeTitles[location.pathname] || 'Bảng điều khiển Quản trị'

  return (
    <header className="h-16 px-4 sm:px-6 bg-gray-950/80 border-b border-gray-800/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left side: Hamburger & Current Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 lg:hidden"
          title="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
            {currentTitle}
          </h1>
          <p className="text-[10px] text-gray-400 hidden sm:block">
            Phân hệ Quản trị Nhà hàng T-ResMK
          </p>
        </div>
      </div>

      {/* Right side: View Site, Admin Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Customer Site Shortcut */}
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <span>Xem Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
        </Link>

        {/* Admin User Info */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-gray-200 leading-tight">
              {user?.userProfile?.fullName || user?.username}
            </p>
            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={LogOut}
          onClick={logout}
          title="Đăng xuất khỏi hệ thống"
          className="text-gray-400 hover:text-red-400"
        >
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}

export default AdminHeader

