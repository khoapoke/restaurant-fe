import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Menu, ShoppingBag, User, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import MocBrand from '../brand/MocBrand'

const navItems = [
  { label: 'Câu chuyện', href: '/#story' },
  { label: 'Thực đơn', to: '/menu' },
  { label: 'Trải nghiệm', href: '/#experience' },
]

export const MocSiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()

  return (
    <>
      <div className="h-8 px-4 flex items-center justify-center bg-[#6f1d32] text-[#fff8ed] text-[10px] tracking-[0.15em] uppercase text-center">
        Vị Việt đương đại <span className="mx-3 opacity-45">•</span> Mở cửa 10:00 — 22:30
      </div>
      <header className="h-[82px] sticky top-0 z-40 px-5 lg:px-[6vw] flex items-center justify-between gap-5 bg-[rgba(245,240,231,0.94)] backdrop-blur-xl border-b border-[var(--moc-line)]">
        <MocBrand />

        <nav className="hidden lg:flex items-center gap-9" aria-label="Điều hướng chính">
          {navItems.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="text-xs text-[#211b18] hover:text-[#6f1d32] transition-colors">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="text-xs text-[#211b18] hover:text-[#6f1d32] transition-colors">
                {item.label}
              </a>
            )
          )}
          {isAuthenticated && (
            <Link to="/orders" className="text-xs text-[#211b18] hover:text-[#6f1d32] transition-colors">
              Đơn hàng
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-xs text-[#211b18] hover:text-[#6f1d32] transition-colors">
              Quản trị
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && (
            <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Giỏ hàng">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalQuantity > 0 && (
                <span className="moc-inverse absolute top-0 right-0 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-[#6f1d32] text-white text-[9px]">
                  {totalQuantity}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Hồ sơ">
                <User className="w-[18px] h-[18px]" />
              </Link>
              <button type="button" onClick={logout} className="hidden sm:inline-flex p-2.5 rounded-full hover:bg-[#6f1d32]/8" aria-label="Đăng xuất">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </>
          ) : (
            <Link to="/login" className="moc-inverse hidden sm:inline-flex min-h-10 px-5 items-center justify-center border border-[#6f1d32] bg-[#6f1d32] text-white text-[10px] tracking-[0.1em] uppercase hover:bg-[#49101f] transition-colors">
              Đăng nhập
            </Link>
          )}

          <button type="button" onClick={() => setIsOpen((value) => !value)} className="lg:hidden p-2.5" aria-expanded={isOpen} aria-label="Mở menu">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {isOpen && (
        <nav className="lg:hidden fixed inset-x-0 top-[114px] z-50 p-5 bg-[#fffdf8] border-b border-[var(--moc-line)] shadow-xl" aria-label="Điều hướng di động">
          <div className="flex flex-col">
            {navItems.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} onClick={() => setIsOpen(false)} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">
                  {item.label}
                </a>
              )
            )}
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">Đơn hàng</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="py-3 border-b border-[var(--moc-line)] moc-serif text-xl">Hồ sơ</Link>
                <button type="button" onClick={() => { logout(); setIsOpen(false) }} className="py-3 text-left text-[#6f1d32]">Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="moc-inverse mt-4 min-h-12 grid place-items-center bg-[#6f1d32] text-white text-xs tracking-[0.1em] uppercase">Đăng nhập</Link>
            )}
          </div>
        </nav>
      )}
    </>
  )
}

export default MocSiteHeader
