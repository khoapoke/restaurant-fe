import { BarChart3, BookOpen, LogOut, ShoppingBag, TableProperties, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import MocBrand from '../../../components/brand/MocBrand'
import Button from '../../../components/ui/Button'

const modules = [
  { label: 'Thực đơn', description: 'Danh mục, món ăn và trạng thái còn bán', icon: BookOpen },
  { label: 'Đơn hàng', description: 'Theo dõi đơn online và tiến độ phục vụ', icon: ShoppingBag },
  { label: 'Bàn & đặt chỗ', description: 'Sơ đồ bàn, lịch đặt và công suất', icon: TableProperties },
  { label: 'Khách hàng', description: 'Tài khoản, hồ sơ và lịch sử trải nghiệm', icon: Users },
]

export const AdminDashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr] bg-[#f3eee6]">
      <aside className="moc-inverse p-7 lg:min-h-screen flex flex-col bg-[#251b19] text-[#f7eee7]">
        <MocBrand light />
        <span className="mt-3 text-[9px] tracking-[0.18em] uppercase text-[#b9aaa3]">Mộc Operations</span>
        <nav className="mt-12 flex flex-col gap-2">
          <button type="button" className="px-4 py-3.5 text-left border-l-2 border-[#d8a8b4] bg-white/7 text-sm">Tổng quan hôm nay</button>
          {modules.map(({ label }) => <button key={label} type="button" className="px-4 py-3.5 text-left border-l-2 border-transparent text-[#bdb1ab] hover:text-white hover:bg-white/5 text-sm transition-colors">{label}</button>)}
        </nav>
        <div className="mt-auto pt-8">
          <p className="text-xs text-[#bdb1ab]">{user?.username || 'Quản trị viên'}</p>
          <button type="button" onClick={logout} className="mt-3 w-full min-h-10 px-4 flex items-center justify-center gap-2 border border-white/20 text-xs text-[#e8ddd7] hover:bg-white/5"><LogOut className="w-4 h-4" /> Đăng xuất</button>
        </div>
      </aside>

      <main className="min-w-0 p-6 sm:p-10 lg:p-14">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div><span className="moc-eyebrow">MỘC OPERATIONS</span><h1 className="mt-3 moc-serif text-4xl font-medium tracking-[-0.03em]">Tổng quan hôm nay</h1><p className="mt-2 text-sm text-[#766e68]">Các module quản trị sẽ được kết nối dần với API Laravel hiện có.</p></div>
          <Link to="/"><Button variant="outline" size="sm">Về trang nhà hàng</Button></Link>
        </header>

        <section className="mt-9 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[['Đơn hôm nay', '—'], ['Bàn đang phục vụ', '—'], ['Đặt chỗ sắp tới', '—'], ['Doanh thu', '—']].map(([label, value]) => (
            <article key={label} className="p-6 bg-[#fffdf8] border border-[var(--moc-line)]"><span className="text-[10px] tracking-[0.12em] uppercase text-[#766e68]">{label}</span><strong className="block mt-4 moc-serif text-4xl font-medium text-[#6f1d32]">{value}</strong><small className="text-[#766e68]">Chờ dữ liệu API</small></article>
          ))}
        </section>

        <section className="mt-5 p-6 sm:p-8 bg-[#fffdf8] border border-[var(--moc-line)]">
          <div className="flex items-center justify-between gap-4"><div><span className="moc-eyebrow">PHÂN HỆ</span><h2 className="mt-2 moc-serif text-2xl font-medium">Không gian vận hành</h2></div><BarChart3 className="w-6 h-6 text-[#6f1d32]" /></div>
          <div className="mt-7 grid md:grid-cols-2 gap-3">
            {modules.map(({ label, description, icon: Icon }) => (
              <article key={label} className="p-5 flex gap-4 border border-[var(--moc-line)] hover:border-[#6f1d32]/45 transition-colors"><span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-[#6f1d32]/8 text-[#6f1d32]"><Icon className="w-5 h-5" /></span><div><h3 className="moc-serif text-lg font-medium">{label}</h3><p className="mt-1 text-xs leading-5 text-[#766e68]">{description}</p></div></article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
