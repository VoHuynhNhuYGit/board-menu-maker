# School Menu Maker - Trình Tạo Bảng Thực Đơn Tuần Cho Trường Học

Ứng dụng web hoàn chỉnh phục vụ tạo và xuất **ảnh thực đơn theo tuần cho trường học** (tiểu học, mầm non, THCS,...), lưu trữ dữ liệu bằng **MongoDB (NoSQL)**, giao diện xem trước trực quan chuẩn theo mẫu file Word đính kèm (`tuan-3.docx`), cùng tính năng xuất file **ảnh PNG sắc nét** và **PDF chuẩn A4 dọc**.

---

## 🌟 Tính Năng Nổi Bật

### 1. Giao diện trực quan & Chia cột linh hoạt
- **Bên trái**: Biểu mẫu nhập liệu (Tên trường, số tuần, ngày bắt đầu, ngày kết thúc, danh sách các ngày trong tuần).
- **Bên phải**: Tấm bảng thực đơn xem trước trực tiếp (Live Preview), cập nhật tức thì theo thời gian thực khi chỉnh sửa biểu mẫu.
- **Tự động tính thứ**: Chọn ngày từ bộ chọn lịch sẽ tự động tính Thứ (2, 3, 4, 5, 6,...) và định dạng `Ngày D/M` chuẩn, đồng thời vẫn cho phép giáo viên/nhân viên sửa tay khi có nhu cầu đặc thù.
- **Tùy biến ngày linh hoạt**: Dễ dàng thêm ngày, xóa ngày, hoặc di chuyển đổi thứ tự các ngày.

### 2. Gợi ý món ăn thông minh & Lưu trữ MongoDB NoSQL
- **Tìm kiếm không phân biệt dấu tiếng Việt**: Gõ `ga kho sa` vẫn tìm thấy chính xác món `Gà kho sả`.
- **Thêm món mới linh hoạt**: Cho phép nhập tay món ăn mới. Khi bấm **Lưu thực đơn**, hệ thống tự động phát hiện các món mới và lưu vào cơ sở dữ liệu MongoDB, cam kết **không tạo bản ghi trùng lặp** cho cùng một tên món.
- **Kho quản lý món ăn**: Giao diện Modal trực quan để xem danh sách món ăn, tìm kiếm nhanh, thêm mới, sửa tên món/phân loại, và xóa món khỏi cơ sở dữ liệu MongoDB thông qua API RESTful.
- **Sắp xếp & chỉnh sửa món**: Trong mỗi bữa (Bữa chính, Bữa phụ), người dùng có thể đổi thứ tự món (Lên/Xuống), sửa tên trực tiếp hoặc xóa món.

### 3. Xem trước chuẩn mẫu Word & Xuất file chuyên nghiệp
- Bố cục trung thực tuyệt đối với mẫu `tuan-3.docx`:
  - Tiêu đề: `THỰC ĐƠN TRƯỜNG TIỂU HỌC [TÊN TRƯỜNG]`
  - Dòng tuần: `TUẦN [SỐ]`
  - Khoảng ngày: `Từ ngày [Bắt đầu] đến ngày [Kết thúc]`
  - Bảng 2 cột: Cột 1 là **THỨ** (gồm số thứ và ngày), cột 2 là **THỰC ĐƠN** (phân định rõ ràng **Bữa chính** và **Bữa phụ**).
  - Khoảng cách, đường kẻ viền và cỡ chữ được cân chỉnh thanh lịch, chuẩn mực sư phạm.
- **Nút "Tải ảnh PNG"**: Xuất file ảnh độ phân giải siêu nét (scale 2.5x), sẵn sàng chia sẻ lên Zalo phụ huynh hoặc in ấn.
- **Nút "Tải file PDF"**: Tạo file PDF chuẩn khổ A4 dọc, tự động nhúng font tiếng Việt UTF-8 sắc nét, không bị lỗi font hay cắt mất nội dung.
- Hoàn toàn loại bỏ mọi nút bấm hay giao diện chỉnh sửa trên file xuất ra.

