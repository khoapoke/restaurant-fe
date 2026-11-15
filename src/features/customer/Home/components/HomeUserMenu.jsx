import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, ShieldCheck, LogOut, ChevronDown } from 'lucide-react'

/**
 * Component Menu Tài Khoản Hover (HomeUserMenu)
 * Chuẩn mực Design System:
 * - Tự động mở khi hover chuột, có độ trễ 150ms chống đóng giật lag
 * - Tinh gọn: Thông tin cá nhân, Hồ sơ (/profile), Quản trị (/admin nếu có) và Đăng xuất
 * - Tối ưu hiệu năng, độ dài < 130 dòng
 */
export default function HomeUserMenu({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef(null)
  const navigate = useNavigate()

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }, [])

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    if (logout) {
      await logout()
    }
  }

  const displayName = user?.userProfile?.fullName || user?.username || 'Thực khách'
  const roleName = user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng VIP'

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút Avatar Kích Hoạt Hover */}
      <button
        type="button"
        onClick={() => navigate('/profile')}
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-surface-card border border-border-subtle hover:border-border-strong transition-all cursor-pointer group"
      >
        <div className="w-7 h-7 rounded-full bg-surface-bg border border-border-subtle flex items-center justify-center text-text-body group-hover:text-brand-primary shrink-0 transition-colors">
          <User className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-medium text-text-main max-w-28 truncate hidden xl:inline-block">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : ''
          }`}
        />
      </button>

      {/* Menu Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50 w-56 animate-in fade-in zoom-in-95 duration-150">
          <div className="rounded-xl bg-surface-elevated border border-border-subtle shadow-xl overflow-hidden p-1.5 text-xs">
            {/* Header thông tin tóm tắt */}
            <div className="px-3 py-2.5 bg-surface-card/60 rounded-lg mb-1 border border-border-subtle/50">
              <p className="font-semibold text-text-main truncate text-xs">
                {displayName}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-text-muted font-mono truncate">
                  @{user?.username}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-subtle text-brand-primary border border-border-brand uppercase tracking-wider">
                  {roleName}
                </span>
              </div>
            </div>

            {/* Mục 1: Hồ sơ & Sở thích */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-body hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-text-muted" />
              <span>Hồ sơ &amp; Sở thích</span>
            </Link>

            {/* Mục 2: Quản trị (Dành riêng cho ADMIN) */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-body hover:text-text-main hover:bg-surface-card transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>Trang quản trị</span>
              </Link>
            )}

            {/* Đường phân cách */}
            <div className="my-1 border-t border-border-subtle" />

            {/* Nút Đăng xuất */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-status-error hover:bg-surface-card transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

