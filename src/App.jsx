import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import RequireRole from './components/navigation/RequireRole'
import { Role } from './features/auth/constants'
import HomePage from './features/home/pages/HomePage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CustomerMenuPage from './features/customer/menu/pages/CustomerMenuPage'

const CustomerProfilePage = lazy(() => import('./features/customer/profile/pages/CustomerProfilePage'))
const CustomerCartPage = lazy(() => import('./features/customer/cart/pages/CustomerCartPage'))
const CustomerCheckoutPage = lazy(() => import('./features/customer/order/pages/CustomerCheckoutPage'))
const CustomerOrdersPage = lazy(() => import('./features/customer/order/pages/CustomerOrdersPage'))
const CustomerReservationsPage = lazy(() => import('./features/customer/reservation/pages/CustomerReservationsPage'))
const AdminShell = lazy(() => import('./features/admin/components/AdminShell'))
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'))
const AdminAccountsPage = lazy(() => import('./features/admin/pages/AdminAccountsPage'))
const AdminMenuPage = lazy(() => import('./features/admin/pages/AdminMenuPage'))
const AdminOrdersPage = lazy(() => import('./features/admin/pages/AdminOrdersPage'))
const AdminReservationsPage = lazy(() => import('./features/admin/pages/AdminReservationsPage'))
const AdminTablesPage = lazy(() => import('./features/admin/pages/AdminTablesPage'))
const AdminPaymentsPage = lazy(() => import('./features/admin/pages/AdminPaymentsPage'))
const AdminApprovalsPage = lazy(() => import('./features/admin/pages/AdminApprovalsPage'))
const PosFloorPage = lazy(() => import('./features/staff/pos/pages/PosFloorPage'))
const PosSessionPage = lazy(() => import('./features/staff/pos/pages/PosSessionPage'))
const KitchenBoardPage = lazy(() => import('./features/staff/pos/pages/KitchenBoardPage'))
const LiveDiningPage = lazy(() => import('./features/dine/pages/LiveDiningPage'))

const CUSTOMER = [Role.CUSTOMER]
const OPERATIONS = [Role.STAFF, Role.ADMIN]

const PageFallback = () => (
  <div className="min-h-screen grid place-items-center bg-[var(--moc-ivory)]" role="status" aria-live="polite">
    <div className="text-center">
      <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-[#6f1d32]/20 border-t-[#6f1d32]" />
      <p className="mt-4 text-sm text-[#625a55]">Đang chuẩn bị không gian Mộc...</p>
    </div>
  </div>
)

const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>

function App() {
  return (
    <div className="moc-theme">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/menu" element={<CustomerMenuPage />} />
                <Route path="/dine/:tableToken" element={<LiveDiningPage />} />
                <Route path="/profile" element={guard(CUSTOMER, <CustomerProfilePage />)} />
                <Route path="/cart" element={guard(CUSTOMER, <CustomerCartPage />)} />
                <Route path="/checkout" element={guard(CUSTOMER, <CustomerCheckoutPage />)} />
                <Route path="/orders" element={guard(CUSTOMER, <CustomerOrdersPage />)} />
                <Route path="/reservations" element={guard(CUSTOMER, <CustomerReservationsPage />)} />
                <Route path="/admin" element={guard([Role.ADMIN], <AdminShell />)}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="accounts" element={<AdminAccountsPage />} />
                  <Route path="menu" element={<AdminMenuPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="reservations" element={<AdminReservationsPage />} />
                  <Route path="tables" element={<AdminTablesPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="approvals" element={<AdminApprovalsPage />} />
                </Route>
                <Route path="/staff" element={<Navigate to="/staff/floor" replace />} />
                <Route path="/staff/floor" element={guard(OPERATIONS, <PosFloorPage />)} />
                <Route path="/staff/sessions/:sessionId" element={guard(OPERATIONS, <PosSessionPage />)} />
                <Route path="/staff/kitchen" element={guard(OPERATIONS, <KitchenBoardPage />)} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  )
}

export default App
