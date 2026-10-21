import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ChefHat, CalendarDays, CreditCard, LogOut, Monitor, ShoppingBag, TableProperties, Users } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { Role } from '../../auth/constants'
import MocBrand from '../../../components/brand/MocBrand'

const NAV_ITEMS = [
  { to: '/admin', end: true, label: 'Tổng quan', icon: BarChart3 },
  { to: '/admin/menu', label: 'Thực đơn', icon: BookOpen },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/reservations', label: 'Đặt chỗ', icon: CalendarDays },
  { to: '/admin/tables', label: 'Bàn ăn', icon: TableProperties },
  { to: '/admin/accounts', label: 'Tài khoản', icon: Users },
  { to: '/admin/payments', label: 'Thanh toán', icon: CreditCard },
  { to: '/staff/floor', label: 'Mở POS', icon: Monitor },
  { to: '/staff/kitchen', label: 'Màn hình bếp', icon: ChefHat },
]

export const AdminShell = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role, user, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
    else if (role !== Role.ADMIN) navigate('/', { replace: true })
  }, [isAuthenticated, role, navigate])

  if (!isAuthenticated || role !== Role.ADMIN) return null

  return (
    <div className="min-h-screen bg-[#f3eee6] text-[#211b18] lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="moc-inverse bg-[#251b19] text-[#fff8ed] lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between gap-5 px-5 py-5 lg:block lg:px-7 lg:py-8">
          <div><MocBrand light /><p className="mt-2 text-xs tracking-[0.16em] text-[#c8bbb4] uppercase">Mộc Operations</p></div>
          <button type="button" onClick={async () => { await logout(); navigate('/') }} className="lg:hidden p-2 text-[#eadfd8]" aria-label="Đăng xuất"><LogOut className="h-5 w-5" /></button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-5 lg:pb-0" aria-label="Quản trị">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `shrink-0 flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-colors ${isActive ? 'border-[#d8a8b4] bg-white/10 text-white' : 'border-transparent text-[#c8bbb4] hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-[18px] w-[18px]" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block absolute inset-x-0 bottom-0 border-t border-white/10 p-6">
          <p className="text-sm text-[#fff8ed]">{user?.userProfile?.fullName || user?.username || 'Quản trị viên'}</p>
          <button type="button" onClick={async () => { await logout(); navigate('/') }} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 border border-white/20 text-xs text-[#eadfd8] hover:bg-white/5"><LogOut className="h-4 w-4" /> Đăng xuất</button>
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-8 xl:p-12"><Outlet /></main>
    </div>
  )
}

export default AdminShell
