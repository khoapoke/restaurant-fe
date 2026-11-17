import { Cpu, QrCode, CalendarCheck2 } from 'lucide-react'
import InView from '@/components/core/in-view'
import AnimatedGroup from '@/components/core/animated-group'
import Spotlight from '@/components/core/spotlight'

/**
 * Component Tính Năng Công Nghệ (HomeFeaturesSection)
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Triết lý Content-Minimalist: Thông tin súc tích, đắt giá
 * - Tối ưu 60 FPS với InView, AnimatedGroup và Spotlight vệt sáng tương tác
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
      {/* Tiêu đề mục với InView */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
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
      </InView>

      {/* Lưới 3 thẻ tính năng với AnimatedGroup & Spotlight */}
      <AnimatedGroup
        preset="scale"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {features.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-strong transition-all duration-300 group relative overflow-hidden shadow-xs hover:shadow-md"
            >
              {/* Vệt sáng Spotlight di chuyển theo chuột */}
              <Spotlight
                className="from-brand-primary/20 via-brand-primary/5 to-transparent blur-2xl pointer-events-none"
                size={280}
              />

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-surface-bg border border-border-subtle text-brand-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
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
            </div>
          )
        })}
      </AnimatedGroup>
    </section>
  )
}
