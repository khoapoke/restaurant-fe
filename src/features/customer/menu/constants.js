/**
 * Menu Constants & Enums
 * Tuân thủ docs/api/enums.md và docs/api/customer-menu.md
 */

export const DEFAULT_COORDINATES = {
  lat: 10.8231,
  lon: 106.6297,
  city: 'TP. Hồ Chí Minh',
}

export const WEATHER_CONDITIONS = {
  HOT_SUNNY: {
    label: 'Nắng nóng',
    desc: 'Thời tiết oi bức, ưu tiên món giải nhiệt, đồ uống thanh mát',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  RAINY_OR_COLD: {
    label: 'Mưa hoặc lạnh',
    desc: 'Thời tiết ẩm lạnh, ưu tiên các món lẩu nóng, món nướng đậm vị',
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  PLEASANT_NORMAL: {
    label: 'Thời tiết dễ chịu',
    desc: 'Thời tiết mát mẻ lý tưởng để thưởng thức các món ăn đặc sắc',
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
}

export const DEFAULT_PAGE_SIZE = 12

export const FALLBACK_DISH_IMAGE =
  '/images/menu/pho-bo.jpg'
