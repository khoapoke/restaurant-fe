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
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-gray-950/95 border-r border-gray-800/80 backdrop-blur-md transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800/70">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 font-bold shrink-0 shadow-md shadow-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-bold tracking-wider text-white text-sm block truncate">
                  T-ResMK ADMIN
                </span>
                <span className="text-[10px] text-amber-400 tracking-wider font-semibold block uppercase">
                  Management
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative
                      ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-900 border border-transparent'
                      }
                      ${isCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Collapse Toggle Footer (Desktop only) */}
        <div className="hidden lg:flex p-3 border-t border-gray-800/70 items-center justify-end">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
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

