import { useNavigate } from 'react-router-dom'
import { CheckCircle2, LogIn, ShieldCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'

export const ResetPasswordSuccessState = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 text-center py-4">
      <div className="w-16 h-16 rounded-2xl bg-status-success/10 border border-status-success/30 text-status-success flex items-center justify-center mx-auto shadow-lg shadow-status-success/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-text-main">
          Đặt lại mật khẩu thành công!
        </h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          Mật khẩu mới của bạn đã được cập nhật vào hệ thống. Mọi phiên đăng nhập cũ trên các thiết bị khác đã được thu hồi để đảm bảo bảo mật.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-surface-bg border border-border-subtle flex items-center gap-3 text-left max-w-sm mx-auto text-xs text-text-body">
        <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
        <p className="leading-relaxed">
          Tài khoản đã sẵn sàng. Hãy sử dụng mật khẩu vừa đặt lại để đăng nhập vào T-ResMK.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          icon={LogIn}
          onClick={() => navigate('/login')}
          className="w-full"
        >
          Đăng nhập ngay
        </Button>
      </div>
    </div>
  )
}

export default ResetPasswordSuccessState

