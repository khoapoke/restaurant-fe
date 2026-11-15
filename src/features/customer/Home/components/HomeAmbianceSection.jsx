import { Link } from 'react-router-dom'
import { Compass, Users, ArrowRight } from 'lucide-react'
import InView from '@/components/core/in-view'
import AnimatedGroup from '@/components/core/animated-group'

/**
 * Component Không gian & Kiến trúc (HomeAmbianceSection)
 * Chuẩn mực Design System:
 * - Dưới 200 dòng, hiển thị 3 không gian ẩm thực tiêu biểu
 * - Tối ưu 60 FPS với AnimatedGroup so le
 * - Hình ảnh tỉ lệ 16:10, lazy loading, fallback an toàn
 */
export default function HomeAmbianceSection() {
  const spaces = [
    {
      title: 'Sảnh Tiệc Hoàng Gia',
      subtitle: 'Grand Dining Hall',
      capacity: '80 - 120 khách',
      tag: 'Tiệc tối & Kỷ niệm',
      desc: 'Thiết kế thông tầng thoáng đãng với ánh đèn pha lê ấm áp và giai điệu dương cầm êm dịu mỗi tối.',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Phòng VIP Riêng Tư',
      subtitle: 'Private Dining Suites',
      capacity: '6 - 18 khách',
      tag: 'Ngoại giao & Đối tác',
      desc: 'Không gian cách âm tiêu chuẩn, lối vào kín đáo cùng dịch vụ quản gia và Sommelier túc trực riêng.',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Lounge Rượu Vang',
      subtitle: 'Sommelier Wine Bar',
      capacity: '20 - 30 khách',
      tag: 'Khai vị & Thưởng rượu',
      desc: 'Hầm rượu lưu trữ hơn 450 niên vụ Grands Crus Classés, điểm khởi đầu hoàn hảo cho bữa tiệc thượng hạng.',
      image:
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 border-t border-border-subtle">
      <InView
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        {/* Tiêu đề mục */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-xs font-semibold text-brand-primary mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Kiến trúc & Không gian ẩm thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
              Nơi cảm xúc thăng hoa cùng kiến trúc duy mỹ
            </h2>
          </div>

          <Link
            to="/reservation"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-hover transition-colors shrink-0"
          >
            <span>Chọn không gian &amp; Đặt chỗ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </InView>

      {/* Lưới 3 không gian với AnimatedGroup */}
      <AnimatedGroup
        preset="slide"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {spaces.map((space, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl overflow-hidden bg-surface-card border border-border-subtle hover:border-border-strong transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            {/* Hình ảnh không gian */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-bg">
              <img
                src={space.image}
                alt={space.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80'
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-surface-bg/85 backdrop-blur-sm border border-border-subtle text-[11px] font-medium text-brand-primary">
                {space.tag}
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                  <span className="font-mono">{space.subtitle}</span>
                  <div className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{space.capacity}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-text-main group-hover:text-brand-primary transition-colors mb-2">
                  {space.title}
                </h3>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                  {space.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle">
                <Link
                  to="/reservation"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-main group-hover:text-brand-primary transition-colors"
                >
                  <span>Xem bàn trống</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </AnimatedGroup>
    </section>
  )
}

