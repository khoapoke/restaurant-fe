# FRONTEND ARCHITECTURE & CODING STANDARDS

Mọi code Frontend sinh ra trong dự án này phải tuân thủ nghiêm ngặt các tiêu chuẩn dưới đây.

## 1. TECH STACK CHUẨN (Điều chỉnh lại nếu dự án dùng công nghệ khác)
- **Framework:** React / Next.js (TypeScript)
- **Styling & UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **State & Data Fetching:** TanStack Query (React Query) cho Server State, Zustand cho Global Client State
- **Form & Validation:** React Hook Form + Zod
- **HTTP Client:** Axios (sử dụng chung 1 instance có cấu hình Interceptors)

## 2. CẤU TRÚC THƯ MỤC (MODULAR ARCHITECTURE)
Không dồn code vào một chỗ. Tách biệt rõ ràng theo trách nhiệm:
- `src/components/ui/`: Các base UI component dùng chung (Button, Input, Modal, Table, Badge...).
- `src/features/<module-name>/`: Chứa toàn bộ code của một nghiệp vụ (ví dụ: `products`, `users`):
  - `components/`: Các component con chỉ phục vụ module đó (ví dụ: `ProductTable.tsx`, `ProductFormModal.tsx`).
  - `hooks/`: Custom hooks gọi API (React Query) hoặc xử lý logic của module.
  - `services/`: Các hàm gọi API thuần túy (`getProducts`, `createProduct`, `updateProduct`, `deleteProduct`).
  - `types/`: TypeScript Interfaces / Types của riêng module.
  - `schemas/`: Zod validation schemas cho Form.
- `src/lib/` hoặc `src/utils/`: Cấu hình Axios client, formatters (ngày tháng, tiền tệ), constants.

## 3. QUY TẮC CODE & BẢO TRÌ (CLEAN CODE RULES)
1. **Strict Type-Safety:**
   - CẤM sử dụng kiểu `any`. Mọi props, API request payload và API response đều phải có Interface/Type rõ ràng.
   - Mọi hằng số trạng thái (Status/Enum/Role) phải định nghĩa bằng `enum` hoặc `as const` với giá trị chuỗi TIẾNG ANH VIẾT HOA (ví dụ: `ACTIVE`, `LOCKED`, `COMPLETED`).
2. **Giới hạn độ dài Component:**
   - Không viết "God Component" ôm đồm cả gọi API, xử lý form và hiển thị bảng trong 1 file dài quá 200 dòng.
   - Phải tách riêng: `Page/Container` (điều phối) -> `Table/List` (hiển thị danh sách) -> `FilterBar` (tìm kiếm/lọc) -> `FormModal` (Thêm/Sửa).
3. **4 Trạng thái UI bắt buộc cho mọi màn hình dữ liệu:**
   - `Loading`: Hiển thị Skeleton hoặc Spinner rõ ràng.
   - `Error`: Hiển thị thông báo lỗi thân thiện và nút "Thử lại" (Retry).
   - `Empty`: Hiển thị trạng thái trống (Empty State) khi danh sách không có dữ liệu hoặc không tìm thấy kết quả lọc.
   - `Success/Data`: Hiển thị dữ liệu chuẩn xác.
4. **An toàn khi thao tác Form & Mutation:**
   - Luôn khoá nút Submit (`disabled={isPending}`) khi đang gửi request để chống người dùng bấm đúp (double-submit).
   - Luôn có hộp thoại xác nhận (Confirm Dialog) trước khi thực hiện thao tác Xóa (`DELETE`) hoặc khóa dữ liệu quan trọng.
   - Hiển thị Toast thông báo rõ ràng khi thao tác Thành công hoặc Thất bại (lấy message lỗi chuẩn từ Backend trả về).