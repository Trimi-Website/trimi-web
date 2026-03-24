# 🛍️ Trimi - Nền tảng E-Commerce Local Brand Thế Hệ Mới

Trimi không chỉ là một website bán quần áo Local Brand thông thường, mà là một trải nghiệm mua sắm tích hợp Mạng xã hội và Trợ lý Trí tuệ Nhân tạo (AI). Dự án được thiết kế với giao diện mang hơi hướng tương lai, tối ưu hóa cực tốt cho cả Mobile và Desktop.

## ✨ Tính năng nổi bật

### 1. 🤖 Trợ lý AI "Trimi-ni" (Tích hợp Gemini AI)
- Chatbot AI thông minh đóng vai trò là một Stylist Gen Z.
- Tự động nhận diện ngữ cảnh, tư vấn phối đồ, báo giá sản phẩm và hỗ trợ giải đáp thắc mắc.
- **Bảo mật & Tối ưu:** Hệ thống xoay tua API Keys tự động và giới hạn số lượt hỏi trong ngày để tối ưu chi phí.

### 2. 🎨 Trải nghiệm UI/UX Đột Phá
- **Dark/Light Mode:** Chuyển đổi giao diện mượt mà với hiệu ứng View Transitions API (Vòng tròn lan tỏa).
- **Little Trimi (Mobile):** Quả cầu ma thuật điều hướng ở đáy màn hình. Người dùng có thể kéo thả để chọn Tab, tùy biến màu sắc và hiệu ứng (Sóng dâng, Nhịp đập...) ngay trong phần Cài đặt.
- **Responsive 100%:** Giao diện tự động biến đổi thông minh giữa PC (Header bar ngang) và Mobile (Bottom Nav, Unified Drawer Menu).

### 3. 🛒 Mua sắm & Thanh toán
- Lọc sản phẩm theo danh mục và Tags.
- Giỏ hàng động, tính toán phí ship theo khu vực (Đà Nẵng freeship một số quận).
- Hỗ trợ thanh toán Cọc 30% hoặc Full 100%.
- Tính năng **Upload Biên lai chuyển khoản** để hệ thống xác nhận.

### 4. 👥 Mạng xã hội Thu nhỏ
- Xem hồ sơ người dùng khác, gửi lời mời kết bạn, đồng ý/từ chối.
- Nhắn tin trực tiếp thời gian thực (P2P Chat) giữa các người dùng với nhau.
- Hệ thống thông báo (Notification Bell) thời gian thực: Báo đơn hàng mới, tin nhắn, lời mời kết bạn với Popup/Modal chuyên nghiệp.

### 5. 👑 Hệ thống Phân quyền (Role-based) Đa Dạng
- **Khách hàng:** Mua sắm, đánh giá đơn hàng (Rating 5 sao), báo cáo lỗi đơn hàng (Report Issue).
- **Shipper:** Có không gian làm việc riêng để xem các đơn được giao, xác nhận đã giao hàng kèm hình ảnh minh chứng.
- **Admin (Quản trị kho):** - Thêm/Sửa/Xóa sản phẩm (hỗ trợ upload nhiều ảnh, nén ảnh tự động).
  - Quản lý đơn đặt hàng, thay đổi trạng thái, chỉ định Shipper trực tiếp.
  - Cấp quyền Shipper cho người dùng bằng UID.
  - Biểu đồ thống kê doanh thu (Theo Ngày/Tháng/Năm) trực quan.
  - Quản lý phản hồi, khiếu nại và xem kết quả khảo sát người dùng.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React (Vite), Tailwind CSS
- **Backend/BaaS:** Firebase (Authentication, Firestore Database, Storage)
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash)
- **Icons:** React Icons
- **Image Processing:** Thuật toán nén ảnh gốc bằng Canvas API (giảm dung lượng trước khi upload).

## 🚀 Hướng dẫn cài đặt và chạy dự án

**Bước 1: Clone kho lưu trữ**
```bash
git clone [https://github.com/your-username/trimi-web.git](https://github.com/your-username/trimi-web.git)
cd trimi-web