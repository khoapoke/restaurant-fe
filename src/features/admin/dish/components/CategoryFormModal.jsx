import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { FolderTree } from 'lucide-react'

/**
 * Modal Tạo & Chỉnh Sửa Danh Mục (CategoryFormModal)
 * - 100% Centralized Design Tokens
 * - Độ dài < 110 dòng
 */
export const CategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({ categoryName: '', description: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryName: initialData.categoryName || initialData.ten_danh_muc || '',
        description: initialData.description || initialData.mo_ta || '',
      })
    } else {
      setFormData({ categoryName: '', description: '' })
    }
    setErrors({})
    setServerError(null)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    const newErrors = {}
    if (!formData.categoryName.trim()) newErrors.categoryName = 'Vui lòng nhập tên danh mục'
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors)

    try {
      await onSubmit({
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || undefined,
      })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && <Alert type="error" message={serverError} onClose={() => setServerError(null)} />}

        <Input
          label="Tên danh mục"
          name="categoryName"
          placeholder="Ví dụ: Khai vị, Món nướng, Tráng miệng..."
          value={formData.categoryName}
          onChange={handleChange}
          error={errors.categoryName}
          required
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-muted">Mô tả (tùy chọn)</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Mô tả ngắn gọn về nhóm món ăn này..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder-text-dim focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            icon={FolderTree}
          >
            {initialData ? 'Lưu thay đổi' : 'Tạo danh mục'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryFormModal
