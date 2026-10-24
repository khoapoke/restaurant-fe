import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, LogOut, Menu, MonitorSmartphone, ShoppingBag, User, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { Role } from '../../features/auth/constants'
import MocBrand from '../brand/MocBrand'
import NotificationBell from '../../features/communications/NotificationBell'

const PUBLIC_ITEMS = [
  { label: 'Câu chuyện', href: '/#story' },
  { label: 'Thực đơn', to: '/menu' },
  { label: 'Trải nghiệm', href: '/#experience' },
]

const ROLE_ITEMS = {
  [Role.CUSTOMER]: [
    { label: 'Đặt bàn', to: '/reservations' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Hồ sơ', to: '/profile', mobileOnly: true },
  ],
  [Role.ADMIN]: [
    { label: 'Quản trị', to: '/admin' },
    { label: 'POS', to: '/staff/floor' },
  ],
  [Role.STAFF]: [
    { label: 'Sơ đồ bàn', to: '/staff/floor' },
    { label: 'Bếp', to: '/staff/kitchen' },
  ],
}

const GUEST_ITEMS = [{ label: 'Đặt bàn', to: '/reservations' }]

const desktopLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'text-[#6f1d32] font-semibold' : 'text-[#211b18] hover:text-[#6f1d32]'}`

export const MocSiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, role, logout } = useAuth()
  const { totalQuantity } = useCart()
  const isCustomer = isAuthenticated && role === Role.CUSTOMER
  const roleItems = isAuthenticated ? ROLE_ITEMS[role] || [] : GUEST_ITEMS
  const workspace = role === Role.ADMIN
    ? { to: '/admin', label: 'Khu quản trị', icon: LayoutDashboard }
    : role === Role.STAFF
      ? { to: '/staff/floor', label: 'Màn hình vận hành', icon: MonitorSmartphone }
      : null

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/')
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <div className="min-h-8 px-4 py-1.5 flex items-center justify-center bg-[#6f1d32] text-[#fff8ed] text-xs tracking-[0.12em] uppercase text-center">
        Vị Việt đương đại <span className="mx-3 opacity-60">•</span> Mở cửa 10:00 — 22:30
      </div>
      <header className="h-[82px] sticky top-0 z-40 px-5 lg:px-[6vw] flex items-center justify-between gap-5 bg-[rgba(245,240,231,0.94)] backdrop-blur-xl border-b border-[var(--moc-line)]">
        <MocBrand />

        <nav className="hidden lg:flex items-center gap-8" aria-label="Điều hướng chính">
          {PUBLIC_ITEMS.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} className={desktopLinkClass}>{item.label}</NavLink>
            ) : (
              <a key={item.label} href={item.href} className="text-sm text-[#211b18] hover:text-[#6f1d32] transition-colors">{item.label}</a>
            )
          )}
          {roleItems.filter((item) => !item.mobileOnly).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className={desktopLinkClass}>{item.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {isCustomer && (
            <>
              <NotificationBell key={user?.accountId} />
              <Link to="/reservations" className="relative p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Đặt bàn">
                <CalendarDays className="w-[18px] h-[18px]" />
              </Link>
              <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label={`Giỏ hàng${totalQuantity ? `, ${totalQuantity} món` : ''}`}>
                <ShoppingBag className="w-[18px] h-[18px]" />
                {totalQuantity > 0 && (
                  <span className="moc-inverse absolute top-0 right-0 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#6f1d32] text-white text-[11px] font-bold">
                    {totalQuantity}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Hồ sơ">
                <User className="w-[18px] h-[18px]" />
              </Link>
            </>
          )}

          {workspace && (
            <Link to={workspace.to} className="moc-inverse hidden sm:inline-flex min-h-10 px-4 items-center gap-2 bg-[#251b19] text-white text-xs font-semibold tracking-[0.06em] hover:bg-[#3a2a27]">
              <workspace.icon className="w-4 h-4" /> {workspace.label}
            </Link>
          )}

          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Đăng xuất" title={`Đăng xuất ${user?.userProfile?.fullName || user?.username || ''}`}>
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <Link to="/login" className="moc-inverse hidden sm:inline-flex min-h-10 px-5 items-center justify-center border border-[#6f1d32] bg-[#6f1d32] text-white text-xs font-semibold tracking-[0.1em] uppercase hover:bg-[#49101f] transition-colors">
              Đăng nhập
            </Link>
          )}

          <button type="button" onClick={() => setIsOpen((value) => !value)} className="lg:hidden p-2.5" aria-expanded={isOpen} aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {isOpen && (
        <nav className="lg:hidden fixed inset-x-0 top-[114px] z-50 max-h-[calc(100vh-114px)] overflow-y-auto p-5 bg-[#fffdf8] border-b border-[var(--moc-line)] shadow-xl" aria-label="Điều hướng di động">
          <div className="flex flex-col">
            {isAuthenticated && (
              <p className="pb-3 mb-1 border-b border-[var(--moc-line)] text-sm text-[#625a55]">
                Xin chào, <strong className="text-[#211b18]">{user?.userProfile?.fullName || user?.username}</strong>
              </p>
            )}
            {PUBLIC_ITEMS.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} onClick={closeMenu} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">{item.label}</Link>
              ) : (
                <a key={item.label} href={item.href} onClick={closeMenu} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">{item.label}</a>
              )
            )}
            {roleItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={closeMenu} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">{item.label}</Link>
            ))}
            {isCustomer && (
              <Link to="/cart" onClick={closeMenu} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">Giỏ hàng{totalQuantity ? ` (${totalQuantity})` : ''}</Link>
            )}
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="py-3 text-left text-base font-semibold text-[#6f1d32]">Đăng xuất</button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="moc-inverse mt-4 min-h-12 grid place-items-center bg-[#6f1d32] text-white text-sm font-semibold tracking-[0.1em] uppercase">Đăng nhập</Link>
            )}
          </div>
        </nav>
      )}
    </>
  )
}

export default MocSiteHeader
