import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { Utensils } from 'lucide-react'
import DishImagePicker from './DishImagePicker'
import DishIngredientList from './DishIngredientList'
import DishDietaryTagsPicker from './DishDietaryTagsPicker'

const getInitialState = (data, cats) => ({
  dishName: data?.dishName || data?.ten_mon_an || '',
  categoryId: data?.categoryId || data?.ma_danh_muc || cats[0]?.categoryId || cats[0]?.ma_danh_muc || '',
  price: data?.price || data?.gia_tien || '',
  description: data?.description || data?.mo_ta || '',
  imageUrl: data?.imageUrl || data?.hinh_anh || '',
  ingredients: Array.isArray(data?.ingredients) ? data.ingredients : [],
  allergens: Array.isArray(data?.allergens) ? data.allergens : [],
  weatherTags: Array.isArray(data?.weatherTags) ? data.weatherTags : [],
  isAvailable: data?.isAvailable !== false,
  isVisible: data?.isVisible !== false,
})

/**
 * Modal Tạo Mới & Chỉnh Sửa Món Ăn (DishFormModal)
 * - Tách nhỏ sub-components DishIngredientList & DishDietaryTagsPicker
 * - 100% Centralized Design Tokens
 * - Độ dài < 180 dòng
 */
export const DishFormModal = ({ isOpen, onClose, onSubmit, categories = [], initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState(() => getInitialState(initialData, categories))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    setFormData(getInitialState(initialData, categories))
    setErrors({})
    setServerError(null)
  }, [initialData, categories, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleAddIngredient = (val) => {
    if (!formData.ingredients.includes(val)) setFormData((p) => ({ ...p, ingredients: [...p.ingredients, val] }))
  }

  const handleRemoveIngredient = (val) => {
    setFormData((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i !== val) }))
  }

  const handleToggleTag = (field, val) => {
    setFormData((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((x) => x !== val) : [...p[field], val],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    const newErrors = {}
    if (!formData.dishName.trim()) newErrors.dishName = 'Vui lòng nhập tên món ăn'
    if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục'
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Giá tiền phải lớn hơn 0'
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors)

    try {
      await onSubmit({
        dishName: formData.dishName.trim(),
        categoryId: Number(formData.categoryId),
        price: Number(formData.price),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        weatherTags: formData.weatherTags,
        isAvailable: formData.isAvailable,
        isVisible: formData.isVisible,
      })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {serverError && <Alert type="error" message={serverError} onClose={() => setServerError(null)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên món ăn"
            name="dishName"
            placeholder="Ví dụ: Bò sốt tiêu đen"
            value={formData.dishName}
            onChange={handleChange}
            error={errors.dishName}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-muted">
              Danh mục món <span className="text-status-error">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              {categories.map((c) => {
                const id = c.categoryId || c.ma_danh_muc
                return <option key={id} value={id}>{c.categoryName || c.ten_danh_muc}</option>
              })}
            </select>
            {errors.categoryId && <p className="text-[11px] text-status-error">{errors.categoryId}</p>}
          </div>
        </div>

        <Input
          label="Đơn giá (VNĐ)"
          name="price"
          type="number"
          placeholder="Ví dụ: 150000"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          required
        />

        <DishImagePicker
          value={formData.imageUrl}
          dishName={formData.dishName}
          onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-muted">Mô tả món ăn</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Hương vị, xuất xứ, nguyên liệu chính..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs bg-surface-bg border border-border-strong rounded-xl text-text-main placeholder-text-dim focus:outline-none focus:border-brand-primary"
          />
        </div>

        <DishIngredientList
          ingredients={formData.ingredients}
          onAdd={handleAddIngredient}
          onRemove={handleRemoveIngredient}
        />

        <DishDietaryTagsPicker
          allergens={formData.allergens}
          onToggleAllergen={(val) => handleToggleTag('allergens', val)}
          weatherTags={formData.weatherTags}
          onToggleWeatherTag={(val) => handleToggleTag('weatherTags', val)}
        />

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
            />
            <span>Còn bán món này</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
            <input
              type="checkbox"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
            />
            <span>Hiển thị trên thực đơn của khách</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            icon={Utensils}
          >
            {initialData ? 'Lưu thay đổi' : 'Thêm món ăn'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DishFormModal
