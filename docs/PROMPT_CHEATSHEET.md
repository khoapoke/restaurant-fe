# SỔ TAY PROMPT VIBE CODE NHANH (COPY & PASTE)

## MẪU 1: KHI BẮT ĐẦU MỘT MODULE MỚI (Ép AI lên kế hoạch và hỏi trước)
Copy đoạn dưới đây, điền thông tin API/Nghiệp vụ vào ngoặc vuông rồi gửi cho Agent:

> Hãy đọc kỹ quy tắc trong `@CLAUDE.md` (hoặc `@docs/AGENT_RULES.md`) và `@docs/FE_ARCHITECTURE.md`.
> 
> Tôi cần xây dựng phần Frontend cho module: **[Tên module, ví dụ: Quản lý Sản phẩm]**.
> 
> **Các chức năng CRUD cần làm:**
> 1. Xem danh sách (có phân trang, tìm kiếm từ khóa, lọc theo trạng thái).
> 2. Thêm mới.
> 3. Cập nhật thông tin.
> 4. Xóa / Đổi trạng thái.
> 
> **Thông tin API / Dữ liệu từ Backend hiện có:**
> - [Dán JSON mẫu, DTO từ Backend hoặc danh sách API endpoint của bạn vào đây]
> 
> **YÊU CẦU PHA 1 (CHƯA VIẾT CODE):**
> Hãy phân tích yêu cầu trên, chỉ ra những điểm còn thiếu hoặc chưa rõ về API/UI, đánh giá các rủi ro kỹ thuật có thể phát sinh trong tương lai, đề xuất danh sách file sẽ tạo, và đặt câu hỏi để tôi xác nhận trước khi code.

---

## MẪU 2: DUYỆT KẾ HOẠCH & CHO PHÉP VIẾT CODE TỪNG PHẦN
Sau khi bạn trả lời xong các câu hỏi của AI ở Mẫu 1, dùng câu này để giữ cho AI không viết ẩu một lúc quá nhiều file:

> Các thông tin xác nhận như sau:
> 1. [Trả lời câu hỏi 1 của AI]
> 2. [Trả lời câu hỏi 2 của AI]
> 
> Bây giờ hãy chuyển sang **PHA 2: THỰC THI**. Tuy nhiên, để đảm bảo chất lượng, hãy làm theo đúng 2 bước sau:
> - **Bước 2.1 (Làm ngay bây giờ):** Chỉ viết các file `types`, `schemas` (Zod) và `services` (gọi API) trước. Đảm bảo tất cả các Enum/Status viết hoa tiếng Anh chuẩn xác. Xong bước này dừng lại để tôi kiểm tra.
> - **Bước 2.2 (Làm sau khi tôi duyệt Bước 2.1):** Viết các UI Components (Table, Filter, Form Modal) và ghép nối vào Page.

---

## MẪU 3: KHI AI CODE XONG HOẶC SỬA LỖI (Ép AI tự kiểm tra rủi ro)
Khi thấy AI vừa sửa một lỗi hoặc viết xong một tính năng phức tạp, dùng câu này để chặn đứng kiểu "chữa cháy tạm bợ":

> Hãy rà soát lại đoạn code bạn vừa viết:
> 1. Cách xử lý này là giải pháp căn cơ (root-cause fix) hay chỉ là vá tạm thời? Có gây rủi ro gì khi dữ liệu lớn lên hoặc khi mở rộng thêm tính năng khác trong tương lai không?
> 2. Đã xử lý đủ các trường hợp lỗi mạng (API error), dữ liệu rỗng (Empty state), và chống double-click khi submit chưa?
> Nếu còn điểm nào chưa đạt chuẩn kiến trúc trong `@docs/FE_ARCHITECTURE.md`, hãy liệt kê và hoàn thiện lại ngay.