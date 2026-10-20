# 📱 Ứng Dụng Quản Lý Chi Tiêu Chuẩn PWA (Fintech Style)

Ứng dụng quản lý tài chính cá nhân được thiết kế chuẩn **PWA (Progressive Web App)**, tối ưu cho cả **Điện thoại** (Mobile) và **Laptop** (Web Responsive), giao diện chuẩn phong cách Modern Fintech lấy cảm hứng trực tiếp từ các bản thiết kế Dribbble.

---

## 🌟 Tính Năng Nổi Bật Mới Cập Nhật

1. **Thẻ liên kết trực tiếp với Ví thanh toán (Không cần số dư):**
   - Không bắt buộc phải nạp tiền hay có số dư ảo trong ví/thẻ.
   - Thêm Thẻ/Ví (Ngân hàng, Thẻ tín dụng, Ví MoMo, Tiền mặt...) để liên kết phương thức khi ghi chép thu chi.
   - Theo dõi tự động tổng số tiền đã chi tiêu qua từng thẻ.

2. **Báo cáo & Thống kê linh hoạt theo Ngày / Tháng / Năm:**
   - Chọn xem thống kê theo: **Theo Ngày** (kèm bộ chọn ngày và nút chuyển ngày), **Theo Tháng** (chuyển tháng trước/sau), **Theo Năm**, hoặc **Toàn bộ thời gian**.
   - Thống kê 3 chỉ số chính: Tổng chi, Tổng thu, Dòng tiền thuần (Thu - Chi).
   - Biểu đồ Donut phân bổ danh mục và Biểu đồ cột diễn biến chi tiêu cập nhật thời gian thực theo kỳ đã chọn.
   - Danh sách chi tiết toàn bộ giao dịch trong khoảng thời gian đã chọn.

3. **Chỉnh sửa & Xóa toàn diện (Full CRUD):**
   - **Thẻ / Ví:** Cho phép Sửa tên, loại, 4 số cuối, màu sắc hoặc Xóa.
   - **Mục tiêu tích lũy:** Cho phép Sửa tên, số tiền mục tiêu, số tiền đã có, hạn chót hoặc Xóa.
   - **Giao dịch:** Cho phép Sửa số tiền, loại (thu/chi), danh mục, thẻ thanh toán, thời gian, ghi chú hoặc Xóa.

4. **Hạn mức chi tiêu mỗi ngày & Popup thông báo thông minh:**
   - Cài đặt hạn mức chi tiêu mỗi ngày (ví dụ: 500.000 ₫/ngày) trong mục Cài đặt.
   - Thanh tiến độ chi tiêu hôm nay trực quan ngay trên Trang chủ (báo rõ đã chi, còn lại, hoặc vượt hạn mức).
   - Tự động kích hoạt **Popup Thông báo riêng**:
     - Cảnh báo khi sắp chạm hạn mức (>= 80%) hoặc đã vượt hạn mức ngày.
     - **Quy tắc lưu & xóa:** Thông báo chưa xem sẽ **cứ thông báo tiếp**; thông báo sau khi người dùng bấm *"Đã xem"* sẽ bắt đầu đếm và **tự động xóa sau đúng 3 ngày**.
     - Chuông thông báo trên thanh tiêu đề hiển thị số lượng cảnh báo chưa xem.

5. **Cơ sở dữ liệu mới tinh (Clean Database):**
   - File [database.json](./database.json) trắng tinh, sẵn sàng sử dụng ngay mà không còn dữ liệu mẫu cũ.
   - Hỗ trợ Xuất/Nhập file JSON và đồng bộ từ GitHub URL.

6. **Thời gian ghi nhận giao dịch chuẩn xác từng phút:**
   - Trường nhập thời gian tự động lấy chính xác giờ địa phương trên máy tính/điện thoại, không còn lỗi lệch múi giờ UTC.

---

## 📂 Danh Sách Các File Trong Dự Án

```text
App chi tiêu/
├── index.html       # Toàn bộ mã nguồn giao diện PWA, logic, Tailwind CSS, Chart.js
├── database.json    # Cơ sở dữ liệu sạch (Clean Database)
├── manifest.json    # Cấu hình PWA Web App Manifest
├── sw.js            # Service Worker xử lý bộ nhớ đệm và offline
├── icon.svg         # Icon ứng dụng định dạng SVG
└── README.md        # Tài liệu hướng dẫn
```

---

## 🚀 Hướng Dẫn Sử Dụng & Trải Nghiệm Ngay

1. Nhấp đúp mở file [**index.html**](./index.html) bằng trình duyệt (Google Chrome, Microsoft Edge, Safari...).
2. Mã PIN mặc định là: **`1234`** (hoặc bấm **"Bỏ qua"** để vào nhanh).
3. Bắt đầu bằng việc thêm Thẻ/Ví đầu tiên ở tab **Ví & Thẻ**, sau đó ghi chép các khoản chi tiêu hàng ngày.
