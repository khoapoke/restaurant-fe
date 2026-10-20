/**
 * Profile Constants & Enums
 * Tuân thủ docs/api/enums.md
 */

export const ALLERGENS = [
  { value: 'PEANUT', label: 'Đậu phộng (Lạc)', desc: 'Các món có thành phần đậu phộng, bơ đậu phộng' },
  { value: 'SHELLFISH', label: 'Hải sản có vỏ', desc: 'Tôm, cua, sò, ốc, nghêu, hàu...' },
  { value: 'DAIRY', label: 'Sữa & chế phẩm sữa', desc: 'Sữa tươi, bơ động vật, phô mai, kem béo' },
  { value: 'EGG', label: 'Trứng', desc: 'Trứng gà, trứng vịt, sốt mayonnaise trứng' },
  { value: 'GLUTEN', label: 'Gluten (Lúa mì)', desc: 'Bột mì, bánh mì, mì sợi, các loại bột chiên xù' },
  { value: 'SOY', label: 'Đậu nành (Tương)', desc: 'Đậu hũ, nước tương, dầu đậu nành, sốt tương' },
]

export const DIETARY_PREFERENCES = [
  { value: 'LOW_SUGAR', label: 'Ít đường (Low Sugar)', desc: 'Hạn chế tối đa đường tinh luyện và sốt ngọt' },
  { value: 'HIGH_PROTEIN', label: 'Nhiều đạm (High Protein)', desc: 'Tăng cường thịt nạc, ức gà, cá hồi, trứng' },
  { value: 'VEGETARIAN', label: 'Ăn chay (Vegetarian)', desc: 'Món ăn từ thực vật, nấm, rau củ quả' },
  { value: 'LOW_CARB', label: 'Ít tinh bột (Low Carb / Keto)', desc: 'Hạn chế cơm, bún, phở, mì và bánh mì' },
]
