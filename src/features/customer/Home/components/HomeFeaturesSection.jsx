import { Cpu, QrCode, CalendarCheck2 } from 'lucide-react'

/**
 * Component Tính Năng Công Nghệ (HomeFeaturesSection)
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Triết lý Content-Minimalist: Thông tin súc tích, đắt giá
 * - Thẻ card phẳng tối giản, không gradient nặng nề
 * - Tokens: bg-surface-card, border-border-subtle, text-brand-primary
 */
export default function HomeFeaturesSection() {
  const features = [
    {
      icon: Cpu,
      title: 'Gợi Ý Món Ăn AI',
      desc: 'Công nghệ đồ thị Neo4j phân tích khẩu vị và thời tiết thực tế, tự động loại trừ chất gây dị ứng theo hồ sơ của bạn.',
      badge: 'Công nghệ Neo4j & AI',
    },
    {
      icon: CalendarCheck2,
      title: 'Đặt Bàn Tức Thì',
      desc: 'Xem sơ đồ bàn trống trực quan theo thời gian thực, loại trừ hoàn toàn nguy cơ trùng giờ hoặc hết chỗ vào giờ cao điểm.',
      badge: 'Chống Trùng 100%',
    },
    {
      icon: QrCode,
      title: 'VietQR Một Chạm',
      desc: 'Tự động tạo mã QR Napas 247 chính xác số tiền và cú pháp, hệ thống xác nhận thanh toán tự động chỉ sau 2 giây.',
      badge: 'Napas 247 Tức Thì',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border-subtle">
      {/* Tiêu đề mục */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-2">
          Trải nghiệm công nghệ dẫn đầu
        </h2>
        <h3 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Nền Tảng Phục Vụ Thông Minh
        </h3>
        <p className="text-xs sm:text-sm text-text-muted mt-2">
          Mang đến trải nghiệm ẩm thực trọn vẹn từ lúc đặt chỗ đến khi thanh toán.
        </p>
      </div>

      {/* Lưới 3 thẻ tính năng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="p-6 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-bg border border-border-subtle text-brand-primary flex items-center justify-center mb-5">
                <Icon className="w-5 h-5" />
              </div>

              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium text-brand-primary bg-brand-subtle border border-border-brand mb-3">
                {item.badge}
              </span>

              <h4 className="text-base font-semibold text-text-main mb-2 group-hover:text-brand-primary transition-colors">
                {item.title}
              </h4>

              <p className="text-xs text-text-muted leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
