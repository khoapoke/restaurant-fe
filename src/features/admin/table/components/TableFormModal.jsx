import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { Grid } from 'lucide-react'
import { TableStatus, TABLE_STATUS_CONFIG } from '../constants'

/**
 * Modal Thêm / Chỉnh Sửa Bàn Ăn (TableFormModal)
 * - 100% Centralized Design Tokens
 * - Độ dài < 140 dòng
 */
export const TableFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    tableName: '',
    capacity: 4,
    location: '',
    status: TableStatus.AVAILABLE,
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        tableName: initialData.tableName || initialData.ten_ban || '',
        capacity: initialData.capacity || initialData.suc_chua || 4,
        location: initialData.location || initialData.vi_tri || '',
        status: initialData.status || initialData.trang_thai || TableStatus.AVAILABLE,
      })
    } else {
      setFormData({ tableName: '', capacity: 4, location: '', status: TableStatus.AVAILABLE })
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
    if (!formData.tableName.trim()) newErrors.tableName = 'Vui lòng nhập tên bàn'
    if (!formData.capacity || Number(formData.capacity) <= 0) newErrors.capacity = 'Sức chứa phải lớn hơn 0'
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors)

    try {
      await onSubmit({
        tableName: formData.tableName.trim(),
        capacity: Number(formData.capacity),
        location: formData.location.trim() || undefined,
        status: formData.status,
      })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bàn.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa bàn ăn' : 'Thêm bàn ăn mới'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && <Alert type="error" message={serverError} onClose={() => setServerError(null)} />}

        <Input
          label="Tên bàn"
          name="tableName"
          placeholder="Ví dụ: Bàn số 5, Bàn VIP 2..."
          value={formData.tableName}
          onChange={handleChange}
          error={errors.tableName}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Sức chứa (Khách)"
            name="capacity"
            type="number"
            min={1}
            value={formData.capacity}
            onChange={handleChange}
            error={errors.capacity}
            required
          />

          <Input
            label="Vị trí (tùy chọn)"
            name="location"
            placeholder="Tầng 1, Ban công..."
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-muted">Trạng thái khởi tạo</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer"
          >
            {Object.entries(TABLE_STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            icon={Grid}
          >
            {initialData ? 'Lưu thay đổi' : 'Tạo bàn ăn'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TableFormModal
