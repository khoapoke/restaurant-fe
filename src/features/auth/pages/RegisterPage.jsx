import { UtensilsCrossed, Sparkles, Award, HeartHandshake } from 'lucide-react'
import RegisterForm from '../components/RegisterForm'

export const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#0a0d14] text-gray-100">
      {/* Cột trái: Brand Visual (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 bg-gradient-to-br from-amber-950/40 via-gray-950 to-[#0a0d14] border-r border-gray-800/60 overflow-hidden">
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thành viên ưu đãi đặc quyền</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-snug">
            Gia nhập cộng đồng thực khách sành điệu cùng Lumière.
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed">
            Đăng ký để tích lũy điểm thưởng, nhận thực đơn gợi ý theo sở thích dị ứng cá nhân và ưu tiên giữ bàn vào khung giờ vàng.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Tặng voucher 15% cho đơn đầu tiên sau khi đăng ký</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Ghi nhớ sở thích ăn kiêng và cảnh báo chất gây dị ứng</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Lumière Restaurant. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          {/* Logo hiển thị trên mobile */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
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
              Đăng ký tài khoản
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Điền thông tin bên dưới để trải nghiệm dịch vụ nhà hàng trọn vẹn nhất.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-800/80 shadow-2xl backdrop-blur-xl">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
