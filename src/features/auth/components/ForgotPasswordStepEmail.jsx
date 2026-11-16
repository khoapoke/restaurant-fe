import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { forgotPasswordApi } from '../services/authService'

export const ForgotPasswordStepEmail = ({ email, setEmail, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFieldError('Vui lòng nhập địa chỉ email của bạn')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setFieldError('Địa chỉ email không đúng định dạng')
      return
    }

    setLoading(true)
    try {
      const res = await forgotPasswordApi({ email: trimmedEmail })
      const successMsg =
        res.data?.message || 'Mã xác thực OTP đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.'
      onSuccess(successMsg)
    } catch (err) {
      const resData = err.response?.data
      if (err.response?.status === 404) {
        setError('Địa chỉ email này chưa được đăng ký trong hệ thống T-ResMK.')
      } else if (err.response?.status === 403) {
        setError('Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ nhà hàng để được hỗ trợ.')
      } else if (err.response?.status === 422 && resData?.errors?.email) {
        setFieldError(resData.errors.email[0])
      } else {
        setError(resData?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-text-main">Quên mật khẩu?</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Nhập địa chỉ email liên kết với tài khoản T-ResMK của bạn. Chúng tôi sẽ gửi mã OTP xác thực có hiệu lực trong 5 phút.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <Input
        label="Địa chỉ Email"
        type="email"
        placeholder="example@gmail.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (fieldError) setFieldError('')
          if (error) setError('')
        }}
        icon={Mail}
        error={fieldError}
        required
        disabled={loading}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        icon={Send}
        className="w-full"
      >
        Gửi mã xác thực OTP
      </Button>

      <div className="pt-2 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang Đăng nhập</span>
        </Link>
      </div>
    </form>
  )
}

export default ForgotPasswordStepEmail