### 4. Lưu và Mở lại thực đơn
- Nút **Lưu thực đơn** lưu trực tiếp vào cơ sở dữ liệu MongoDB. Dữ liệu vĩnh viễn tồn tại sau khi tải lại trang hoặc khởi động lại máy.
- Modal **Thực đơn đã lưu**: Xem danh sách toàn bộ các thực đơn đã lập theo tên trường, tuần và khoảng ngày.
- Chức năng **Mở sửa**: Nạp thực đơn vào form để chỉnh sửa và cập nhật tiếp.
- Chức năng **Nhân bản (Clone)**: Sao chép toàn bộ thực đơn thành một bản nháp mới cho tuần tiếp theo, tiết kiệm thời gian nhập liệu.

### 5. Dữ liệu mẫu khởi tạo (Tuần 3)
Hệ thống tự động kích hoạt bộ dữ liệu mẫu theo yêu cầu:
- **Trường**: Trường Tiểu học Trưng Vương
- **Tuần**: 3
- **Thời gian**: Từ ngày 28/9/2026 đến ngày 1/10/2026
- **Chi tiết từng ngày**:
  - **Thứ 2 (28/9)**: Bữa chính: Gà kho sả, Canh khoai mỡ thịt bằm, Rau cải thìa xào, Cơm trắng. Bữa phụ: Sữa.
  - **Thứ 3 (29/9)**: Bữa chính: Nạc dăm kho đậu hủ, Canh cải ngọt thịt băm, Bông cải cà rốt xào, Cơm trắng. Bữa phụ: Sữa.
  - **Thứ 4 (30/9)**: Bữa chính: Phi lê cá điêu hồng chiên giòn, Đậu que xào, Canh chua, Cơm trắng. Bữa phụ: Sữa.
  - **Thứ 5 (1/10)**: Bữa chính: Nui xào bò băm + chả lụa, Rau củ quả. Bữa phụ: Sữa.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Next.js 14, TypeScript, Lucide Icons.
- **Styling**: Vanilla CSS cao cấp với hệ thống token màu sắc, typography Be Vietnam Pro & Merriweather, hỗ trợ responsive hoàn hảo.
- **Backend**: Next.js App Router Server Endpoints (`/api/menus`, `/api/dishes`, `/api/seed`).
- **Database (NoSQL)**: MongoDB & Mongoose.
  - Hỗ trợ kết nối với MongoDB cài trên máy hoặc MongoDB Atlas thông qua biến môi trường `MONGODB_URI`.
  - **Cơ chế tự động fallback**: Nếu máy chưa khởi động service MongoDB, hệ thống tự động khởi tạo **Embedded MongoDB Server** ngầm, giúp ứng dụng chạy được 100% ngay lập tức mà không cần cài đặt thêm phần mềm bên ngoài.
- **Xử lý xuất file**: `html-to-image` (PNG siêu nét 2.5x) và `jspdf` (PDF khổ A4 dọc).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
File `.env.local` hoặc `.env.example`:
```env
# Nếu sử dụng MongoDB cục bộ hoặc Atlas:
# MONGODB_URI=mongodb://127.0.0.1:27017/school_menu
PORT=3000
```
*(Nếu bỏ trống `MONGODB_URI`, ứng dụng sẽ tự động kích hoạt MongoDB Engine nhúng sẵn)*.

### 3. Chạy ở chế độ phát triển (Development)
```bash
npm run dev
```
Truy cập tại: [http://localhost:3000](http://localhost:3000)

### 4. Build và chạy sản phẩm (Production)
```bash
npm run build
npm run start
```

---

## 📡 Danh Sách API Endpoints

- `GET /api/dishes?search=...`: Lấy danh sách món ăn, hỗ trợ tìm kiếm không dấu.
- `POST /api/dishes`: Thêm món ăn mới vào kho dữ liệu MongoDB.
- `PUT /api/dishes/[id]`: Cập nhật tên và phân loại món ăn.
- `DELETE /api/dishes/[id]`: Xóa món ăn khỏi kho dữ liệu.
- `GET /api/menus`: Lấy danh sách thực đơn đã lưu (sắp xếp theo thời gian mới nhất).
- `GET /api/menus/[id]`: Lấy chi tiết một thực đơn theo ID.
- `POST /api/menus`: Tạo thực đơn mới và tự động trích xuất món mới vào kho món ăn.
- `PUT /api/menus/[id]`: Cập nhật thực đơn đã lưu.
- `DELETE /api/menus/[id]`: Xóa thực đơn khỏi cơ sở dữ liệu.
- `POST /api/seed`: Khởi tạo / đặt lại dữ liệu mẫu Tuần 3 và kho món ăn ban đầu.
