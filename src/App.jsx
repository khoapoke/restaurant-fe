import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider, useCart } from './contexts/CartContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CustomerProfilePage from './features/customer/profile/pages/CustomerProfilePage'
import CustomerMenuPage from './features/customer/menu/pages/CustomerMenuPage'
import CustomerCartPage from './features/customer/cart/pages/CustomerCartPage'
import CustomerCheckoutPage from './features/customer/order/pages/CustomerCheckoutPage'
import CustomerOrdersPage from './features/customer/order/pages/CustomerOrdersPage'

// Admin Module Components & Layout
import AdminRoute from './features/admin/layout/routes/AdminRoute'
import AdminLayout from './features/admin/layout/layouts/AdminLayout'
import AdminDashboardPage from './features/admin/dashboard/pages/AdminDashboardPage'
import AdminDishPage from './features/admin/dish/pages/AdminDishPage'
import AdminCategoryPage from './features/admin/dish/pages/AdminCategoryPage'
import AdminOrdersPage from './features/admin/order/pages/AdminOrdersPage'
import AdminPaymentsPage from './features/admin/order/pages/AdminPaymentsPage'
import AdminTablesPage from './features/admin/table/pages/AdminTablesPage'
import AdminReservationsPage from './features/admin/table/pages/AdminReservationsPage'
import AdminPlaceholderPage from './features/admin/layout/pages/AdminPlaceholderPage'

import Button from './components/ui/Button'
import {
  UtensilsCrossed,
  LogOut,
  Shield,
  User,
  ArrowRight,
  Menu as MenuIcon,
  ShoppingBag,
  Package,
} from 'lucide-react'

// Trang chủ Customer
const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()

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
            {isAuthenticated && (
              <Link
                to="/orders"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Đơn hàng</span>
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 transition-colors flex items-center gap-1.5 ml-2"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Trang Quản trị</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/menu" className="md:hidden">
            <Button variant="ghost" size="sm" icon={MenuIcon}>
              Menu
            </Button>
          </Link>

          {/* Cart Badge Button */}
          {isAuthenticated && (
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px] flex items-center justify-center shadow-md">
                  {totalQuantity}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-200">
                  {user?.userProfile?.fullName || user?.username}
                </p>
                <p className="text-[10px] text-amber-400 uppercase font-mono">{user?.role}</p>
              </div>

              {user?.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="primary" size="sm" icon={Shield}>
                    Quản trị
                  </Button>
                </Link>
              )}

              <Link to="/orders">
                <Button variant="outline" size="sm" icon={Package}>
                  Đơn mua
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" icon={User}>
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
          Module Auth, Hồ sơ khách hàng, Thực đơn, Giỏ hàng, Đơn hàng & Phân hệ Quản trị Admin đã sẵn sàng phục vụ.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Link to="/menu">
            <Button variant="primary" size="lg" icon={UtensilsCrossed}>
              Khám phá Thực đơn & Món ngon
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' ? (
                <Link to="/admin">
                  <Button variant="outline" size="lg" icon={Shield}>
                    Vào Bảng điều khiển Quản trị
                  </Button>
                </Link>
              ) : (
                <Link to="/orders">
                  <Button variant="outline" size="lg" icon={Package}>
                    Lịch sử Đơn hàng của bạn
                  </Button>
                </Link>
              )}
            </>
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Phân hệ Khách hàng (Customer) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
            <Route path="/menu" element={<CustomerMenuPage />} />
            <Route path="/cart" element={<CustomerCartPage />} />
            <Route path="/checkout" element={<CustomerCheckoutPage />} />
            <Route path="/orders" element={<CustomerOrdersPage />} />

            {/* Phân hệ Quản trị (Admin) — Được bảo vệ bởi AdminRoute & AdminLayout */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="dishes" element={<AdminDishPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="tables" element={<AdminTablesPage />} />
              <Route path="reservations" element={<AdminReservationsPage />} />
              <Route
                path="accounts"
                element={
                  <AdminPlaceholderPage
                    title="Quản lý Người dùng"
                    stage="Giai đoạn 5"
                    description="Kiểm soát danh sách tài khoản người dùng, phân quyền và khóa tài khoản vi phạm."
                    plannedFeatures={[
                      'Danh sách tài khoản khách hàng & quản trị viên',
                      'Tìm kiếm theo username, email, số điện thoại',
                      'Lọc theo trạng thái Hoạt động / Đã khóa',
                      'Khóa & Mở khóa tài khoản',
                    ]}
                  />
                }
              />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
