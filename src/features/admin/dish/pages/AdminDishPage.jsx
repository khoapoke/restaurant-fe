import { useState, useEffect, useCallback } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import {
  getAdminDishesApi,
  getAdminCategoriesApi,
  createDishApi,
  updateDishApi,
  toggleDishAvailabilityApi,
  toggleDishVisibilityApi,
  deleteDishApi,
} from '../services/adminDishService'
import DishFilterBar from '../components/DishFilterBar'
import DishTable from '../components/DishTable'
import DishFormModal from '../components/DishFormModal'
import DeleteDishModal from '../components/DeleteDishModal'
import Pagination from '../../../../components/ui/Pagination'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import Button from '../../../../components/ui/Button'

/**
 * Trang Quản Lý Món Ăn (AdminDishPage)
 * - 100% Centralized Design Tokens
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 185 dòng
 */
export const AdminDishPage = () => {
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, perPage: 10, totalItems: 0, lastPage: 1 })

  // Filters
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isAvailable, setIsAvailable] = useState('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals & Actions
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingDish, setDeletingDish] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  // Tải danh mục
  useEffect(() => {
    getAdminCategoriesApi()
      .then((res) => setCategories(Array.isArray(res.data?.items || res.data) ? res.data?.items || res.data : []))
      .catch(() => {})
  }, [])

  // Tải danh sách món ăn
  const fetchDishes = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, perPage: 10 }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (categoryId) params.categoryId = categoryId
      if (isAvailable === 'AVAILABLE') params.isAvailable = true
      if (isAvailable === 'UNAVAILABLE') params.isAvailable = false

      const res = await getAdminDishesApi(params)
      const items = res.data?.items || res.data || []
      setDishes(Array.isArray(items) ? items : [])

      const pData = res?.data?.pagination || res?.pagination
      if (pData) {
        setPagination({
          currentPage: Number(pData.currentPage || page),
          perPage: Number(pData.perPage || 10),
          totalItems: Number(pData.totalItems || 0),
          lastPage: Number(pData.lastPage || pData.totalPages || 1),
        })
      } else {
        setPagination({ currentPage: page, perPage: 10, totalItems: items.length, lastPage: Math.ceil(items.length / 10) || 1 })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách món ăn.')
    } finally {
      setLoading(false)
    }
  }, [keyword, categoryId, isAvailable])

  useEffect(() => { fetchDishes(1) }, [fetchDishes])

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingDish) {
        await updateDishApi(editingDish.dishId || editingDish.ma_mon_an, payload)
        showToast('Cập nhật món ăn thành công!')
      } else {
        await createDishApi(payload)
        showToast('Tạo món ăn mới thành công!')
      }
      setIsFormOpen(false)
      fetchDishes(pagination.currentPage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (dishId, type) => {
    setTogglingId(dishId)
    try {
      if (type === 'availability') {
        await toggleDishAvailabilityApi(dishId)
        setDishes((p) => p.map((d) => (d.dishId || d.ma_mon_an) === dishId ? { ...d, isAvailable: !d.isAvailable } : d))
        showToast('Đã đổi trạng thái còn bán!')
      } else {
        await toggleDishVisibilityApi(dishId)
        setDishes((p) => p.map((d) => (d.dishId || d.ma_mon_an) === dishId ? { ...d, isVisible: !d.isVisible } : d))
        showToast('Đã đổi trạng thái hiển thị!')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDish) return
    setIsDeleting(true)
    try {
      await deleteDishApi(deletingDish.dishId || deletingDish.ma_mon_an)
      showToast('Đã xóa mềm món ăn!')
      setDeletingDish(null)
      fetchDishes(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa món ăn.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DishFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        isAvailable={isAvailable}
        onAvailabilityChange={setIsAvailable}
        categories={categories}
        onOpenCreate={() => { setEditingDish(null); setIsFormOpen(true) }}
        onRefresh={() => fetchDishes(pagination.currentPage)}
        loading={loading}
      />

      {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={() => fetchDishes(1)}>Thử lại</Button>} />}

      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border-subtle">
          <Skeleton className="h-8 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
          <Skeleton className="h-14 w-full bg-surface-card-hover" />
        </div>
      ) : dishes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Không tìm thấy món ăn nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Thử thay đổi bộ lọc tìm kiếm hoặc thêm món ăn mới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <DishTable
            dishes={dishes}
            onEdit={(dish) => { setEditingDish(dish); setIsFormOpen(true) }}
            onDelete={(dish) => setDeletingDish(dish)}
            onToggleAvailability={(id) => handleToggle(id, 'availability')}
            onToggleVisibility={(id) => handleToggle(id, 'visibility')}
            togglingId={togglingId}
          />
          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            totalItems={pagination.totalItems}
            itemLabel="món ăn"
            onPageChange={(p) => fetchDishes(p)}
          />
        </div>
      )}

      <DishFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={editingDish}
        isSubmitting={isSubmitting}
      />

      <DeleteDishModal
        isOpen={Boolean(deletingDish)}
        onClose={() => setDeletingDish(null)}
        onConfirm={handleDeleteConfirm}
        dish={deletingDish}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default AdminDishPage
