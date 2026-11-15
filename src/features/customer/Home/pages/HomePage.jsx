import HomeHeader from '../components/HomeHeader'
import HomeHeroSection from '../components/HomeHeroSection'
import HomeQuickBooking from '../components/HomeQuickBooking'
import HomeStorySection from '../components/HomeStorySection'
import HomeFeaturedDishes from '../components/HomeFeaturedDishes'
import HomeAmbianceSection from '../components/HomeAmbianceSection'
import HomeFeaturesSection from '../components/HomeFeaturesSection'
import HomeTestimonialsSection from '../components/HomeTestimonialsSection'
import HomeFooter from '../components/HomeFooter'

/**
 * Trang chủ Nhà hàng T-ResMK (Customer Home Page)
 * Sử dụng Centralized Design Tokens từ Tailwind v4:
 * - bg-surface-bg (Nền chính tập trung)
 * - text-text-body (Màu chữ chính)
 * - selection:bg-brand-primary (Màu highlight)
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-bg text-text-body flex flex-col selection:bg-brand-primary selection:text-surface-bg">
      {/* 1. Header & Menu điều hướng tối giản */}
      <HomeHeader />

      {/* 2. Nội dung chính trang chủ */}
      <main className="flex-1">
        {/* Banner Hero */}
        <HomeHeroSection />

        {/* Tiện ích Đặt bàn nhanh */}
        <HomeQuickBooking />

        {/* Triết lý ẩm thực & Câu chuyện Bếp trưởng */}
        <HomeStorySection />

        {/* Món ăn Signature của Bếp trưởng */}
        <HomeFeaturedDishes />

        {/* Không gian kiến trúc & Phòng VIP */}
        <HomeAmbianceSection />

        {/* Điểm nhấn công nghệ (Neo4j AI, Đặt bàn, VietQR) */}
        <HomeFeaturesSection />

        {/* Đánh giá từ thực khách VIP & Niềm tin thương hiệu */}
        <HomeTestimonialsSection />
      </main>

      {/* 3. Chân trang Footer */}
      <HomeFooter />
    </div>
  )
}
