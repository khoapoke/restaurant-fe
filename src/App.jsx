import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import HomePage from './features/home/pages/HomePage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CustomerProfilePage from './features/customer/profile/pages/CustomerProfilePage'
import CustomerMenuPage from './features/customer/menu/pages/CustomerMenuPage'
import CustomerCartPage from './features/customer/cart/pages/CustomerCartPage'
import CustomerCheckoutPage from './features/customer/order/pages/CustomerCheckoutPage'
import CustomerOrdersPage from './features/customer/order/pages/CustomerOrdersPage'
import AdminDashboard from './features/admin/pages/AdminDashboard'
import PosFloorPage from './features/staff/pos/pages/PosFloorPage'
import PosSessionPage from './features/staff/pos/pages/PosSessionPage'
import KitchenBoardPage from './features/staff/pos/pages/KitchenBoardPage'

function App() {
  return (
    <div className="moc-theme">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route path="/menu" element={<CustomerMenuPage />} />
              <Route path="/cart" element={<CustomerCartPage />} />
              <Route path="/checkout" element={<CustomerCheckoutPage />} />
              <Route path="/orders" element={<CustomerOrdersPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/staff/floor" element={<PosFloorPage />} />
              <Route path="/staff/sessions/:sessionId" element={<PosSessionPage />} />
              <Route path="/staff/kitchen" element={<KitchenBoardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  )
}

export default App
