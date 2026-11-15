import { Link } from 'react-router-dom'
import { BRAND_NAME } from '@/constants/brand'
import {
  X,
  ChefHat,
  User,
  LogOut,
  Clock,
  Phone,
  ChevronRight,
} from 'lucide-react'

/**
 * Component Slide-out Drawer cho Mobile & Tablet (HomeMobileDrawer)
 * Chuẩn mực Design System:
 * - Tách riêng sub-component để đảm bảo Header < 200 dòng
 * - Đảm bảo 60 FPS, đóng mở mượt mà
 */
export default function HomeMobileDrawer({
  isOpen,
  onClose,
  navLinks,
  isActive,
  isAuthenticated,
  user,
  logout,
}) {
  return (
    <>
      {/* Lớp Overlay Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto visible backdrop-blur-sm'
            : 'opacity-0 pointer-events-none invisible'
        }`}
      />

      {/* Khung Drawer Trượt Ra Từ Bên Phải */}
      <aside
        aria-label="Menu điều hướng di động"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-88 bg-surface-elevated border-l border-border-subtle shadow-2xl flex flex-col will-change-transform transform transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-x-0 visible pointer-events-auto'
            : 'translate-x-full invisible pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-brand-primary">
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-text-main tracking-wide">
              {BRAND_NAME}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-text-dim uppercase">
              Điều hướng
            </p>

            {navLinks.map((item) => {
              const Icon = item.icon
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-surface-card text-brand-primary font-semibold'
                      : 'text-text-body hover:text-text-main hover:bg-surface-card/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-text-muted" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-dim" />
                </Link>
              )
            })}
          </div>

          {/* Hotline & Giờ Phục Vụ */}
          <div className="pt-4 border-t border-border-subtle px-3 space-y-2 text-xs text-text-muted">
            <div className="flex items-center gap-2 text-text-body font-medium">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>10:00 - 23:00 hàng ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-text-muted" />
              <span>Hotline VIP: 0987.654.321</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer: Tài Khoản / Đăng Nhập / Đăng Xuất */}
        <div className="p-4 border-t border-border-subtle bg-surface-elevated">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-card border border-border-subtle">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-surface-card-hover flex items-center justify-center text-text-body shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-text-main truncate">
                      {user?.userProfile?.fullName || user?.username}
                    </p>
                    <p className="text-[10px] text-text-dim uppercase">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="text-xs text-brand-primary hover:underline shrink-0 pl-2"
                >
                  Hồ sơ
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-status-error hover:bg-surface-card transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center py-2 rounded-lg text-xs font-medium text-text-body bg-surface-card hover:bg-surface-card-hover border border-border-subtle transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center py-2 rounded-lg text-xs font-medium text-surface-bg bg-brand-primary hover:bg-brand-hover transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

