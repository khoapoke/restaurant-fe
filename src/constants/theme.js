/**
 * Centralized Design Tokens (Hệ thống Quản lý Màu Sắc & Giao Diện Tập Trung)
 * Chuẩn Haute Cuisine / Modern Minimalist Luxury
 * Phục vụ cho các xử lý JavaScript programmatic (Chart.js, Canvas, SVG, dynamic styles)
 * Đồng bộ 100% với `@theme` trong `src/index.css`
 */

export const THEME_COLORS = {
  // 1. Thương hiệu & Điểm nhấn chính (Brand & Accent)
  brand: {
    primary: '#f59e0b',       // Amber-500: Màu chủ đạo ấm áp, tinh tế
    hover: '#fbbf24',         // Amber-400: Khi hover
    active: '#d97706',        // Amber-600: Khi click/active
    subtle: 'rgba(245, 158, 11, 0.1)', // Nền mờ điểm nhấn
    glow: 'rgba(245, 158, 11, 0.25)',  // Đổ bóng phát sáng nhẹ
  },

  // 2. Các tầng bề mặt (Surfaces & Backgrounds)
  surface: {
    bg: '#09090b',            // Zinc-950: Nền tối toàn trang sâu lắng
    card: '#18181b',          // Zinc-900: Nền thẻ card, form, container
    cardHover: '#27272a',     // Zinc-800: Khi hover thẻ card
    elevated: '#121215',      // Modal, Drawer, Dropdown nổi bật
    input: '#09090b',         // Nền ô nhập liệu input / select
  },

  // 3. Đường viền & Phân cách (Borders & Dividers)
  border: {
    subtle: '#27272a',        // Zinc-800: Viền mặc định thanh mảnh
    strong: '#3f3f46',        // Zinc-700: Viền tương phản rõ hơn
    brand: 'rgba(245, 158, 11, 0.4)', // Viền nhấn thương hiệu
  },

  // 4. Màu chữ & Kiểu chữ (Text & Typography)
  text: {
    main: '#ffffff',          // Trắng tinh khiết: Tiêu đề H1-H6, nhãn quan trọng
    body: '#d4d4d8',          // Zinc-300: Đoạn văn bản, nội dung chính
    muted: '#a1a1aa',         // Zinc-400: Chú thích, phụ đề, thời gian
    dim: '#71717a',           // Zinc-500: Placeholder, disabled text
    brand: '#f59e0b',         // Chữ mang màu thương hiệu
  },

  // 5. Trạng thái phản hồi (Feedback & Status)
  status: {
    success: '#10b981',       // Emerald-500: Đã xác nhận, thành công
    error: '#f43f5e',         // Rose-500: Lỗi, hủy bỏ, cảnh báo nguy hiểm
    warning: '#f59e0b',       // Amber-500: Chờ xử lý, lưu ý
    info: '#0ea5e9',          // Sky-500: Thông tin hệ thống
  },
}

export default THEME_COLORS

