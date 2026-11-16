import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Grid,
  CalendarCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react'

const navGroups = [
  {
    title: 'Tổng quan',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Báo cáo & Thống kê' },
    ],
  },
  {
    title: 'Thực đơn & Món ăn',
    items: [
      { to: '/admin/dishes', icon: UtensilsCrossed, label: 'Quản lý Món ăn' },
      { to: '/admin/categories', icon: FolderTree, label: 'Quản lý Danh mục' },
    ],
  },
  {
    title: 'Bán hàng & Thu chi',
    items: [
      { to: '/admin/orders', icon: ShoppingBag, label: 'Quản lý Đơn hàng' },
      { to: '/admin/payments', icon: CreditCard, label: 'Giao dịch Thanh toán' },
    ],
  },
  {
    title: 'Nhà hàng & Đặt chỗ',
    items: [
      { to: '/admin/tables', icon: Grid, label: 'Sơ đồ Bàn ăn' },
      { to: '/admin/reservations', icon: CalendarCheck, label: 'Điều phối Đặt bàn' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { to: '/admin/accounts', icon: Users, label: 'Quản lý Người dùng' },
    ],
  },
]

/**
 * Thanh Điều Hướng Dọc (AdminSidebar)
 * - Thương hiệu T-ResMK Admin
 * - 100% Centralized Design Tokens, Tooltip nổi khi thu gọn
 * - Độ dài < 170 dòng
 */
export const AdminSidebar = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-surface-card/95 border-r border-border-subtle backdrop-blur-md transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-active flex items-center justify-center text-surface-bg font-bold shrink-0 shadow-md shadow-brand-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-bold tracking-wider text-text-main text-sm block truncate">
                  T-RESMK ADMIN
                </span>
                <span className="text-[10px] text-brand-primary tracking-wider font-semibold block uppercase">
                  Restaurant
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card-hover lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative
                      ${
                        isActive
                          ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30 shadow-sm'
                          : 'text-text-muted hover:text-text-main hover:bg-surface-card-hover border border-transparent'
                      }
                      ${isCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {/* Floating Tooltip khi Sidebar ở chế độ thu gọn */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-strong text-text-main text-xs whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Collapse Toggle Footer (Desktop only) */}
        <div className="hidden lg:flex p-3 border-t border-border-subtle items-center justify-end">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs text-text-muted hover:text-text-main hover:bg-surface-card-hover transition-colors cursor-pointer"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Thu gọn menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
