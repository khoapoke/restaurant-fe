import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import { Utensils, X, Plus } from 'lucide-react'
import {
  ALLERGEN_OPTIONS,
  WEATHER_TAG_OPTIONS,
} from '../constants'
import DishImagePicker from './DishImagePicker'

export const DishFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    dishName: '',
    categoryId: '',
    price: '',
    description: '',
    imageUrl: '',
    ingredients: [],
    allergens: [],
    weatherTags: [],
    isAvailable: true,
    isVisible: true,
  })

  const [ingredientInput, setIngredientInput] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        dishName: initialData.dishName || initialData.ten_mon_an || '',
        categoryId:
          initialData.categoryId ||
          initialData.ma_danh_muc ||
          (categories[0]?.categoryId || categories[0]?.ma_danh_muc || ''),
        price: initialData.price || initialData.gia_tien || '',
        description: initialData.description || initialData.mo_ta || '',
        imageUrl: initialData.imageUrl || initialData.hinh_anh || '',
        ingredients: Array.isArray(initialData.ingredients)
          ? initialData.ingredients
          : [],
        allergens: Array.isArray(initialData.allergens)
          ? initialData.allergens
          : [],
        weatherTags: Array.isArray(initialData.weatherTags)
          ? initialData.weatherTags
          : [],
        isAvailable: initialData.isAvailable !== false,
        isVisible: initialData.isVisible !== false,
      })
    } else {
      setFormData({
        dishName: '',
        categoryId: categories[0]?.categoryId || categories[0]?.ma_danh_muc || '',
        price: '',
        description: '',
        imageUrl: '',
        ingredients: [],
        allergens: [],
        weatherTags: [],
        isAvailable: true,
        isVisible: true,
      })
    }
    setErrors({})
    setServerError(null)
    setIngredientInput('')
  }, [initialData, categories, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleAddIngredient = () => {
    const val = ingredientInput.trim()
    if (!val) return
    if (!formData.ingredients.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, val],
      }))
    }
    setIngredientInput('')
  }

  const handleRemoveIngredient = (ing) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i !== ing),
    }))
  }

  const handleToggleAllergen = (val) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(val)
        ? prev.allergens.filter((a) => a !== val)
        : [...prev.allergens, val],
    }))
  }

  const handleToggleWeatherTag = (val) => {
    setFormData((prev) => ({
      ...prev,
      weatherTags: prev.weatherTags.includes(val)
        ? prev.weatherTags.filter((w) => w !== val)
        : [...prev.weatherTags, val],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    const newErrors = {}
    if (!formData.dishName.trim()) newErrors.dishName = 'Vui lòng nhập tên món ăn'
    if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục'
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Giá tiền phải lớn hơn 0'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

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
        {serverError && (
          <Alert type="error" message={serverError} onClose={() => setServerError(null)} />
        )}

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
            <label className="block text-xs font-semibold text-gray-300">
              Danh mục món <span className="text-red-400">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {categories.map((c) => {
                const id = c.categoryId || c.ma_danh_muc
                const name = c.categoryName || c.ten_danh_muc
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
            {errors.categoryId && (
              <p className="text-[11px] text-red-400">{errors.categoryId}</p>
            )}
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

        {/* Bộ chọn hình ảnh món ăn trực quan (Tab 1: File máy & Mẫu, Tab 2: Dán URL ngoài) */}
        <DishImagePicker
          value={formData.imageUrl}
          dishName={formData.dishName}
          onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-300">Mô tả món ăn</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Hương vị, xuất xứ, nguyên liệu chính..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Thành phần nguyên liệu (Dynamic Tag Input) */}
        <div className="space-y-2 p-3 rounded-xl bg-gray-950 border border-gray-800">
          <label className="block text-xs font-semibold text-gray-300">
            Thành phần nguyên liệu
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập nguyên liệu rồi bấm Thêm..."
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddIngredient()
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleAddIngredient}
              icon={Plus}
            >
              Thêm
            </Button>
          </div>
          {formData.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]"
                >
                  {ing}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cảnh báo Dị ứng (Checkboxes) */}
        <div className="space-y-2 p-3 rounded-xl bg-gray-950 border border-gray-800">
          <label className="block text-xs font-semibold text-gray-300">
            Chất gây dị ứng (nếu có)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALLERGEN_OPTIONS.map((alg) => {
              const isChecked = formData.allergens.includes(alg.value)
              return (
                <button
                  key={alg.value}
                  type="button"
                  onClick={() => handleToggleAllergen(alg.value)}
                  className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {alg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Gợi ý Thời tiết (Checkboxes) */}
        <div className="space-y-2 p-3 rounded-xl bg-gray-950 border border-gray-800">
          <label className="block text-xs font-semibold text-gray-300">
            Thích hợp với thời tiết
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WEATHER_TAG_OPTIONS.map((tag) => {
              const isChecked = formData.weatherTags.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => handleToggleWeatherTag(tag.value)}
                  className={`p-2 rounded-lg border text-center text-xs transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Trạng thái Bật/Tắt */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <span>Còn bán món này</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
            <input
              type="checkbox"
              name="isVisible"
              checked={formData.isVisible}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <span>Hiển thị trên thực đơn của khách</span>
          </label>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
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

