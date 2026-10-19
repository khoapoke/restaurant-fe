import { UtensilsCrossed, Sparkles, ShieldCheck, Clock } from 'lucide-react'
import LoginForm from '../components/LoginForm'

export const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#0a0d14] text-gray-100">
      {/* Cột trái: Brand Banner & Visual (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-amber-950/40 via-gray-950 to-[#0a0d14] border-r border-gray-800/60 overflow-hidden">
        {/* Glow hiệu ứng nền */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">LUMIÈRE</h1>
            <p className="text-[11px] tracking-widest uppercase text-amber-400 font-medium">Fine Dining & Bar</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trải nghiệm ẩm thực chuẩn sao</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Thưởng thức nghệ thuật ẩm thực tinh tế mỗi ngày.
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed">
            Hệ thống đặt bàn trực tuyến, gọi món thông minh tự động gợi ý theo thời tiết và thanh toán mã QR tiện lợi.
          </p>

          {/* Badges điểm nhấn */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/60">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Bảo mật tài khoản</h4>
                <p className="text-[11px] text-gray-500">Xác thực mã hóa an toàn</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Phục vụ 24/7</h4>
                <p className="text-[11px] text-gray-500">Đặt bàn & giao món tức thì</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Lumière Restaurant. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Logo hiển thị trên mobile */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wider">LUMIÈRE</h1>
              <p className="text-[10px] tracking-widest uppercase text-amber-400 font-medium">Fine Dining & Bar</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Chào mừng trở lại!
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Đăng nhập để tiếp tục trải nghiệm dịch vụ của nhà hàng.
            </p>
          </div>

          {/* Form component */}
          <div className="bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-800/80 shadow-2xl backdrop-blur-xl">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
