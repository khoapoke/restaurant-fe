import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  SearchX,
  Sparkles,
  ShoppingBag,
  CalendarDays,
} from 'lucide-react'
import {
  getCategoriesApi,
  getDishesApi,
  getWeatherRecommendationsApi,
} from '../services/menuService'
import {
  DEFAULT_COORDINATES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_FALLBACK_WEATHER,
} from '../constants'
import { useCart } from '../../../../contexts/CartContext'
import { useAuth } from '../../../../contexts/AuthContext'
import WeatherRecommendationAccordion from '../components/WeatherRecommendationAccordion'
import PersonalizedRecommendationSection from '../components/PersonalizedRecommendationSection'
import MenuFilterBar from '../components/MenuFilterBar'
import DishCard from '../components/DishCard'
import DishDetailModal from '../components/DishDetailModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'

export const CustomerMenuPage = () => {
  const { totalQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  // State danh mục & món ăn
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    lastPage: 1,
  })

  // State bộ lọc
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [filters, setFilters] = useState({
    minPrice: undefined,
    maxPrice: undefined,
    isAvailable: undefined,
    excludeAllergens: undefined,
  })
  const [page, setPage] = useState(1)

  // State thời tiết
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  // State UI
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDishId, setSelectedDishId] = useState(null)

  // Debounce search keyword
  const debounceTimerRef = useRef(null)
  const handleKeywordChange = (val) => {
    setKeyword(val)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(val)
      setPage(1)
    }, 400)
  }

  // 1. Fetch Danh mục & Thời tiết
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch Categories
      try {
        const catRes = await getCategoriesApi()
        setCategories(catRes.data?.items || catRes.data || [])
      } catch (err) {
        console.error('Không thể tải danh mục:', err)
      }

      // Fetch Weather
      setWeatherLoading(true)
      const loadWeather = async (lat, lon) => {
        try {
          console.log(`[Weather] Đang tải gợi ý thời tiết cho tọa độ: lat=${lat}, lon=${lon}...`)
          const res = await getWeatherRecommendationsApi(lat, lon)
          const data = res?.data?.data || res?.data
          if (data?.weather) {
            console.log('[Weather] Nhận dữ liệu thời tiết thành công từ API Backend:', data)
            setWeatherData(data)
          } else {
            console.warn('[Weather] API phản hồi nhưng không có cấu trúc weather, sử dụng dữ liệu dự phòng.')
            setWeatherData(DEFAULT_FALLBACK_WEATHER)
          }
        } catch (err) {
          console.warn('[Weather] API theo tọa độ gặp lỗi hoặc chưa cấu hình OpenWeatherMap, thử tọa độ mặc định TP.HCM:', err)
          try {
            const fallbackRes = await getWeatherRecommendationsApi(
              DEFAULT_COORDINATES.lat,
              DEFAULT_COORDINATES.lon
            )
            const fallbackData = fallbackRes?.data?.data || fallbackRes?.data
            if (fallbackData?.weather) {
              console.log('[Weather] Tải thời tiết mặc định TP.HCM thành công:', fallbackData)
              setWeatherData(fallbackData)
            } else {
              setWeatherData(DEFAULT_FALLBACK_WEATHER)
            }
          } catch (fallbackErr) {
            console.warn('[Weather] API thời tiết Backend không phản hồi, áp dụng dữ liệu dự phòng chuẩn để hiển thị UI:', fallbackErr)
            setWeatherData(DEFAULT_FALLBACK_WEATHER)
          }
        } finally {
          setWeatherLoading(false)
        }
      }

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
          (geoErr) => {
            console.warn('[Weather] Trình duyệt không cấp quyền GPS hoặc timeout, chuyển sang vị trí mặc định TP.HCM:', geoErr?.message)
            loadWeather(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon)
          },
          { timeout: 3500, enableHighAccuracy: false, maximumAge: 60000 }
        )
      } else {
        loadWeather(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon)
      }
    }

    fetchInitialData()
  }, [])

  // 2. Fetch Danh sách Món ăn
  const fetchDishes = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const response = await getDishesApi({
        keyword: debouncedKeyword.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isAvailable: filters.isAvailable,
        excludeAllergens: filters.excludeAllergens,
        page,
        perPage: DEFAULT_PAGE_SIZE,
      })

      const data = response.data || {}
      setDishes(data.items || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      setFetchError(
        err.response?.data?.message || 'Không thể tải thực đơn. Vui lòng thử lại sau.'
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, selectedCategoryId, filters, page])

  useEffect(() => {
    fetchDishes()
  }, [fetchDishes])

  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId)
    setPage(1)
  }

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleResetAll = () => {
    setSelectedCategoryId(null)
    setKeyword('')
    setDebouncedKeyword('')
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      isAvailable: undefined,
      excludeAllergens: undefined,
    })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Quay lại Trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                Thực đơn nhà hàng
              </h1>
              <p className="text-[11px] text-gray-400 tracking-wider">
                T-ResMK FINE DINING & CULINARY
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/reservation">
              <Button variant="ghost" size="sm" icon={CalendarDays}>
                Đặt bàn
              </Button>
            </Link>

            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px] flex items-center justify-center shadow-md">
                  {totalQuantity}
                </span>
              )}
            </Link>

            <Link to="/profile">
              <Button variant="outline" size="sm">
                Xem sở thích dị ứng
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Accordion Gợi ý Thời tiết */}
        <WeatherRecommendationAccordion
          weatherData={weatherData}
          loading={weatherLoading}
          fallbackDishes={dishes}
          onSelectDish={(id) => setSelectedDishId(id)}
        />

        {/* Gợi ý món cá nhân hóa dựa trên Neo4j AI (Dành cho khách hàng đã đăng nhập) */}
        {isAuthenticated && (
          <PersonalizedRecommendationSection
            onSelectDish={(id) => setSelectedDishId(id)}
          />
        )}

        {/* Thanh tìm kiếm & lọc */}
        <MenuFilterBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetAll}
          disabled={loading}
        />

        {/* UI STATE 1: LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-7 w-16 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UI STATE 2: ERROR */}
        {!loading && fetchError && (
          <div className="p-12 text-center rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4 my-6">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Không thể tải thực đơn</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">{fetchError}</p>
            <Button variant="primary" size="md" icon={RefreshCw} onClick={fetchDishes}>
              Thử lại
            </Button>
          </div>
        )}

        {/* UI STATE 3: EMPTY */}
        {!loading && !fetchError && dishes.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 space-y-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
              <SearchX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-200">Không tìm thấy món ăn phù hợp</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                Không có món ăn nào thỏa mãn từ khóa tìm kiếm hoặc các tiêu chí lọc hiện tại.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetAll}>
              Xóa toàn bộ bộ lọc
            </Button>
          </div>
        )}

        {/* UI STATE 4: DATA LIST */}
        {!loading && !fetchError && dishes.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dishes.map((dish) => (
                <DishCard
                  key={dish.dishId}
                  dish={dish}
                  onSelect={(id) => setSelectedDishId(id)}
                />
              ))}
            </div>

            {/* Phân trang */}
            <Pagination
              currentPage={pagination.currentPage}
              lastPage={pagination.lastPage}
              totalItems={pagination.totalItems}
              onPageChange={(p) => setPage(p)}
              disabled={loading}
            />
          </>
        )}
      </main>

      {/* Modal Chi tiết Món ăn */}
      <DishDetailModal
        dishId={selectedDishId}
        isOpen={!!selectedDishId}
        onClose={() => setSelectedDishId(null)}
        onSelectDish={(id) => setSelectedDishId(id)}
      />
    </div>
  )
}

export default CustomerMenuPage
