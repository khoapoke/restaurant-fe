/**
 * Constants & Enums cho Quản lý Danh mục & Món ăn (Admin)
 * Tham chiếu docs/api/enums.md và docs/api/admin-dish.md
 */

export const ALLERGEN_OPTIONS = [
  { value: 'PEANUT', label: 'Đậu phộng' },
  { value: 'SHELLFISH', label: 'Hải sản có vỏ' },
  { value: 'DAIRY', label: 'Sữa & bơ' },
  { value: 'EGG', label: 'Trứng' },
  { value: 'GLUTEN', label: 'Gluten (Lúa mì)' },
  { value: 'SOY', label: 'Đậu nành' },
]

export const WEATHER_TAG_OPTIONS = [
  { value: 'HOT_SUNNY', label: 'Nắng nóng', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'RAINY_OR_COLD', label: 'Mưa / Lạnh', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'PLEASANT_NORMAL', label: 'Dễ chịu', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
]

export const FALLBACK_DISH_IMG =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'

