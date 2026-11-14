import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand'
import {
  Menu,
  X,
  ChefHat,
  UtensilsCrossed,
  CalendarDays,
  ShoppingBag,
  Package,
  ShieldCheck,
  User,
  LogOut,
  Home,
  Clock,
  Phone,
  ChevronRight,
} from 'lucide-react'

/**
 * Component Header Trang Chủ (HomeHeader) - Adaptive Fine-Dining Navigation Bar
 * Thiết kế chuẩn mực theo Design System (design-system/t-resmk/MASTER.md):
 * - Bên Trái: Logo T-ResMK sắc sảo, chống rớt dòng
 * - Ở Giữa: Thanh Menu điều hướng ngang thanh lịch (Desktop lg+) với Underline Indicator tinh xảo
 * - Bên Phải: Nút CTA Đặt bàn (Option A: nền Amber ấm), Giỏ hàng, Tài khoản & Hamburger toggle (Mobile)
 * - Mobile: Slide-out Drawer mượt mà 60 FPS
 */
export default function HomeHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Đóng Drawer khi chuyển trang
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Lắng nghe phím Escape để đóng Drawer
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setDrawerOpen(false)
    }
  }, [])

  useEffect(() => {
    if (drawerOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [drawerOpen, handleKeyDown])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Danh sách các link điều hướng chính
  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/menu', label: 'Thực đơn', icon: UtensilsCrossed },
    { to: '/reservation', label: 'Đặt bàn', icon: CalendarDays },
    ...(isAuthenticated
      ? [{ to: '/orders', label: 'Đơn mua', icon: Package }]
      : []),
    ...(isAuthenticated && user?.role === 'ADMIN'
      ? [{ to: '/admin', label: 'Quản trị', icon: ShieldCheck }]
      : []),
  ]

  return (
    <>
      {/* =========================================================================
          1. THANH HEADER ĐIỀU HƯỚNG CỐ ĐỊNH (STICKY TOP NAVBAR)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-surface-bg/95 backdrop-blur-md border-b border-border-subtle transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Cụm 1: Logo Thương Hiệu T-ResMK (Bên Trái) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-brand-primary group-hover:border-border-strong transition-colors">
              <ChefHat className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-wider text-text-main text-lg leading-none whitespace-nowrap">
                {BRAND_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-dim mt-1 leading-none font-medium">
                {BRAND_TAGLINE}
              </span>
            </div>
          </Link>

          {/* Cụm 2: Menu Điều Hướng Trung Tâm (Desktop Menu Bar: lg+) */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => {
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative py-2 text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'text-text-main font-semibold'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Underline Indicator phát sáng nhẹ khi trang đang active */}
                  {active && (
                    <span className="absolute -bottom-4.5 left-0 right-0 h-[2px] bg-brand-primary rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Cụm 3: Tiện Ích Phải (CTA Đặt Bàn, Giỏ Hàng, Tài Khoản & Mobile Hamburger) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Nút Đặt bàn nhanh CTA (Option A: Nền Amber ấm nổi bật) */}
            <Link
              to="/reservation"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-surface-bg transition-colors shadow-sm cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Đặt bàn ngay</span>
            </Link>

            {/* Nút Giỏ Hàng Thời Gian Thực */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-primary text-surface-bg font-bold text-[10px] flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {/* Tài Khoản / Đăng Nhập */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-border-subtle">
                <Link
                  to="/profile"
                  className="p-1 rounded-lg hover:bg-surface-card transition-colors"
                  title={`Hồ sơ: ${user?.username}`}
                >
                  <div className="w-7 h-7 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center text-text-body hover:border-border-strong transition-colors">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-block text-xs font-medium text-text-muted hover:text-text-main px-2.5 py-1.5 rounded-lg hover:bg-surface-card transition-colors cursor-pointer"
              >
                Đăng nhập
              </Link>
            )}

            {/* Nút Hamburger Mở Drawer Trên Mobile / Tablet (< lg) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở Menu điều hướng"
              className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-card border border-border-subtle transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. NAVIGATION SLIDE-OUT DRAWER (MOBILE & TABLET)
          ========================================================================= */}
      {/* Lớp Overlay Backdrop (Chỉ hiển thị khi mở để giải phóng GPU 60 FPS) */}
      <div
        role="presentation"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 transition-all duration-300 ${
          drawerOpen
            ? 'opacity-100 pointer-events-auto visible backdrop-blur-sm'
            : 'opacity-0 pointer-events-none invisible'
        }`}
      />

      {/* Khung Drawer Trượt Ra Từ Bên Phải */}
      <aside
        aria-label="Menu điều hướng di động"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-88 bg-surface-elevated border-l border-border-subtle shadow-2xl flex flex-col will-change-transform transform transition-all duration-300 ease-out ${
          drawerOpen
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
            onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
                  className="text-xs text-brand-primary hover:underline shrink-0 pl-2"
                >
                  Hồ sơ
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout()
                  setDrawerOpen(false)
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
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center py-2 rounded-lg text-xs font-medium text-text-body bg-surface-card hover:bg-surface-card-hover border border-border-subtle transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
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
