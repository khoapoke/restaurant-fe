import { Award, Star, Quote } from 'lucide-react'
import InView from '@/components/core/in-view'
import AnimatedGroup from '@/components/core/animated-group'
import SlidingNumber from '@/components/core/sliding-number'

/**
 * Component Đánh giá & Vinh danh (HomeTestimonialsSection)
 * Chuẩn mực Design System:
 * - Dưới 200 dòng, hiển thị 3 đánh giá thực khách VIP và dải thống kê uy tín
 * - Tokens: bg-surface-card, border-border-subtle, text-brand-primary
 * - Tối ưu 60 FPS với InView & AnimatedGroup
 */
export default function HomeTestimonialsSection() {
  const stats = [
    { label: 'Điểm Đánh Giá Ẩm Thực', value: '4.9 / 5.0', note: 'Từ hơn 1.200 thực khách xác thực' },
    { label: 'Bàn Tiệc Đã Phục Vụ', value: '15.000+', note: 'Khoảnh khắc trọn vẹn mỗi năm' },
    { label: 'Nguyên Liệu Kiểm Định', value: '100%', note: 'Chuẩn tươi sống mỗi bình minh' },
  ]

  const reviews = [
    {
      author: 'Henry Nguyễn',
      title: 'Giám đốc Đầu tư, Mekong Capital',
      occasion: 'Tiệc Ngoại Giao',
      content:
        'Phòng VIP cách âm hoàn hảo cho các buổi đàm phán quan trọng. Món bò Wagyu A5 sốt vang đỏ thực sự là một tuyệt tác ẩm thực đỉnh cao.',
      rating: 5,
    },
    {
      author: 'Mai Phương',
      title: 'Nhà sáng lập, Bloom Studio',
      occasion: 'Kỷ Niệm Ngày Cưới',
      content:
        'Bữa tiệc kỷ niệm tại sảnh chính đẹp và ấm cúng như một thước phim. Đội ngũ nhân viên tinh tế, chu đáo đến từng chi tiết nhỏ nhất.',
      rating: 5,
    },
    {
      author: 'Đỗ Hoàng Minh',
      title: 'Chuyên gia Ẩm thực & Giám khảo',
      occasion: 'Trải Nghiệm Tasting Menu',
      content:
        'Sự chuẩn xác trong kiểm soát nhiệt độ và cách phối ngẫu vang điêu luyện của Sommelier chứng minh vị thế Fine Dining hàng đầu.',
      rating: 5,
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-xs font-semibold text-brand-primary mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Niềm tin & Vinh danh</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
            Dấu ấn khó quên trong lòng thượng khách
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Sự gắn bó của các đối tác doanh nghiệp và gia đình là thước đo chân thực nhất cho chất lượng dịch vụ của chúng tôi.
          </p>
        </div>

        {/* Dải số liệu uy tín (Stats strip) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-surface-card border border-border-subtle text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-brand-primary mb-1 flex items-center justify-center">
                <SlidingNumber value={st.value} />
              </div>
              <div className="text-xs font-semibold text-text-main mb-0.5">
                {st.label}
              </div>
              <div className="text-[11px] text-text-muted">
                {st.note}
              </div>
            </div>
          ))}
        </div>
      </InView>

      {/* Lưới 3 đánh giá với AnimatedGroup */}
      <AnimatedGroup
        preset="slide"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-strong transition-colors flex flex-col justify-between relative group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                {/* 5 Sao vàng */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-brand-primary text-brand-primary"
                    />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-border-strong text-text-muted/40" />
              </div>

              <p className="text-xs sm:text-sm text-text-body leading-relaxed mb-6 italic">
                &ldquo;{rev.content}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-main">
                  {rev.author}
                </h4>
                <p className="text-[11px] text-text-muted">
                  {rev.title}
                </p>
              </div>

              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-bg border border-border-subtle text-brand-primary">
                {rev.occasion}
              </span>
            </div>
          </div>
        ))}
      </AnimatedGroup>
    </section>
  )
}

