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
          <TextEffect per="char" as="span" preset="fade">
            Khám phá nghệ thuật ẩm thực thượng hạng, giữ chỗ trực tuyến tức thì và thực đơn thông minh theo khẩu vị riêng của bạn.
          </TextEffect> 
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

        </div>

        {/* 3 Cam kết chất lượng cốt lõi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5  mx-auto border-t border-border-subtle">
      

        </div>

      </div>
    </section>
  )
}
