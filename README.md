# ⛳ ỨNG DỤNG WEB CHECK-IN GIẢI GOLF ĐẠI HỘI MƯỜNG THANH 2026
> **Sân Golf Tràng An - Ninh Bình • 25.10.2026**  
> Hệ thống quản lý thông tin và thực hiện thủ tục check-in đón tiếp golfer chuyên nghiệp, chạy trực tiếp trên GitHub Pages hoặc Offline.

---

## 🌟 Tính Năng Nổi Bật

1. **Tìm kiếm tức thì (Instant Fuzzy Search):**
   - Hỗ trợ gõ tiếng Việt **có dấu hoặc không dấu** (ví dụ: gõ `than` hoặc `Thản` đều tìm ra ngay).
   - Tìm kiếm linh hoạt theo: Họ tên, Mã VGA, Số điện thoại, Số Flight, Hố xuất phát (`1A`, `18B`...).
   - Phím tắt nhanh: Gõ `/` để tìm kiếm.

2. **Hiển thị thông tin Golfer nổi bật:**
   - 🟩 **Mã VGA**: Font số lớn, dễ nhìn, kèm nút ✏️ để sửa/nhập bổ sung tại chỗ.
   - 🟨 **Size Áo đấu**: Hiển thị kích thước áo (S, M, L, XL, XXL) để lễ tân phát đúng size.
   - 🟦 **Flight & Hố xuất phát**: Ví dụ `Hố 1A • Flight 1`.
   - 🟪 **Giờ xuất phát (Tee-off)**: Phân biệt rõ Ca Sáng (6h00) hay Ca Chiều (11h30).
   - 👥 **Bạn cùng Flight**: Hiển thị danh sách các golfer đánh chung flight.
   - 🏨 **Thông tin khách sạn & VIP**: Cấp VIP1/VIP2, phòng lưu trú, người phụ trách (PIC).

3. **Chỉnh sửa VGA & Size áo trực tiếp:**
   - Khách báo sai hoặc thiếu VGA: Bấm nút ✏️ -> nhập số mới -> Bấm **Lưu** trong 2 giây.

4. **Thủ tục Check-in 1 chạm:**
   - Checklist bàn giao: Áo đấu, Quà lưu niệm (Door gift), Coupon ăn.
   - Nút **"✅ XÁC NHẬN CHECK-IN"**: Lưu chính xác ngày giờ phút giây check-in.
   - Hỗ trợ hoàn tác (↩️ Hủy Check-in) nếu bấm nhầm.

5. **Bảng điều khiển Realtime & Kiểm soát Kho Áo:**
   - Đếm số lượng khách đã check-in / chưa đến.
   - Theo dõi số lượng áo các size (S, M, L, XL, XXL) đã phát và còn tồn kho.

6. **Sao lưu & Xuất dữ liệu:**
   - **Xuất Excel**: Tải file `.xlsx` báo cáo check-in kèm giờ đến và VGA mới nhất.
   - **Sao lưu / Phục hồi JSON**: Chuyển dữ liệu giữa các máy dễ dàng.

---

## 🚀 HƯỚNG DẪN ĐƯA LÊN GITHUB & BẬT GITHUB PAGES (Chỉ mất 2 phút)

### Bước 1: Tạo Repository mới trên GitHub
1. Đăng nhập vào [GitHub](https://github.com).
2. Bấm nút **New** (hoặc dấu `+` góc phải trên) để tạo repository mới.
3. Đặt tên Repo: ví dụ `muong-thanh-golf-checkin`.
4. Để chế độ **Public** và bấm **Create repository**.

### Bước 2: Đẩy (Push) code lên GitHub
Mở cửa sổ dòng lệnh (Terminal / Git Bash) tại thư mục này và chạy các lệnh:

```bash
git init
git add .
git commit -m "Khoi tao Ung dung Check-in Golf Muong Thanh 2026"
git branch -M main
git remote add origin https://github.com/<TEN_TAI_KHOAN_CUA_BAN>/muong-thanh-golf-checkin.git
git push -u origin main
```

*(Hoặc đơn giản: Bạn có thể kéo thả toàn bộ các file trong thư mục này lên giao diện web của GitHub).*

### Bước 3: Bật GitHub Pages
1. Vào mục **Settings** của repository trên GitHub.
2. Ở menu bên trái, chọn **Pages**.
3. Tại phần **Build and deployment** -> **Branch**:
   - Chọn nhánh: **`main`**
   - Chọn thư mục: **`/(root)`**
   - Bấm **Save**.
4. Chờ khoảng 30 - 60 giây, GitHub sẽ cấp cho bạn đường link website trực tiếp:
   👉 **`https://<TEN_TAI_KHOAN>.github.io/muong-thanh-golf-checkin/`**

---

## 📱 SỬ DỤNG TẠI BÀN ĐÓN TIẾP SÂN GOLF
- Nhân viên lễ tân chỉ cần mở đường link GitHub Pages trên **iPad, máy tính bảng hoặc điện thoại**.
- Ứng dụng đã được tích hợp bộ nhớ trình duyệt (**LocalStorage**) nên **khi mất sóng 4G/Wifi vẫn tra cứu và check-in bình thường không bị gián đoạn**.
- Sau khi kết thúc giải, bấm nút **"📊 Xuất Excel"** để lưu toàn bộ danh sách kết quả check-in về máy.

---

## 📁 Cấu trúc thư mục

```text
├── index.html           # File giao diện web chính
├── app.js               # Logic tìm kiếm, check-in, sửa VGA, xuất Excel
├── data.js              # Dữ liệu 177 golfer chuẩn hóa từ file Excel
├── golfers.json         # File dữ liệu JSON gốc
├── tailwind.min.css     # CSS hỗ trợ chạy offline
├── xlsx.full.min.js     # Thư viện xuất nhập Excel offline
├── .nojekyll            # Cấu hình GitHub Pages
├── server.py            # (Tùy chọn) Máy chủ Python chạy mạng LAN nội bộ
└── CHAY_APP_CHECKIN.bat # (Tùy chọn) File chạy 1-click trên máy tính Windows
```
