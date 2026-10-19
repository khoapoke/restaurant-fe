# FRONTEND CODING STANDARDS

> Mọi code Frontend sinh ra trong dự án này phải tuân thủ các tiêu chuẩn dưới đây.

---

## 1. TECH STACK CHUẨN
- **Build Tool:** Vite 8.x
- **Framework:** React 19.x (**JSX** — project KHÔNG dùng TypeScript)
- **Styling & UI:** _(cần quyết định và cài đặt)_
- **State & Data Fetching:** Nên dùng TanStack Query (React Query) cho Server State, Zustand cho Global Client State
- **Form & Validation:** Nên dùng React Hook Form + Yup/Zod
- **HTTP Client:** Axios (sử dụng chung 1 instance có cấu hình Interceptors)

## 2. CẤU TRÚC THƯ MỤC (MODULAR ARCHITECTURE)
Không dồn code vào một chỗ. Tách biệt rõ ràng theo trách nhiệm:
- `src/components/ui/`: Các base UI component dùng chung (Button, Input, Modal, Table, Badge...).
- `src/features/<module-name>/`: Chứa toàn bộ code của một nghiệp vụ (ví dụ: `menu`, `cart`, `orders`):
  - `components/`: Các component con chỉ phục vụ module đó.
  - `hooks/`: Custom hooks gọi API (React Query) hoặc xử lý logic của module.
  - `services/`: Các hàm gọi API thuần túy (`getProducts`, `createProduct`...).
  - `constants.js`: Enum values, status constants cho module.
- `src/lib/` hoặc `src/utils/`: Cấu hình Axios client, formatters (ngày tháng, tiền tệ), constants.

## 3. QUY TẮC CODE & BẢO TRÌ (CLEAN CODE RULES)

### 3.1. Prop Types & Constants
- Mọi hằng số trạng thái (Status/Enum/Role) phải viết TIẾNG ANH VIẾT HOA (ví dụ: `ACTIVE`, `LOCKED`, `COMPLETED`).
- Tham khảo danh sách enum tại [`docs/api/enums.md`](../api/enums.md).

### 3.2. Giới hạn độ dài Component
- Không viết "God Component" ôm đồm cả gọi API, xử lý form và hiển thị bảng trong 1 file dài quá 200 dòng.
- Phải tách riêng: `Page/Container` (điều phối) → `Table/List` (hiển thị danh sách) → `FilterBar` (tìm kiếm/lọc) → `FormModal` (Thêm/Sửa).

### 3.3. 4 Trạng thái UI bắt buộc cho mọi màn hình dữ liệu
1. **Loading**: Hiển thị Skeleton hoặc Spinner rõ ràng.
2. **Error**: Hiển thị thông báo lỗi thân thiện và nút "Thử lại" (Retry).
3. **Empty**: Hiển thị trạng thái trống (Empty State) khi không có dữ liệu.
4. **Success/Data**: Hiển thị dữ liệu chuẩn xác.

### 3.4. An toàn khi thao tác Form & Mutation
- Luôn khoá nút Submit (`disabled={isPending}`) khi đang gửi request để chống double-submit.
- Luôn có hộp thoại xác nhận (Confirm Dialog) trước khi thực hiện thao tác Xóa hoặc khóa dữ liệu quan trọng.
- Hiển thị Toast thông báo rõ ràng khi thao tác Thành công hoặc Thất bại (lấy message lỗi chuẩn từ Backend trả về).
