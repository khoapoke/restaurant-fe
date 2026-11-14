import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDishesApi } from '@/features/customer/menu/services/menuService'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Alert from '@/components/ui/Alert'
import { UtensilsCrossed, ArrowRight, Flame, RefreshCw } from 'lucide-react'

/**
 * Component Món Ăn Nổi Bật (HomeFeaturedDishes)
 * Chuẩn mực Design System (design-system/t-resmk/MASTER.md):
 * - Giữ nguyên 100% logic API getDishesApi
 * - Đảm bảo đủ 4 trạng thái UI: Loading, Error, Empty, Data
 * - Dish Card chuẩn Component Specs 6.2 (aspect-[4/3], lazy loading, async decoding)
 */
export default function HomeFeaturedDishes() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeatured = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDishesApi({ perPage: 4 })
      const items = res?.data?.items || res?.data || []
      setDishes(items.slice(0, 4))
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách món ăn nổi bật')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatured()
  }, [fetchFeatured])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tiêu đề mục chuẩn Content-Minimalist */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-2 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Tuyệt tác ẩm thực</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Món Ăn Signature Bếp Trưởng
          </h2>
        </div>

        <Link to="/menu">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            className="text-brand-primary hover:text-brand-hover hover:bg-surface-card"
          >
            Xem toàn bộ thực đơn
          </Button>
        </Link>
      </div>

      {/* 4 Trạng thái UI chuẩn quy ước FE */}
      {/* 1. Trạng thái Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-3">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* 2. Trạng thái Lỗi */}
      {!loading && error && (
        <div className="max-w-md mx-auto text-center space-y-4 py-8">
          <Alert variant="danger" message={error} />
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchFeatured}>
            Thử lại
          </Button>
        </div>
      )}

      {/* 3. Trạng thái Rỗng */}
      {!loading && !error && dishes.length === 0 && (
        <div className="text-center py-12 bg-surface-card/40 border border-border-subtle rounded-xl p-8">
          <UtensilsCrossed className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted">Hiện chưa có món ăn nổi bật nào được hiển thị.</p>
        </div>
      )}

      {/* 4. Trạng thái Dữ liệu (Data) */}
      {!loading && !error && dishes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => {
            const price = Number(dish.price || dish.don_gia || 0)
            const name = dish.dishName || dish.name || dish.ten_mon_an || 'Món ăn đặc sắc'
            const img = dish.imageUrl || dish.image_url || dish.hinh_anh || '/img/steak-frites.jpg'
            const categoryName = dish.category?.categoryName || dish.category_name || 'Đặc sản'

            return (
              <div
                key={dish.dishId || dish.id}
                className="group bg-surface-card border border-border-subtle hover:border-border-strong rounded-xl overflow-hidden transition-colors flex flex-col justify-between"
              >
                {/* Khung ảnh tỉ lệ chuẩn 4:3 */}
                <div className="relative overflow-hidden aspect-[4/3] bg-surface-bg">
                  <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/img/steak-frites.jpg'
                    }}
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-surface-bg/80 border border-border-subtle text-[10px] font-medium text-brand-primary">
                    {categoryName}
                  </div>
                </div>

                {/* Thông tin món ăn & Giá */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-sm font-bold text-brand-primary mt-1">
                      {price.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                    <Link to="/menu" className="w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-medium border-border-subtle hover:border-border-strong"
                      >
                        Gọi món ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
