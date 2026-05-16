# Kế hoạch triển khai: Refactor Luồng Quản lý Chiến dịch (Master-Detail) - [HOÀN THÀNH]

Mục tiêu là đồng bộ luồng công việc của Admin theo mô hình Master-Detail chuẩn. Admin sẽ chọn một chiến dịch cụ thể từ danh sách để duyệt các đơn đăng ký của chiến dịch đó.

## 1. Backend (Laravel)

### Cập nhật `CampaignController.php`
- Chỉnh sửa phương thức `registrations` để nhận thêm tham số `campaign_id`.
- Nếu có `campaign_id`, thực hiện lọc bản ghi `DangKyChienDich` theo ID này.
- Đảm bảo trả về đúng dữ liệu thống kê liên quan nếu cần.

## 2. Frontend (React)

### Chỉnh sửa `Campaigns.jsx`

#### A. Màn hình Danh sách Chiến dịch (`view="list"`)
- Thêm cột thao tác hoặc nút bấm: **[Xem danh sách đăng ký]**.
- Khi bấm vào nút này, chuyển hướng sang `/admin/campaigns/registrations?campaign_id={id}`.
- Sử dụng `useNavigate` từ `react-router-dom` để điều hướng.

#### B. Màn hình Duyệt Đăng ký (`view="registrations"`)
- Sử dụng `useSearchParams` để lấy `campaign_id` từ URL.
- Cập nhật hàm `loadRegistrations` để truyền `campaign_id` vào API call.
- **Giao diện**:
    - Hiển thị tiêu đề rõ ràng: "Duyệt đăng ký cho: [Tên Chiến Dịch]".
    - Thêm nút **[Quay lại danh sách]** để quay về màn hình cha.
    - Ẩn các thông tin lặp lại (như tên chiến dịch trong từng dòng của bảng) để tăng diện tích hiển thị nếu đang ở chế độ lọc theo 1 chiến dịch.
    - Khối thống kê chi tiết phía dưới phải phản ánh đúng dữ liệu của chiến dịch đang được lọc.

## 3. Kế hoạch kiểm thử (Verification)

1. **Truy cập Danh sách**: Vào `admin/campaigns/list`, chọn một chiến dịch bất kỳ và bấm "Xem danh sách đăng ký".
2. **Kiểm tra Lọc**: Xác nhận URL có chứa `campaign_id` và bảng chỉ hiện các shop đăng ký đúng chiến dịch đó.
3. **Kiểm tra Thống kê**: Xác nhận các con số "Đã duyệt", "Chờ duyệt", "Từ chối" khớp với số lượng dòng trong bảng.
4. **Kiểm tra Quay lại**: Bấm nút quay lại và xác nhận hệ thống đưa về đúng trang danh sách cha.
