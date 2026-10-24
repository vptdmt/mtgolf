# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG CHECK-IN GIẢI GOLF ĐẠI HỘI MƯỜNG THANH 2026
**Địa điểm:** Sân Golf Tràng An, Ninh Bình  
**Thời gian:** Ngày 25.10.2026

---

## 1. Cách khởi chạy ứng dụng

### Cách 1: Chạy trực tiếp 1-Click (Khuyên dùng khi bàn đón tiếp có mạng LAN / Wi-Fi)
1. Nhấp đúp chuột vào file **`CHAY_APP_CHECKIN.bat`**.
2. Trình duyệt sẽ tự động mở trang web check-in tại địa chỉ: `http://localhost:8080`.
3. Màn hình đen (Command Prompt) sẽ hiển thị địa chỉ IP nội bộ của máy (ví dụ: `http://192.168.1.15:8080`).
   - Các nhân viên khác cầm **iPad, iPhone, máy tính bảng Android** chỉ cần kết nối cùng mạng Wi-Fi và gõ địa chỉ trên là có thể cùng làm thủ tục check-in đồng thời!
   - Dữ liệu check-in và sửa số VGA sẽ được đồng bộ tự động giữa các máy.

### Cách 2: Chạy độc lập hoàn toàn Offline (Không cần mở server, không cần mạng)
- Nhấp đúp trực tiếp vào file **`index.html`** để mở trên bất kỳ trình duyệt nào (Google Chrome, Microsoft Edge, Safari, Firefox).
- Ứng dụng đã được tích hợp sẵn toàn bộ dữ liệu 177 golfer, thư viện giao diện và xuất file Excel nội bộ mà không cần kết nối internet.

---

## 2. Các chức năng chính tại quầy đón tiếp

### 🔍 1. Tìm kiếm nhanh Golfer (Gõ không dấu hoặc có dấu)
- Đặt con trỏ vào ô tìm kiếm hoặc nhấn phím tắt `/` trên bàn phím.
- Nhập bất kỳ thông tin nào của khách:
  - **Họ và tên**: ví dụ gõ `than` hoặc `Thản`, `song`, `hường`...
  - **Số VGA**: ví dụ gõ `35001`, `90036`...
  - **Số điện thoại**: ví dụ gõ `0989...`
  - **Số Flight hoặc Hố**: ví dụ gõ `1A`, `18B`, `Flight 2`...
  - **Đơn vị / Chức vụ**: ví dụ gõ `Cienco5`, `Tập đoàn`...

### 📋 2. Xem thông tin Golfer
Mỗi thẻ Golfer hiển thị đầy đủ và nổi bật các thông tin quan trọng nhất:
- **Mã VGA**: Hiển thị to rõ ở ô màu xanh lá. Nếu khách chưa có VGA hoặc VGA sai, bấm nút ✏️ để sửa.
- **Size Áo đấu**: Hiển thị kích cỡ áo giải (S, M, L, XL, XXL) để nhân viên lấy đúng áo trao cho khách.
- **Flight & Hố xuất phát**: Ví dụ `Hố 1A • Flight 1`.
- **Giờ xuất phát (Tee-off)**:
  - 🌅 **Ca Sáng**: Shotgun 6h00 ngày 25/10/2026 (Flight 1 đến 7)
  - ☀️ **Ca Chiều**: Shotgun 11h30 ngày 25/10/2026 (Flight 1 đến 34)
- **Danh sách bạn cùng Flight**: Hiển thị đầy đủ tên các golfer thi đấu cùng nhóm để lễ tân giải đáp khi khách hỏi.
- **Thông tin bổ trợ**: Khách VIP (VIP1, VIP2), Đơn vị công tác, Số điện thoại, Phòng lưu trú khách sạn, Người phụ trách (PIC).

### ✏️ 3. Chỉnh sửa số VGA & Đổi Size áo
1. Bấm nút **"✏️ Sửa VGA / Info"** trên thẻ của golfer.
2. Cửa sổ sửa hiện ra:
   - Nhập lại **Số VGA** mới do khách cung cấp.
   - Chọn lại **Size áo** nếu khách muốn đổi kích cỡ tại bàn.
   - Nhập thêm số điện thoại hoặc ghi chú đặc biệt (nếu có).
3. Bấm **"Lưu thay đổi"**. Dữ liệu được lưu ngay lập tức và tự động cập nhật vào danh sách xuất Excel.

### ✅ 4. Quy trình làm thủ tục Check-in
1. Khi khách đến bàn, đối chiếu tên và thông tin.
2. Tích chọn các mục bàn giao:
   - ☑️ **Áo đấu**: Đã trao áo đúng size cho khách.
   - ☑️ **Door Gift**: Đã trao túi quà lưu niệm của giải.
   - ☑️ **Coupon ăn**: Đã phát phiếu ăn trưa/tối.
3. Bấm nút màu xanh **"✅ XÁC NHẬN CHECK-IN"**:
   - Thẻ chuyển sang màu xanh lá với huy hiệu **"ĐÃ CHECK-IN"**.
   - Hệ thống tự động ghi lại thời gian check-in chính xác đến từng giây (ví dụ: `05:42:15 25/10`).
   - Nếu bấm nhầm, lễ tân có thể bấm **"↩️ Hủy Check-in"** để hoàn tác.

### 📊 5. Thống kê & Xuất Báo cáo Excel
- **Thanh tiến độ**: Xem trực tiếp số lượng golfer đã check-in / chưa đến của Ca Sáng, Ca Chiều và Khách VIP.
- **Kho Áo đấu**: Hiển thị số lượng áo từng size (S, M, L, XL, XXL) đã phát và số lượng còn lại để kiểm soát kho.
- **Nút "Xuất Excel Check-in"**: Bấm vào nút này bất kỳ lúc nào để tải về file Excel báo cáo tiến độ check-in mới nhất, có đầy đủ giờ check-in và số VGA đã được cập nhật.
