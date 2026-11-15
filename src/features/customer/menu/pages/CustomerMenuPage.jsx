import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/contexts/AuthContext'
import HomeHeader from '../../Home/components/HomeHeader'
import MenuHeroHeader from '../components/MenuHeroHeader'
import MenuSmartHub from '../components/MenuSmartHub'
import MenuFilterBar from '../components/MenuFilterBar'
import MenuDishGrid from '../components/MenuDishGrid'

/**
 * Trang Thực Đơn Khách Hàng (CustomerMenuPage)
 * Chuẩn mực Design System:
 * - Đồng bộ Navbar HomeHeader (Cart badge, Hover avatar logout) & HomeFooter
 * - Tích hợp MenuSmartHub & MenuFilterBar & MenuDishGrid
 */
export default function CustomerMenuPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, totalItems: 0 })
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)

  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const debounceTimerRef = useRef(null)
  const handleKeywordChange = (val) => {
    setKeyword(val)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(val)
      setPage(1)
    }, 400)
  }

  // 1. Fetch Danh mục & Dữ liệu Thời tiết
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await getCategoriesApi()
        setCategories(catRes.data?.items || catRes.data || [])
      } catch (err) {
        console.error('Không thể tải danh mục:', err)
      }

      setWeatherLoading(true)
      const loadWeather = async (lat, lon) => {
        try {
          const res = await getWeatherRecommendationsApi(lat, lon)
          const data = res?.data?.data || res?.data
          setWeatherData(data?.weather ? data : DEFAULT_FALLBACK_WEATHER)
        } catch {
          setWeatherData(DEFAULT_FALLBACK_WEATHER)
        } finally {
          setWeatherLoading(false)
        }
      }

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
          () => loadWeather(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon),
          { timeout: 3000 }
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
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Không thể tải thực đơn. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, selectedCategoryId, filters, page])

  useEffect(() => {
    fetchDishes()
  }, [fetchDishes])

  const handleResetAll = () => {
    setSelectedCategoryId(null)
    setKeyword('')
    setDebouncedKeyword('')
    setFilters({})
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-surface-bg text-text-body flex flex-col selection:bg-brand-primary selection:text-surface-bg">
      <HomeHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <MenuHeroHeader />

        <MenuSmartHub
          weatherData={weatherData}
          weatherLoading={weatherLoading}
          fallbackDishes={dishes}
          isAuthenticated={isAuthenticated}
          onSelectDish={(id) => navigate(`/menu/${id}`)}
        />

        <MenuFilterBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => { setSelectedCategoryId(id); setPage(1); }}
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          filters={filters}
          onApplyFilters={(f) => { setFilters(f); setPage(1); }}
          onResetFilters={handleResetAll}
          disabled={loading}
        />

        <MenuDishGrid
          loading={loading}
          fetchError={fetchError}
          dishes={dishes}
          onRetry={fetchDishes}
          onResetAll={handleResetAll}
          onSelectDish={(id) => navigate(`/menu/${id}`)}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
        />
      </main>

 
    </div>
  )
}
