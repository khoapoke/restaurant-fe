import { ChefHat, Clock3, LayoutDashboard, LayoutGrid, LogOut, RefreshCw, UserRound } from 'lucide-react'
import StaffSupportLink from '../../../communications/StaffSupportLink'
import { NavLink, useNavigate } from 'react-router-dom'
import MocBrand from '../../../../components/brand/MocBrand'
import { useAuth } from '../../../../contexts/AuthContext'

export const PosHeader = ({ syncedAt, onRefresh, refreshing, title = 'Điều hành tại bàn', subtitle = 'POS · Ca phục vụ hiện tại', liveCount = 0, connection = null }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--moc-line)] bg-[#fffdf8]/95 backdrop-blur-xl">
      <div className="max-w-[1500px] mx-auto min-h-[82px] px-5 lg:px-8 flex items-center justify-between gap-5">
        <div className="flex items-center gap-6">
          <MocBrand />
          <div className="hidden md:block h-8 w-px bg-[var(--moc-line)]" />
          <div className="hidden md:block">
            <p className="text-base font-semibold text-[#211b18]">{title}</p>
            <p className="mt-1 text-sm text-[#766e68]">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center border border-[var(--moc-line)] bg-white/60 p-1">
            <NavLink to="/staff/floor" className={({ isActive }) => `h-9 px-3 inline-flex items-center gap-2 text-sm font-semibold ${isActive ? 'bg-[#6f1d32] text-white moc-inverse' : 'text-[#766e68] hover:text-[#6f1d32]'}`}>
              <LayoutGrid className="w-4 h-4" /> Bàn
              {liveCount > 0 && <span key={liveCount} className="moc-pop grid h-5 min-w-5 place-items-center rounded-full bg-[#e8c48a] px-1 text-xs font-bold text-[#211b18]" aria-label={`${liveCount} yêu cầu mới`}>{liveCount}</span>}
            </NavLink>
            <NavLink to="/staff/kitchen" className={({ isActive }) => `h-9 px-3 inline-flex items-center gap-2 text-sm font-semibold ${isActive ? 'bg-[#6f1d32] text-white moc-inverse' : 'text-[#766e68] hover:text-[#6f1d32]'}`}>
              <ChefHat className="w-4 h-4" /> Bếp
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" end className="h-9 px-3 inline-flex items-center gap-2 text-sm font-semibold text-[#766e68] hover:text-[#6f1d32]">
                <LayoutDashboard className="w-4 h-4" /> Quản trị
              </NavLink>
            )}
          </nav>
          <div className="hidden lg:flex items-center gap-2 text-sm text-[#766e68]">
            <Clock3 className="w-4 h-4" />
            {['reconnecting', 'offline'].includes(connection) ? <span className="font-semibold text-[#8a1c1c]">Đang kết nối lại...</span> : syncedAt ? `Đồng bộ ${new Date(syncedAt).toLocaleTimeString('vi-VN')}` : 'Chưa đồng bộ'}
          </div>
          <StaffSupportLink key={user?.accountId} />
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="h-10 px-3 inline-flex items-center gap-2 border border-[var(--moc-line)] text-sm font-semibold hover:border-[#6f1d32]/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[var(--moc-line)]">
            <UserRound className="w-4 h-4 text-[#6f1d32]" />
            <span className="text-sm font-semibold">{user?.userProfile?.fullName || user?.username}</span>
          </div>
          <button type="button" onClick={handleLogout} className="w-10 h-10 grid place-items-center hover:bg-[#6f1d32]/7" aria-label="Đăng xuất">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <nav className={`md:hidden grid border-t border-[var(--moc-line)] ${user?.role === 'ADMIN' ? 'grid-cols-3' : 'grid-cols-2'}`} aria-label="Điều hướng vận hành">
        {[
          { to: '/staff/floor', label: 'Sơ đồ bàn', icon: LayoutGrid },
          { to: '/staff/kitchen', label: 'Bếp', icon: ChefHat },
          ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Quản trị', icon: LayoutDashboard }] : []),
        ].map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold ${isActive ? 'moc-inverse bg-[#6f1d32] text-white' : 'text-[#211b18]'}`}>
            <Icon className="w-4 h-4" /> {label}
            {to === '/staff/floor' && liveCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#e8c48a] px-1 text-xs font-bold text-[#211b18]">{liveCount}</span>}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default PosHeader
