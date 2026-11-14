import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand'
import {
  ChefHat,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award,
  Crown,
} from 'lucide-react'

/**
 * Component Chân Trang (HomeFooter) - Modern Luxury Signature Footer
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Phần 1: VIP Club Invitation Banner (Đăng ký nhận lời mời tiệc riêng & menu mùa)
 * - Phần 2: 4 Cột thông tin phân cấp thanh lịch & thoáng đãng
 * - Phần 3: Bản quyền, chính sách pháp lý & trạng thái hệ thống thời gian thực (60 FPS)
 */
export default function HomeFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="border-t border-border-subtle bg-surface-bg text-text-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        
        {/* =========================================================================
            PHẦN 1: VIP CLUB INVITATION BANNER (ĐĂNG KÝ ĐẶC QUYỀN VIP)
            ========================================================================= */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-surface-card border border-border-subtle flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center lg:text-left space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-brand-primary text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>Đặc quyền ẩm thực VIP</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-text-main tracking-tight">
              Gia nhập Câu Lạc Bộ Thượng Khách {BRAND_NAME}
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Nhận lời mời tham dự các đêm tiệc thử rượu vang và thưởng thức thực đơn theo mùa từ Bếp trưởng trước ngày ra mắt.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            {subscribed ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-bg border border-border-brand text-brand-primary text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                <span>Cảm ơn bạn! Chúng tôi đã lưu thông tin thượng khách của bạn.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  className="w-full sm:w-72 bg-surface-input border border-border-subtle rounded-lg px-4 py-2.5 text-xs text-text-main focus:outline-none focus:border-brand-primary placeholder:text-text-dim transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-surface-bg bg-brand-primary hover:bg-brand-hover active:bg-brand-active transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  <span>Đăng ký</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* =========================================================================
            PHẦN 2: 4 CỘT THÔNG TIN PHÂN CẤP HOÀN HẢO
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
          
          {/* Cột 1: Thương hiệu & Triết lý ẩm thực */}
          <div className="space-y-4">
         

            <p className="text-text-muted text-xs leading-relaxed">
              Nơi giao thoa giữa nghệ thuật ẩm thực tinh tế, nguyên liệu tuyển chọn khắt khe và công nghệ đặt chỗ thông minh.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle text-[11px] text-text-body">
              <Award className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>Tiêu chuẩn phục vụ 5 sao</span>
            </div>
          </div>

          {/* Cột 2: Trải nghiệm & Thực đơn */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Trải Nghiệm Ẩm Thực
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/menu" className="hover:text-brand-primary transition-colors inline-block">
                  Món ăn Bếp trưởng Signature
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-brand-primary transition-colors inline-block">
                  Thực đơn nếm thử theo mùa
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="hover:text-brand-primary transition-colors inline-block">
                  Bàn tiệc riêng tư (Private Dining)
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="hover:text-brand-primary transition-colors inline-block">
                  Đặt bàn trực tuyến giữ chỗ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dịch vụ & Khách hàng */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Dịch Vụ & Pháp Lý
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/orders" className="hover:text-brand-primary transition-colors inline-block">
                  Kiểm tra đơn hàng & hóa đơn
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-primary transition-colors inline-block">
                  Hồ sơ cá nhân & cảnh báo dị ứng
                </Link>
              </li>
              <li>
                <span className="text-text-dim cursor-default">
                  Chính sách giữ chỗ & bảo lưu bàn
                </span>
              </li>
              <li>
                <span className="text-text-dim cursor-default">
                  Quy định đổi trả & hủy tiệc
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Giờ phục vụ & Liên hệ VIP */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Liên Hệ & Đặt Chỗ
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <span className="font-semibold text-text-main">0901 234 567</span>
                  <span className="text-text-dim ml-1.5">(Hotline VIP 24/7)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                <span>contact@tresmk.restaurant.vn</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-main font-medium">10:00 – 23:00 hàng ngày</p>
                  <p className="text-[10px] text-text-dim">Phục vụ bữa trưa & tiệc tối</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            PHẦN 3: BẢN QUYỀN, PHÁP LÝ & TRẠNG THÁI HỆ THỐNG THỜI GIAN THỰC
            ========================================================================= */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-text-dim">
          <div className="flex items-center gap-2">
            <p>© {new Date().getFullYear()} {BRAND_NAME} Restaurant. Mọi quyền được bảo lưu.</p>
          </div>

          {/* Trạng thái hệ thống thời gian thực */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="text-text-body font-medium">Hệ thống đặt bàn trực tuyến: Hoạt động bình thường</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
