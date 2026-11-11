/**
 * Danh sách hình ảnh món ăn chất lượng cao có sẵn trong thư mục public/img
 */
export const LOCAL_DISH_IMAGES = [
  { file: '/img/steak-frites.jpg', keywords: ['bò', 'steak', 'bít tết', 'thịt', 'nướng'] },
  { file: '/img/seafood-paella.jpg', keywords: ['hải sản', 'tôm', 'cua', 'mực', 'cơm'] },
  { file: '/img/spaghetti-carbonara.jpg', keywords: ['mì', 'pasta', 'spaghetti', 'súp', 'canh', 'bào ngư'] },
  { file: '/img/sushi-roll-platter.jpg', keywords: ['sushi', 'cá', 'hồi', 'cuộn', 'sashimi'] },
  { file: '/img/caesar-salad.jpg', keywords: ['salad', 'rau', 'gỏi', 'khai vị'] },
  { file: '/img/veggie-burger.jpg', keywords: ['burger', 'bánh', 'khoai', 'chiên'] },
  { file: '/img/vegan-buddha-bowl.jpg', keywords: ['chay', 'dưỡng sinh', 'nấm', 'đậu'] },
  { file: '/img/food.jpg', keywords: ['thực đơn', 'món chính', 'đặc sắc'] },
  { file: '/img/ingredients.jpg', keywords: ['nguyên liệu', 'tươi'] },
]

export const DEFAULT_DISH_FALLBACK = '/img/food.jpg'

/**
 * Hàm phân giải ảnh món ăn thông minh:
 * 1. Nếu có URL hợp lệ (http/https/data/storage/img) -> ưu tiên sử dụng ảnh thật từ DB
 * 2. Nếu không có hoặc link rỗng -> tự động map thông minh theo tên hoặc ID món ăn vào 9 ảnh local
 */
export const resolveDishImage = (imageUrl, idOrObj = null, name = '') => {
  // Nếu có object được truyền vào (ví dụ dish object)
  let id = idOrObj
  let dishName = name
  if (typeof idOrObj === 'object' && idOrObj !== null) {
    id = idOrObj.dishId || idOrObj.id || idOrObj.ma_mon_an
    dishName = idOrObj.dishName || idOrObj.ten_mon_an || idOrObj.name || ''
    if (!imageUrl) {
      imageUrl = idOrObj.imageUrl || idOrObj.hinh_anh || idOrObj.image
    }
  }

  // 1. Nếu imageUrl có giá trị
  if (imageUrl && typeof imageUrl === 'string') {
    const trimmed = imageUrl.trim()
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('/img/') ||
      trimmed.startsWith('/storage/')
    ) {
      return trimmed
    }

    // Nếu chỉ là tên file trùng với danh sách local (vd: caesar-salad.jpg)
    const matchLocal = LOCAL_DISH_IMAGES.find((img) => img.file.endsWith(trimmed))
    if (matchLocal) {
      return matchLocal.file
    }
  }

  // 2. Map thông minh theo từ khóa trong tên món ăn
  if (dishName) {
    const lowerName = dishName.toLowerCase()
    const matched = LOCAL_DISH_IMAGES.find((img) =>
      img.keywords.some((kw) => lowerName.includes(kw))
    )
    if (matched) return matched.file
  }

  // 3. Xoay vòng theo ID món ăn để các món không bị trùng lặp ảnh
  if (id !== null && id !== undefined) {
    const numId = Number(id)
    if (!isNaN(numId) && numId > 0) {
      const index = (numId - 1) % LOCAL_DISH_IMAGES.length
      return LOCAL_DISH_IMAGES[index].file
    }
  }

  return DEFAULT_DISH_FALLBACK
}

/**
 * Xử lý sự kiện lỗi ảnh (onError) an toàn chống lặp vô tận
 */
export const handleImageError = (e, fallbackSrc = DEFAULT_DISH_FALLBACK) => {
  if (!e?.target) return
  e.target.onerror = null // Xóa listener để không bị loop nếu fallback cũng lỗi
  e.target.src = fallbackSrc
}

