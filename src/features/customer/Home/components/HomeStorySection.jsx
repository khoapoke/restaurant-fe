import { ChefHat, Leaf, Award, ShieldCheck } from 'lucide-react'
import InView from '@/components/core/in-view'
import TextEffect from '@/components/core/text-effect'

/**
 * Component Triết lý Ẩm thực & Bếp trưởng (HomeStorySection)
 * Chuẩn mực Design System:
 * - Dưới 200 dòng, bố cục đối xứng 2 cột (Story Text & Chef Showcase)
 * - Tối ưu 60 FPS với InView & TextEffect Motion-Primitives
 * - Kể chuyện đa tầng: Tiêu đề H2 (blur) & Lời trích dẫn Bếp trưởng (fade)
 * - Hình ảnh lazy loading, async decoding, fallback an toàn
 */
export default function HomeStorySection() {
  const pillars = [
    {
      icon: Leaf,
      title: 'Farm-to-Table Hữu Cơ',
      desc: '100% thảo mộc và rau củ thu hoạch từ nông trại hữu cơ chuẩn GlobalGAP mỗi bình minh.',
    },
    {
      icon: Award,
      title: 'Miyazaki Wagyu A5 & Hải Sản Tươi',
      desc: 'Bò tuyết thượng hạng Nhật Bản và hải sản đánh bắt trong ngày với chuỗi cung ứng lạnh chuẩn mực.',
    },
    {
      icon: ShieldCheck,
      title: 'Vị Ngọt Tự Nhiên Thuần Khiết',
      desc: 'Nước dùng ninh xương 24 giờ cùng thảo mộc tự nhiên, tuyệt đối không phụ gia công nghiệp.',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 border-t border-border-subtle">
      <InView
        variants={{
          hidden: { opacity: 0, y: 28 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Cột trái: Nội dung triết lý & Bếp trưởng */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-xs font-semibold text-brand-primary">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Triết lý Bếp trưởng & Nguồn cảm hứng</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main leading-snug">
              <TextEffect inView per="word" as="span" preset="blur">
                Tuyệt tác mỹ vị từ sự tỉ mỉ trong từng nguyên liệu
              </TextEffect>
            </h2>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Dưới sự dẫn dắt của Tổng Bếp trưởng với hơn 18 năm thâm niên tại các nhà hàng danh tiếng, 
              chúng tôi tin rằng sự hoàn mỹ của ẩm thực bắt nguồn từ lòng tôn trọng tuyệt đối dành cho nguyên liệu bản địa 
              và kỹ thuật ẩm thực đương đại chuẩn xác.
            </p>

            {/* Trích dẫn Bếp trưởng với TextEffect fade có độ trễ */}
            <div className="p-4 rounded-xl bg-surface-card border-l-2 border-brand-primary border-border-subtle text-text-body text-xs sm:text-sm italic">
              <TextEffect inView per="word" as="span" preset="fade" delay={0.35}>
                &ldquo;Mỗi món ăn gửi đến bàn tiệc không đơn thuần là một khẩu phần, mà là sự hòa quyện của thời gian, hương vị và cảm xúc.&rdquo;
              </TextEffect>
            </div>

            {/* 3 Trụ cột chất lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {pillars.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-bg border border-border-subtle text-brand-primary flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-text-main mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cột phải: Hình ảnh Bếp trưởng & Nghệ thuật ẩm thực */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-lg group">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=80"
                  alt="Executive Chef sáng tạo món ăn tại nhà hàng"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80'
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Lớp phủ tinh tế và nhãn nổi */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-surface-bg/90 backdrop-blur-md border border-border-subtle">
                <p className="text-xs font-bold text-text-main">
                  Alexandre Trần
                </p>
                <p className="text-[11px] text-brand-primary">
                  Executive Chef &amp; Giám đốc Nghệ thuật Ẩm thực
                </p>
              </div>
            </div>
          </div>

        </div>
      </InView>
    </section>
  )
}

