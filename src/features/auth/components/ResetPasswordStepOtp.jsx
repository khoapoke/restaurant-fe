import { useState, useEffect, useCallback } from 'react'
import { KeyRound, Lock, Eye, EyeOff, RotateCw, Clock, ArrowLeft, Check } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { forgotPasswordApi, resetPasswordApi } from '../services/authService'

const OTP_EXPIRY_SECONDS = 300 // 5 phút

export const ResetPasswordStepOtp = ({ email, onSuccess, onChangeEmail, initialNotice }) => {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState(initialNotice || '')
  const [fieldErrors, setFieldErrors] = useState({})

  // Countdown timer 5 phút
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const handleResendOtp = useCallback(async () => {
    setIsResending(true)
    setErrorMessage('')
    setFieldErrors({})
    try {
      const res = await forgotPasswordApi({ email })
      setTimeLeft(OTP_EXPIRY_SECONDS)
      setSuccessNotice(res.data?.message || 'Mã OTP mới đã được gửi lại vào email của bạn.')
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.')
    } finally {
      setIsResending(false)
    }
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    const errors = {}
    if (!otp.trim()) {
      errors.otp = 'Vui lòng nhập mã OTP 6 chữ số'
    } else if (otp.trim().length !== 6) {
      errors.otp = 'Mã OTP phải gồm đúng 6 chữ số'
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu mới'
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự'
    }

    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Mật khẩu xác nhận không khớp'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await resetPasswordApi({
        email,
        otp: otp.trim(),
        password,
        passwordConfirmation,
      })
      onSuccess()
    } catch (err) {
      const resData = err.response?.data
      if (err.response?.status === 400) {
        setErrorMessage(resData?.message || 'Mã OTP không chính xác hoặc đã hết hiệu lực.')
      } else if (err.response?.status === 422 && resData?.errors) {
        setFieldErrors(resData.errors)
        setErrorMessage('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.')
      } else {
        setErrorMessage(resData?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isExpired = timeLeft === 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-text-main">Xác thực OTP & Mật khẩu mới</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Mã xác thực đã được gửi tới{' '}
          <span className="font-semibold text-text-main">{email}</span>.{' '}
          <button
            type="button"
            onClick={onChangeEmail}
            className="text-brand-primary hover:underline font-medium cursor-pointer"
          >
            Đổi email
          </button>
        </p>
      </div>

      {successNotice && (
        <Alert type="success" message={successNotice} onClose={() => setSuccessNotice('')} />
      )}
      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* OTP Field with Countdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-text-body">Mã OTP (6 chữ số)</label>
          <div
            className={`flex items-center gap-1 font-mono font-bold ${
              isExpired ? 'text-status-error' : 'text-brand-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isExpired ? 'Đã hết hạn' : formatTime(timeLeft)}</span>
          </div>
        </div>

        <Input
          placeholder="Ví dụ: 849201"
          value={otp}
          maxLength={6}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ''))
            if (fieldErrors.otp) setFieldErrors((prev) => ({ ...prev, otp: null }))
          }}
          icon={KeyRound}
          error={fieldErrors.otp}
          className="font-mono text-center tracking-widest text-base font-bold"
          required
          disabled={isSubmitting}
        />

        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || (!isExpired && timeLeft > 240)}
            className="text-xs text-brand-primary hover:text-brand-hover disabled:text-text-dim flex items-center gap-1 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>Gửi lại mã OTP</span>
          </button>
        </div>
      </div>

      {/* New Password */}
      <Input
        label="Mật khẩu mới (tối thiểu 6 ký tự)"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }))
        }}
        icon={Lock}
        error={fieldErrors.password}
        required
        disabled={isSubmitting}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-muted hover:text-text-main p-1 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Confirm Password */}
      <Input
        label="Xác nhận mật khẩu mới"
        type={showConfirm ? 'text' : 'password'}
        placeholder="••••••••"
        value={passwordConfirmation}
        onChange={(e) => {
          setPasswordConfirmation(e.target.value)
          if (fieldErrors.passwordConfirmation) {
            setFieldErrors((prev) => ({ ...prev, passwordConfirmation: null }))
          }
        }}
        icon={Lock}
        error={fieldErrors.passwordConfirmation}
        required
        disabled={isSubmitting}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="text-text-muted hover:text-text-main p-1 cursor-pointer"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        disabled={isExpired}
        icon={Check}
        className="w-full mt-2"
      >
        Đặt lại mật khẩu
      </Button>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onChangeEmail}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại bước nhập Email</span>
        </button>
      </div>
    </form>
  )
}

export default ResetPasswordStepOtp

