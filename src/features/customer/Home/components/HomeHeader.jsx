import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand'
import { AnimatedBackground } from '@/components/core/animated-background'
import HomeUserMenu from './HomeUserMenu'
import HomeMobileDrawer from './HomeMobileDrawer'
import {
  Menu,
  ChefHat,
  UtensilsCrossed,
  CalendarDays,
  ShoppingBag,
  Package,
  ShieldCheck,
  Home,
} from 'lucide-react'

/**
 * Component Header Trang Chủ (HomeHeader) - Adaptive Fine-Dining Navigation Bar
 * Thiết kế chuẩn mực theo Design System:
 * - Logo T-ResMK, Thanh Menu ngang với AnimatedBackground hover,
 * - Nút Đặt bàn, Giỏ hàng, User Menu Dropdown (Hover) & Hamburger toggle (Mobile)
 */
export default function HomeHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Đóng Drawer khi chuyển trang hoặc ấn Escape
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setDrawerOpen(false)
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

  const isActive = useCallback(
    (path) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  // Danh sách các link điều hướng chính
  const navLinks = useMemo(
    () => [
      { to: '/', label: 'Trang chủ', icon: Home },
      { to: '/menu', label: 'Thực đơn', icon: UtensilsCrossed },
      { to: '/reservation', label: 'Đặt bàn', icon: CalendarDays },
      ...(isAuthenticated
        ? [{ to: '/orders', label: 'Đơn mua', icon: Package }]
        : []),
      ...(isAuthenticated && user?.role === 'ADMIN'
        ? [{ to: '/admin', label: 'Quản trị', icon: ShieldCheck }]
        : []),
    ],
    [isAuthenticated, user?.role]
  )

  return (
    <>
      {/* 1. THANH HEADER ĐIỀU HƯỚNG CỐ ĐỊNH (STICKY TOP NAVBAR) */}
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

          {/* Cụm 2: Menu Điều Hướng Trung Tâm (Desktop Menu Bar: lg+) với AnimatedBackground Hover Pill */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-surface-card/40 border border-border-subtle/50 backdrop-blur-sm">
            <AnimatedBackground
              defaultValue={navLinks.find((item) => isActive(item.to))?.to}
              className="rounded-lg bg-surface-card border border-border-subtle shadow-sm"
              transition={{
                type: 'spring',
                bounce: 0.15,
                duration: 0.3,
              }}
              enableHover={true}
            >
              {navLinks.map((item) => {
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    data-id={item.to}
                    to={item.to}
                    className={`px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer rounded-lg ${
                      active
                        ? 'text-brand-primary font-semibold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </AnimatedBackground>
          </nav>

          {/* Cụm 3: Tiện Ích Phải (CTA Đặt Bàn, Giỏ Hàng, User Menu Dropdown & Mobile Hamburger) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Nút Đặt bàn nhanh CTA */}
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

            {/* Tài Khoản: Dropdown Menu Hover (Desktop) hoặc Nút Đăng Nhập */}
            {isAuthenticated ? (
              <div className="pl-1 border-l border-border-subtle">
                <HomeUserMenu user={user} logout={logout} />
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

      {/* 2. NAVIGATION SLIDE-OUT DRAWER (MOBILE & TABLET) */}
      <HomeMobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
      />
    </>
  )
}
