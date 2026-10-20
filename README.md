# 📱 Ứng Dụng Quản Lý Chi Tiêu Chuẩn PWA (Fintech Style)

Ứng dụng quản lý tài chính cá nhân được thiết kế chuẩn **PWA (Progressive Web App)**, tối ưu cho cả **Điện thoại** (Mobile) và **Laptop** (Web Responsive), giao diện chuẩn phong cách Modern Fintech lấy cảm hứng trực tiếp từ các bản thiết kế Dribbble.

---

## 🌟 Tính Năng Nổi Bật

1. **Chuẩn PWA (Progressive Web App):**
   - Cài đặt như ứng dụng gốc trực tiếp từ trình duyệt trên **iPhone, Android, Windows, macOS**.
   - Có Service Worker hỗ trợ hoạt động offline mượt mà.

2. **Giao diện & Trải nghiệm (UI/UX):**
   - **Thẻ Hero Balance Card:** Hiển thị tổng tài sản ròng, số dư khả dụng, biến động tháng (+12.5%), nút bật/tắt mắt để ẩn số tiền bí mật (`••••••••`).
   - **4 Nút Thao tác nhanh:** `+ Chi tiêu`, `+ Thu nhập`, `Ví & Thẻ`, `Mục tiêu`.
   - **Thanh tiến độ hạn mức chi tiêu tháng:** Trực quan hóa % ngân sách còn lại.
   - **Mục tiêu tài chính (Savings Goals):** Đặt mục tiêu du lịch, mua nhà, học tập với thanh % tiến độ và nút nạp tích lũy nhanh.
   - **Biểu đồ Báo cáo trực quan (Chart.js):** 
     - Biểu đồ tròn Donut phân bổ danh mục chi tiêu (Ăn uống, Mua sắm, Di chuyển, Hóa đơn...).
     - Biểu đồ cột chi tiêu 7 ngày trong tuần.
   - **Thanh Dock điều hướng nổi (Floating Bottom Dock):** Chuẩn phong cách iOS trên điện thoại; tự động chuyển thành Sidebar sang trọng trên màn hình Laptop lớn.
   - **Chế độ Sáng / Tối (Dark / Light Mode):** Chuyển đổi 1 chạm mượt mà.

3. **Bảo mật truy cập (Mã PIN):**
   - Màn hình bàn phím số khóa ứng dụng khi mở.
   - **Mã PIN mặc định:** `1234` (Có nút *Bỏ qua* khi cần thao tác nhanh và có thể đổi PIN mới trong mục Cài đặt).

4. **Cơ sở dữ liệu Public (database.json):**
   - Tệp [database.json](./database.json) công khai lưu sẵn các ví mẫu, danh mục, mục tiêu và giao dịch mẫu.
   - Lưu trữ tức thì vào `localStorage` trên trình duyệt.
   - Hỗ trợ **Tải xuống (Export) database.json** để bạn commit cập nhật lên GitHub.
   - Hỗ trợ **Đồng bộ từ URL GitHub (Public Raw URL)** để tải dữ liệu mới nhất về máy khác.

---

## 📂 Danh Sách Các File Đã Tạo

```text
Voice Book Studio/
├── index.html       # Toàn bộ mã nguồn giao diện PWA, logic, Tailwind CSS, Chart.js
├── database.json    # Cơ sở dữ liệu mẫu công khai (Public database)
├── manifest.json    # Cấu hình PWA Web App Manifest để cài đặt lên màn hình chính
├── sw.js            # Service Worker xử lý bộ nhớ đệm và offline
├── icon.svg         # Icon ứng dụng định dạng SVG chất lượng cao
└── README.md        # Hướng dẫn chi tiết
```

---

## 🚀 Hướng Dẫn Đưa Lên GitHub & Bật GitHub Pages (Chỉ Mất 1 Phút)

Bạn không cần build hay cài đặt `npm`. Chỉ cần đưa các tệp này lên GitHub repository:

### Bước 1: Đẩy code lên GitHub
Mở terminal trong thư mục này và chạy:
```bash
git init
git add .
git commit -m "Khoi tao App quan ly chi tieu PWA"
git branch -M main
git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/TÊN_REPO.git
git push -u origin main
```

### Bước 2: Bật GitHub Pages để truy cập Web & Điện thoại
1. Vào repository của bạn trên GitHub.
2. Chọn tab **Settings** (Cài đặt) > Mục **Pages** (ở cột bên trái).
3. Tại phần **Build and deployment** > **Source**, chọn nhánh `main` và thư mục `/(root)`.
4. Bấm **Save**. 
5. Sau khoảng 30 giây, GitHub sẽ cấp cho bạn một đường link web dạng:
   👉 `https://tên-github.github.io/tên-repo/`

---

## 📲 Hướng Dẫn Cài Đặt Lên Điện Thoại & Laptop

- **Trên iPhone (Safari):** 
  Truy cập link GitHub Pages > Bấm nút **Chia sẻ** (icon mũi tên chỉ lên) > Chọn **"Thêm vào MH chính" (Add to Home Screen)**.
- **Trên Android (Chrome):** 
  Truy cập link > Bấm menu **3 chấm** > Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
- **Trên Laptop (Chrome / Edge / Safari):** 
  Nhìn vào góc phải thanh địa chỉ URL sẽ thấy nút **Cài đặt ứng dụng (Install App)** > Bấm cài đặt để chạy thành cửa sổ app riêng độc lập.
