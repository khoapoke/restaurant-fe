import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, FolderTree } from 'lucide-react'
import {
  getAdminCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  toggleCategoryVisibilityApi,
  deleteCategoryApi,
} from '../services/adminDishService'
import CategoryTable from '../components/CategoryTable'
import CategoryFormModal from '../components/CategoryFormModal'
import DeleteCategoryModal from '../components/DeleteCategoryModal'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Trang Quản Lý Danh Mục (AdminCategoryPage)
 * - 100% Centralized Design Tokens
 * - Quản lý an toàn 4 trạng thái UI (Loading, Error, Empty, Data)
 * - Độ dài < 170 dòng
 */
export const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successToast, setSuccessToast] = useState(null)

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminCategoriesApi()
      const list = res.data?.items || res.data || []
      setCategories(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách danh mục.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.categoryId || editingCategory.ma_danh_muc, payload)
        showToast('Cập nhật danh mục thành công!')
      } else {
        await createCategoryApi(payload)
        showToast('Tạo danh mục mới thành công!')
      }
      setIsFormOpen(false)
      fetchCategories()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleVisibility = async (categoryId) => {
    setTogglingId(categoryId)
    try {
      await toggleCategoryVisibilityApi(categoryId)
      setCategories((prev) =>
        prev.map((cat) => ((cat.categoryId || cat.ma_danh_muc) === categoryId ? { ...cat, isVisible: !cat.isVisible } : cat))
      )
      showToast('Đã thay đổi trạng thái hiển thị!')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái danh mục.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    setIsDeleting(true)
    try {
      await deleteCategoryApi(deletingCategory.categoryId || deletingCategory.ma_danh_muc)
      showToast('Đã xóa mềm danh mục!')
      setDeletingCategory(null)
      fetchCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-main">Quản lý Danh mục Món ăn</h2>
            <p className="text-xs text-text-muted">Tổng số {categories.length} phân loại thực đơn trong hệ thống</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} isLoading={loading} onClick={fetchCategories}>
            Làm mới
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingCategory(null); setIsFormOpen(true) }}>
            Thêm danh mục
          </Button>
        </div>
      </div>

      {successToast && <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />}
      {error && <Alert type="error" message={error} action={<Button variant="outline" size="sm" onClick={fetchCategories}>Thử lại</Button>} />}

      {/* 4 Trạng thái UI */}
      {loading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border-subtle">
          <Skeleton className="h-8 w-full bg-surface-card-hover" />
          <Skeleton className="h-12 w-full bg-surface-card-hover" />
          <Skeleton className="h-12 w-full bg-surface-card-hover" />
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <FolderTree className="w-10 h-10 text-text-dim mx-auto" />
          <p className="text-sm font-semibold text-text-main">Chưa có danh mục nào</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">Bấm "Thêm danh mục" ở trên để tạo nhóm phân loại món ăn đầu tiên.</p>
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={(cat) => { setEditingCategory(cat); setIsFormOpen(true) }}
          onDelete={(cat) => setDeletingCategory(cat)}
          onToggleVisibility={handleToggleVisibility}
          togglingId={togglingId}
        />
      )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isSubmitting={isSubmitting}
      />

      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        category={deletingCategory}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default AdminCategoryPage
