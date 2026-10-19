import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'

export const RegisterForm = () => {
  const navigate = useNavigate()
  const { register, loading } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    address: '',
    password: '',
    passwordConfirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (errorMessage) setErrorMessage('')
  }

  const validate = () => {
    const errors = {}
    if (!formData.username.trim()) errors.username = 'Tên đăng nhập không được để trống'
    if (!formData.fullName.trim()) errors.fullName = 'Họ và tên không được để trống'
    if (!formData.email.trim()) errors.email = 'Email không được để trống'
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống'
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại không đúng định dạng (10 chữ số)'
    }
    if (!formData.password) {
      errors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải từ 6 ký tự trở lên'
    }
    if (formData.password !== formData.passwordConfirmation) {
      errors.passwordConfirmation = 'Mật khẩu xác nhận không khớp'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    try {
      await register({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        birthDate: formData.birthDate || null,
        address: formData.address.trim() || null,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      })

      navigate('/')
    } catch (err) {
      const responseData = err.response?.data
      if (err.response?.status === 422 && responseData?.errors) {
        setFieldErrors(responseData.errors)
        setErrorMessage(responseData.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
      } else {
        setErrorMessage(
          responseData?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.'
        )
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Tên đăng nhập"
          name="username"
          placeholder="Ví dụ: nguyen_an"
          value={formData.username}
          onChange={handleChange}
          icon={User}
          error={fieldErrors.username}
          required
          disabled={loading}
        />

        <Input
          label="Họ và tên"
          name="fullName"
          placeholder="Ví dụ: Nguyễn Văn An"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
          error={fieldErrors.fullName}
          required
          disabled={loading}
        />

        <Input
          label="Địa chỉ Email"
          name="email"
          type="email"
          placeholder="example@domain.com"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={fieldErrors.email}
          required
          disabled={loading}
        />

        <Input
          label="Số điện thoại"
          name="phoneNumber"
          placeholder="0987654321"
          value={formData.phoneNumber}
          onChange={handleChange}
          icon={Phone}
          error={fieldErrors.phoneNumber}
          required
          disabled={loading}
        />

        <Input
          label="Ngày sinh"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          icon={Calendar}
          error={fieldErrors.birthDate}
          disabled={loading}
        />

        <Input
          label="Địa chỉ giao hàng mặc định"
          name="address"
          placeholder="Số nhà, tên đường, quận/huyện..."
          value={formData.address}
          onChange={handleChange}
          icon={MapPin}
          error={fieldErrors.address}
          disabled={loading}
        />

        <Input
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Tối thiểu 6 ký tự"
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
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Input
          label="Xác nhận mật khẩu"
          name="passwordConfirmation"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu"
          value={formData.passwordConfirmation}
          onChange={handleChange}
          icon={Lock}
          error={fieldErrors.passwordConfirmation}
          required
          disabled={loading}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 cursor-pointer"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        className="w-full mt-2"
      >
        Tạo tài khoản
      </Button>

      <p className="text-center text-xs text-gray-400 mt-1">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
