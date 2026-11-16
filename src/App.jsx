import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CustomerProfilePage from './features/customer/profile/pages/CustomerProfilePage'
import CustomerMenuPage from './features/customer/menu/pages/CustomerMenuPage'
import DishDetailPage from './features/customer/menu/pages/DishDetailPage'
import CustomerCartPage from './features/customer/cart/pages/CustomerCartPage'
import CustomerCheckoutPage from './features/customer/order/pages/CustomerCheckoutPage'
import CustomerOrdersPage from './features/customer/order/pages/CustomerOrdersPage'
import CustomerReservationPage from './features/customer/reservation/pages/CustomerReservationPage'
import HomePage from './features/customer/Home/pages/HomePage'

// Admin Module Components & Layout (Code-split with React.lazy để tối ưu bundle)
import AdminRoute from './features/admin/layout/routes/AdminRoute'
import AdminLayout from './features/admin/layout/layouts/AdminLayout'

const AdminDashboardPage = lazy(() => import('./features/admin/dashboard/pages/AdminDashboardPage'))
const AdminDishPage = lazy(() => import('./features/admin/dish/pages/AdminDishPage'))
const AdminCategoryPage = lazy(() => import('./features/admin/dish/pages/AdminCategoryPage'))
const AdminOrdersPage = lazy(() => import('./features/admin/order/pages/AdminOrdersPage'))
const AdminPaymentsPage = lazy(() => import('./features/admin/order/pages/AdminPaymentsPage'))
const AdminTablesPage = lazy(() => import('./features/admin/table/pages/AdminTablesPage'))
const AdminReservationsPage = lazy(() => import('./features/admin/table/pages/AdminReservationsPage'))
const AdminAccountsPage = lazy(() => import('./features/admin/account/pages/AdminAccountsPage'))

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
            <Route path="/menu/:dishId" element={<DishDetailPage />} />
            <Route path="/cart" element={<CustomerCartPage />} />
            <Route path="/checkout" element={<CustomerCheckoutPage />} />
            <Route path="/orders" element={<CustomerOrdersPage />} />
            <Route path="/reservation" element={<CustomerReservationPage />} />
            <Route path="/reservations" element={<Navigate to="/reservation" replace />} />

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
              <Route path="accounts" element={<AdminAccountsPage />} />
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
