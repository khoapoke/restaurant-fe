/**
 * Constants & Enums cho Quản lý Danh mục & Món ăn (Admin)
 * Tham chiếu docs/system_conventions.md và docs/modules/menu.md
 * Đồng bộ 100% Centralized Design Tokens
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
  { value: 'HOT_SUNNY', label: 'Nắng nóng', color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
  { value: 'RAINY_OR_COLD', label: 'Mưa / Lạnh', color: 'text-status-info bg-status-info/10 border-status-info/20' },
  { value: 'PLEASANT_NORMAL', label: 'Dễ chịu', color: 'text-status-success bg-status-success/10 border-status-success/20' },
]

export const FALLBACK_DISH_IMG = '/img/food.jpg'
