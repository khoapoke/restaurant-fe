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

export const AdminDishPage = () => {
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    lastPage: 1,
  })

  // Filters
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isAvailable, setIsAvailable] = useState('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modals
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

  // Load categories
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await getAdminCategoriesApi()
        const list = res.data?.items || res.data || []
        setCategories(Array.isArray(list) ? list : [])
      } catch {}
    }
    loadCats()
  }, [])

  // Load dishes
  const fetchDishes = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          perPage: 10,
        }
        if (keyword.trim()) params.keyword = keyword.trim()
        if (categoryId) params.categoryId = categoryId
        if (isAvailable === 'AVAILABLE') params.isAvailable = true
        if (isAvailable === 'UNAVAILABLE') params.isAvailable = false

        const res = await getAdminDishesApi(params)
        const items = res.data?.items || res.data || []
        setDishes(Array.isArray(items) ? items : [])

        const paginationData = res?.data?.pagination || res?.pagination
        if (paginationData) {
          setPagination({
            currentPage: Number(paginationData.currentPage || page),
            perPage: Number(paginationData.perPage || 10),
            totalItems: Number(paginationData.totalItems || 0),
            lastPage: Number(paginationData.lastPage || paginationData.totalPages || 1),
          })
        } else {
          setPagination({
            currentPage: page,
            perPage: 10,
            totalItems: items.length,
            lastPage: Math.ceil(items.length / 10) || 1,
          })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách món ăn.')
      } finally {
        setLoading(false)
      }
    },
    [keyword, categoryId, isAvailable]
  )

  useEffect(() => {
    fetchDishes(1)
  }, [fetchDishes])

  const handleOpenCreate = () => {
    setEditingDish(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (dish) => {
    setEditingDish(dish)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingDish) {
        const id = editingDish.dishId || editingDish.ma_mon_an
        await updateDishApi(id, payload)
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

  const handleToggleAvailability = async (dishId) => {
    setTogglingId(dishId)
    try {
      await toggleDishAvailabilityApi(dishId)
      setDishes((prev) =>
        prev.map((d) => {
          const id = d.dishId || d.ma_mon_an
          if (id === dishId) {
            return { ...d, isAvailable: !d.isAvailable }
          }
          return d
        })
      )
      showToast('Đã đổi trạng thái còn bán!')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleToggleVisibility = async (dishId) => {
    setTogglingId(dishId)
    try {
      await toggleDishVisibilityApi(dishId)
      setDishes((prev) =>
        prev.map((d) => {
          const id = d.dishId || d.ma_mon_an
          if (id === dishId) {
            return { ...d, isVisible: !d.isVisible }
          }
          return d
        })
      )
      showToast('Đã đổi trạng thái hiển thị!')
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
      const id = deletingDish.dishId || deletingDish.ma_mon_an
      await deleteDishApi(id)
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
      {/* Filters and search */}
      <DishFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        isAvailable={isAvailable}
        onAvailabilityChange={setIsAvailable}
        categories={categories}
        onOpenCreate={handleOpenCreate}
        onRefresh={() => fetchDishes(pagination.currentPage)}
        loading={loading}
      />

      {successToast && (
        <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button variant="outline" size="sm" onClick={() => fetchDishes(1)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <Skeleton className="h-8 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
          <Skeleton className="h-14 w-full bg-gray-800" />
        </div>
      ) : dishes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-gray-900/40 border border-gray-800 space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Không tìm thấy món ăn nào</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc bấm "Thêm món mới" để tạo món đầu tiên.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <DishTable
            dishes={dishes}
            onEdit={handleOpenEdit}
            onDelete={(dish) => setDeletingDish(dish)}
            onToggleAvailability={handleToggleAvailability}
            onToggleVisibility={handleToggleVisibility}
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

      {/* Modals */}
      <DishFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={editingDish}
        isSubmitting={isSubmitting}
      />

      <DeleteDishModal
        isOpen={!!deletingDish}
        onClose={() => setDeletingDish(null)}
        onConfirm={handleDeleteConfirm}
        dish={deletingDish}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default AdminDishPage

