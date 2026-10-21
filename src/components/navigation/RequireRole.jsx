import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { HOME_PATH_BY_ROLE } from '../../features/auth/constants'

/**
 * Chặn route theo vai trò trước khi trang con gọi API.
 * - Chưa đăng nhập: chuyển tới /login và nhớ trang đích.
 * - Sai vai trò: đưa về trang chủ đúng của vai trò hiện tại.
 */
export const RequireRole = ({ roles, children }) => {
  const location = useLocation()
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (!roles.includes(role)) {
    return <Navigate to={HOME_PATH_BY_ROLE[role] || '/'} replace />
  }

  return children
}

export default RequireRole
