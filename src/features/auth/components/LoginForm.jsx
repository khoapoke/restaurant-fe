import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { HOME_PATH_BY_ROLE, Role } from '../constants'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { apiErrorMessage, translateApiMessage } from '../../../lib/apiError'

export const LoginForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, authNotice, clearAuthNotice } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Xóa lỗi của trường khi người dùng gõ lại
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (errorMessage) setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    // Client-side quick check
    const errors = {}
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập'
    }
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      })

      clearAuthNotice()
      const role = result.data?.account?.role
      const from = location.state?.from
      const allowedPrefix = { [Role.ADMIN]: ['/admin', '/staff'], [Role.STAFF]: ['/staff'], [Role.CUSTOMER]: ['/profile', '/cart', '/checkout', '/orders', '/reservations', '/menu'] }[role] || []
      if (from && allowedPrefix.some((prefix) => from.startsWith(prefix))) {
        navigate(from, { replace: true })
      } else {
        navigate(HOME_PATH_BY_ROLE[role] || '/', { replace: true })
      }
    } catch (err) {
      const responseData = err.response?.data
      if (err.response?.status === 401) {
        setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác.')
      } else if (err.response?.status === 403) {
        setErrorMessage(translateApiMessage(responseData?.message) || 'Tài khoản của bạn đã bị khóa.')
      } else if (err.response?.status === 429) {
        setErrorMessage('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi một phút rồi thử lại.')
      } else if (err.response?.status === 422 && responseData?.errors) {
        setFieldErrors(responseData.errors)
        setErrorMessage('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
      } else {
        setErrorMessage(apiErrorMessage(err, 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {authNotice && !errorMessage && (
        <Alert type="warning" message={authNotice} onClose={clearAuthNotice} />
      )}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <Input
        label="Tên đăng nhập"
        name="username"
        placeholder="Nhập tên đăng nhập của bạn"
        value={formData.username}
        onChange={handleChange}
        icon={User}
        error={fieldErrors.username}
        required
        disabled={loading}
      />

      <Input
        label="Mật khẩu"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        icon={Lock}
        error={fieldErrors.password}
        required
        disabled={loading}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1 cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs text-gray-400">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <span className="text-gray-500">Mặc định 30 ngày</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        className="w-full mt-2"
      >
        Đăng nhập
      </Button>

      <p className="text-center text-xs text-gray-400 mt-2">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
        >
          Đăng ký tài khoản mới
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
