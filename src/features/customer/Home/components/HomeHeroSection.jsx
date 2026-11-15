import { Link } from 'react-router-dom'
import { BRAND_NAME } from '@/constants/brand'
import {
  UtensilsCrossed,
  CalendarDays,
  Flame,
  Award,
  ShieldCheck,
  Network,
} from 'lucide-react'
import TextEffect from '@/components/core/text-effect'

/**
 * Component Hero Section Trang Chủ (HomeHeroSection)
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Triết lý Content-Minimalist: Tiêu đề đắt giá, thông điệp súc tích
 * - Chống ngắt dòng thương hiệu: whitespace-nowrap
 * - Tokens: text-text-main, text-text-muted, text-brand-primary, bg-surface-card
 */
export default function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-14 lg:pt-16 lg:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Nhãn giới thiệu tối giản */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle text-text-muted text-xs font-medium mb-6">
          <Flame className="w-3.5 h-3.5 text-brand-primary" />
          <span>Ẩm thực tinh tế & Trải nghiệm đẳng cấp</span>
        </div>

        {/* Tiêu đề chính H1 với hiệu ứng TextEffect */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-main mb-5 leading-tight">
          <TextEffect per="word" as="span" preset="fade">
            Hương vị tinh hoa tại
          </TextEffect>{' '}
          <span className="whitespace-nowrap text-brand-primary">
            <TextEffect per="char" as="span" preset="slide" delay={0.25}>
              {BRAND_NAME}
            </TextEffect>
          </span>
        </h1>

        {/* Mô tả súc tích theo chuẩn Content-Minimalist */}
        <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
          Khám phá nghệ thuật ẩm thực thượng hạng, giữ chỗ trực tuyến tức thì và thực đơn thông minh theo khẩu vị riêng của bạn.
        </p>

        {/* Cụm 2 nút hành động (CTA) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-surface-bg bg-brand-primary hover:bg-brand-hover active:bg-brand-active transition-colors shadow-sm cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Khám phá Thực đơn</span>
          </Link>

          <Link
            to="/reservation"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-text-body hover:text-text-main bg-surface-card hover:bg-surface-card-hover border border-border-subtle hover:border-border-strong transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-text-muted" />
            <span>Đặt bàn giữ chỗ</span>
          </Link>
        </div>

        {/* 3 Cam kết chất lượng cốt lõi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-8 border-t border-border-subtle">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong transition-colors">
            <div className="w-9 h-9 rounded-lg bg-surface-bg border border-border-subtle flex items-center justify-center text-brand-primary shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-text-main">Chuẩn Fine Dining</h4>
              <p className="text-[11px] text-text-muted">Nguyên liệu chọn lọc cao cấp</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong transition-colors">
            <div className="w-9 h-9 rounded-lg bg-surface-bg border border-border-subtle flex items-center justify-center text-brand-primary shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-text-main">Gợi ý AI Neo4j</h4>
              <p className="text-[11px] text-text-muted">Đề xuất theo sở thích & thời tiết</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong transition-colors">
            <div className="w-9 h-9 rounded-lg bg-surface-bg border border-border-subtle flex items-center justify-center text-brand-primary shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-text-main">VietQR Napas 247</h4>
              <p className="text-[11px] text-text-muted">Xác nhận thanh toán tức thì</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
