import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CustomerProfilePage from './features/customer/profile/pages/CustomerProfilePage'
import CustomerMenuPage from './features/customer/menu/pages/CustomerMenuPage'
import Button from './components/ui/Button'
import { UtensilsCrossed, LogOut, Shield, User, ArrowRight, Menu as MenuIcon } from 'lucide-react'

// Placeholder cho Customer Home Page
const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 bg-gray-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-wider text-white">LUMIÈRE</span>
              <span className="text-[10px] block text-amber-400 tracking-widest uppercase">Restaurant</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/menu"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
              <span>Thực đơn</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/menu" className="md:hidden">
            <Button variant="ghost" size="sm" icon={MenuIcon}>
              Menu
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-200">
                  {user?.userProfile?.fullName || user?.username}
                </p>
                <p className="text-[10px] text-amber-400 uppercase font-mono">{user?.role}</p>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm" icon={User}>
                  Hồ sơ
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-12 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
          <UtensilsCrossed className="w-4 h-4" />
          <span>Hệ thống nhà hàng trực tuyến</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Chào mừng đến với Lumière
        </h1>

        <p className="text-gray-400 max-w-xl text-sm sm:text-base mb-8">
          Module Auth, Hồ sơ khách hàng & Thực đơn trực tuyến (gợi ý thời tiết, lọc dị ứng) đã sẵn sàng.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Link to="/menu">
            <Button variant="primary" size="lg" icon={UtensilsCrossed}>
              Khám phá Thực đơn & Món ngon
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/profile">
              <Button variant="outline" size="lg" icon={User}>
                Quản lý Hồ sơ & Dị ứng
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="secondary" size="lg" icon={ArrowRight}>
                Đăng nhập tài khoản
              </Button>
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-6 text-left space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Phiên đăng nhập hiện tại
              </h3>
              <Link to="/profile">
                <span className="text-xs text-amber-400 hover:text-amber-300 underline font-medium">
                  Chi tiết
                </span>
              </Link>
            </div>
            <div className="text-xs space-y-1 text-gray-300">
              <p><span className="text-gray-500">Tài khoản:</span> {user?.username}</p>
              <p><span className="text-gray-500">Họ và tên:</span> {user?.userProfile?.fullName || 'Chưa cập nhật'}</p>
              <p><span className="text-gray-500">Vai trò:</span> <span className="text-amber-400 font-mono font-bold">{user?.role}</span></p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Placeholder cho Admin Dashboard
const AdminDashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-white">LUMIÈRE ADMIN</span>
            <span className="text-[10px] block text-gray-500 tracking-wider">Trang quản trị hệ thống</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-200">{user?.username}</p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400">
              {user?.role}
            </span>
          </div>
          <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Bảng điều khiển Quản trị viên</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Bạn đã đăng nhập thành công bằng tài khoản Admin. Sẵn sàng kết nối với các module: Quản lý món ăn, Đơn hàng, Bàn ăn và Báo cáo.
          </p>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<CustomerProfilePage />} />
          <Route path="/menu" element={<CustomerMenuPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
