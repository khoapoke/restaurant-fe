import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { Menu, ExternalLink, LogOut, Shield } from 'lucide-react'
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

/**
 * Thanh Điều Hướng Trên (AdminHeader)
 * - Đồng bộ thương hiệu T-ResMK Admin
 * - 100% Centralized Design Tokens
 * - Độ dài < 95 dòng
 */
export const AdminHeader = ({ onOpenMobile }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const currentTitle = routeTitles[location.pathname] || 'Bảng điều khiển Quản trị'

  return (
    <header className="h-16 px-4 sm:px-6 bg-surface-card/80 border-b border-border-subtle backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left side: Hamburger & Current Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-card-hover lg:hidden transition-colors cursor-pointer"
          title="Mở thanh điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-main tracking-wide">
            {currentTitle}
          </h1>
          <p className="text-[10px] text-text-muted hidden sm:block">
            Hệ thống Quản lý Nhà hàng T-ResMK
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
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-main bg-surface-bg border border-border-subtle hover:border-border-strong transition-colors"
        >
          <span>Xem Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-primary" />
        </Link>

        {/* Admin User Info */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-text-main leading-tight">
              {user?.userProfile?.fullName || user?.username || 'Quản trị viên'}
            </p>
            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {user?.role || 'ADMIN'}
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
          className="text-text-muted hover:text-status-error"
        >
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}

export default AdminHeader
