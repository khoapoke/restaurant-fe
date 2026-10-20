import { useState, useEffect, useCallback, useRef } from 'react'
import {
  UtensilsCrossed,
  AlertTriangle,
  RefreshCw,
  SearchX,
} from 'lucide-react'
import {
  getCategoriesApi,
  getDishesApi,
  getWeatherRecommendationsApi,
} from '../services/menuService'
import { DEFAULT_COORDINATES, DEFAULT_PAGE_SIZE } from '../constants'
import WeatherRecommendationAccordion from '../components/WeatherRecommendationAccordion'
import MenuFilterBar from '../components/MenuFilterBar'
import DishCard from '../components/DishCard'
import DishDetailModal from '../components/DishDetailModal'
import Pagination from '../../../../components/ui/Pagination'
import Button from '../../../../components/ui/Button'
import Skeleton from '../../../../components/ui/Skeleton'
import MocSiteHeader from '../../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../../components/navigation/MocFooter'

export const CustomerMenuPage = () => {
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
          const res = await getWeatherRecommendationsApi(lat, lon)
          setWeatherData(res.data)
        } catch {
          // Fallback TP.HCM
          try {
            const fallbackRes = await getWeatherRecommendationsApi(
              DEFAULT_COORDINATES.lat,
              DEFAULT_COORDINATES.lon
            )
            setWeatherData(fallbackRes.data)
          } catch {}
        } finally {
          setWeatherLoading(false)
        }
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
          () => loadWeather(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon)
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
    <div className="moc-page-shell flex flex-col">
      <MocSiteHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-10 space-y-7">
        <header className="pb-3 grid lg:grid-cols-[1fr_0.55fr] items-end gap-6">
          <div>
            <span className="moc-eyebrow">THỰC ĐƠN CỦA MỘC</span>
            <h1 className="moc-section-title mt-4 flex items-center gap-4"><UtensilsCrossed className="hidden sm:block w-9 h-9 text-[#6f1d32]" /> Món Việt, cách kể mới.</h1>
          </div>
          <p className="moc-serif text-sm leading-7 text-[#766e68]">Tìm món theo khẩu vị, mức giá và lưu ý dị ứng. Hình ảnh được gắn đúng với từng món trong dữ liệu.</p>
        </header>
        {/* Accordion Gợi ý Thời tiết */}
        <WeatherRecommendationAccordion
          weatherData={weatherData}
          loading={weatherLoading}
          onSelectDish={(id) => setSelectedDishId(id)}
        />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      />
      <MocFooter />
    </div>
  )
}

export default CustomerMenuPage
