import { useState } from 'react'
import { UtensilsCrossed, ShieldCheck, KeyRound, Mail, CheckCircle2 } from 'lucide-react'
import ForgotPasswordStepEmail from '../components/ForgotPasswordStepEmail'
import ResetPasswordStepOtp from '../components/ResetPasswordStepOtp'
import ResetPasswordSuccessState from '../components/ResetPasswordSuccessState'

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('')
  const [initialNotice, setInitialNotice] = useState('')

  const handleEmailSuccess = (notice) => {
    setInitialNotice(notice)
    setStep(2)
  }

  const handleResetSuccess = () => {
    setStep(3)
  }

  return (
    <div className="min-h-screen w-full flex bg-surface-bg text-text-main font-sans">
      {/* Cột trái: Brand Visual Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-brand-primary/10 via-surface-card to-surface-bg border-r border-border-subtle overflow-hidden">
        {/* Glow hiệu ứng nền */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-active/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Thương hiệu T-ResMK */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-active flex items-center justify-center text-surface-bg font-bold shadow-lg shadow-brand-primary/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-text-main">T-ResMK</h1>
            <p className="text-[11px] tracking-widest uppercase text-brand-primary font-semibold">Fine Dining & Bar</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Khôi phục tài khoản an toàn</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main leading-tight">
            Bảo mật tối đa, lấy lại quyền truy cập trong tích tắc.
          </h2>

          <p className="text-sm text-text-muted leading-relaxed">
            Hệ thống xác thực mã OTP thời gian thực giúp bảo vệ tài khoản và thông tin ẩm thực riêng tư của bạn tại T-ResMK.
          </p>

          {/* Badges điểm nhấn */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-text-main">Mã OTP bảo mật</h4>
                <p className="text-[11px] text-text-muted">Hiệu lực trong 5 phút</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-text-main">Thu hồi phiên cũ</h4>
                <p className="text-[11px] text-text-muted">Ngăn chặn truy cập trái phép</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-text-dim">
          © {new Date().getFullYear()} T-ResMK Restaurant. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form đặt lại mật khẩu từng bước */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Logo hiển thị trên mobile */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-active flex items-center justify-center text-surface-bg font-bold shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-main tracking-wider">T-ResMK</h1>
              <p className="text-[10px] tracking-widest uppercase text-brand-primary font-semibold">Fine Dining & Bar</p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-primary font-bold' : 'text-text-dim'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step > 1 ? 'bg-brand-primary text-surface-bg' : step === 1 ? 'border-2 border-brand-primary text-brand-primary' : 'border border-border-subtle text-text-dim'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className="hidden sm:inline">Nhập Email</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-brand-primary' : 'bg-border-subtle'}`} />

            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-primary font-bold' : 'text-text-dim'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step > 2 ? 'bg-brand-primary text-surface-bg' : step === 2 ? 'border-2 border-brand-primary text-brand-primary' : 'border border-border-subtle text-text-dim'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className="hidden sm:inline">Nhập OTP</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-brand-primary' : 'bg-border-subtle'}`} />

            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-primary font-bold' : 'text-text-dim'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 3 ? 'bg-brand-primary text-surface-bg' : 'border border-border-subtle text-text-dim'
              }`}>
                3
              </div>
              <span className="hidden sm:inline">Hoàn tất</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-2xl backdrop-blur-xl">
            {step === 1 && (
              <ForgotPasswordStepEmail
                email={email}
                setEmail={setEmail}
                onSuccess={handleEmailSuccess}
              />
            )}

            {step === 2 && (
              <ResetPasswordStepOtp
                email={email}
                initialNotice={initialNotice}
                onSuccess={handleResetSuccess}
                onChangeEmail={() => setStep(1)}
              />
            )}

            {step === 3 && <ResetPasswordSuccessState />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

