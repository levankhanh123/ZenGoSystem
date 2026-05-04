# Giao Diện Người Giao Hàng (Shipper) - ZenGo System

## 📋 Giới Thiệu

Giao diện này được thiết kế dành cho người giao hàng (Shipper) với các chức năng quản lý đơn hàng, cập nhật trạng thái, quản lý tài khoản, và đối soát.

## 🎯 Các Chức Năng Chính

### 1. **Dashboard**
- Tổng quan hiệu suất hôm nay
- Thống kê: Tổng đơn, Đã giao, Chờ giao, Doanh thu
- Danh sách đơn hàng gần đây
- Tiện ích nhanh
- Thông tin tài khoản

**Route:** `GET /shipper/dashboard`

### 2. **Quản Lý Đơn Hàng**
- Danh sách tất cả đơn hàng
- Tìm kiếm & Lọc theo trạng thái, ngày tháng
- Chi tiết đơn hàng
- Cập nhật trạng thái
- Timeline trạng thái trực quan

**Routes:**
- `GET /shipper/orders` - Danh sách
- `GET /shipper/orders/{id}` - Chi tiết
- `PUT /shipper/orders/{id}/status` - Cập nhật trạng thái

### 3. **Cập Nhật Trạng Thái**
Các trạng thái có thể:
- ✓ Pending (Chờ xác nhận)
- ✓ Confirmed (Đã xác nhận)
- ✓ Picking Up (Đang lấy hàng)
- ✓ Picked Up (Đã lấy hàng)
- ✓ In Transit (Đang vận chuyển)
- ✓ Delivering (Đang giao)
- ✓ Delivered (Đã giao thành công)
- ✓ Failed (Giao thất bại)

**Route:** `PUT /shipper/orders/{id}/status`

### 4. **Quản Lý Tài Khoản**
- Xem/Cập nhật thông tin cá nhân
- Đổi ảnh đại diện
- Đổi mật khẩu
- Xem thông tin phương tiện

**Routes:**
- `GET /shipper/account` - Trang quản lý
- `PUT /shipper/account/update` - Cập nhật thông tin
- `POST /shipper/account/change-password` - Đổi mật khẩu

### 5. **Đối Soát**
- Xem tất cả kỳ đối soát
- Tìm kiếm & Lọc theo ngày, trạng thái
- Chi tiết kỳ đối soát
- Thống kê: Tổng doanh thu, Đã nhận, Còn nợ
- In báo cáo

**Routes:**
- `GET /shipper/reconciliation` - Danh sách
- `GET /shipper/reconciliation/{id}` - Chi tiết

### 6. **Lịch Sử Giao Hàng**
- Xem lịch sử tất cả đơn hàng hoàn thành
- Lọc theo tháng/năm
- Thống kê: Tổng đơn, Thành công, Thất bại, Doanh thu

**Route:** `GET /shipper/history`

### 7. **Thống Kê & Hiệu Suất**
- Tổng đơn giao, Đơn thành công, Đơn thất bại
- Biểu đồ hiệu suất
- Đánh giá trung bình
- Thống kê doanh thu
- Mục tiêu vs Thực tế

**Route:** `GET /shipper/statistics`

## 📁 Cấu Trúc File

```
backend/
├── app/
│   ├── Http/Controllers/Shipper/
│   │   └── ShipperController.php
│   ├── Models/
│   │   ├── DoiSoatShipper.php (đã tồn tại)
│   │   └── LichSuTrangThaiDonHang.php (đã tồn tại)
│
├── routes/
│   └── shipper.php (routes cho shipper)
│
├── resources/
│   ├── views/shipper/
│   │   ├── layouts/
│   │   │   └── app.blade.php
│   │   ├── dashboard.blade.php
│   │   ├── orders/
│   │   │   ├── list.blade.php
│   │   │   └── detail.blade.php
│   │   ├── account/
│   │   │   └── profile.blade.php
│   │   ├── reconciliation/
│   │   │   ├── index.blade.php
│   │   │   └── detail.blade.php
│   │   ├── history/
│   │   │   └── index.blade.php
│   │   └── statistics.blade.php
│   └── lang/vi/
│       └── shipper.php
│
└── database/
    └── migrations/
        └── 2026_05_04_000000_create_shipper_tables.php
```

## 🚀 Installation

### 1. Cập nhật Database
```bash
php artisan migrate
```

### 2. Thêm Shipper Controller
Controller đã được tạo tại: `app/Http/Controllers/Shipper/ShipperController.php`

### 3. Thêm Routes
Routes đã được tạo tại: `routes/shipper.php` và include vào `routes/api.php`

### 4. Tạo Views
Tất cả views đã được tạo trong thư mục `resources/views/shipper/`

## 🔐 Middleware & Authentication

Tất cả routes được bảo vệ bởi middleware:
- `auth:sanctum` - Xác thực người dùng
- Chỉ shipper có quyền truy cập

## 📊 Các Truy Vấn SQL Cơ Bản

### Lấy danh sách đơn hàng của Shipper
```sql
SELECT gh.*, dh.ma_don_hang, dh.ten_nguoi_nhan
FROM giao_hang gh
JOIN don_hang dh ON gh.don_hang_id = dh.id
WHERE gh.nguoi_giao_hang_id = ?
ORDER BY gh.created_at DESC
```

### Lấy doanh thu của Shipper
```sql
SELECT SUM(dh.phi_giao_hang) as tong_doanh_thu
FROM giao_hang gh
JOIN don_hang dh ON gh.don_hang_id = dh.id
WHERE gh.nguoi_giao_hang_id = ? 
  AND gh.trang_thai = 'delivered'
```

### Lấy đối soát
```sql
SELECT * FROM doi_soat_shipper
WHERE nguoi_giao_hang_id = ?
ORDER BY ngay_tao DESC
```

## 📱 API Response Examples

### Dashboard Stats
```json
{
  "tong_don_hom_nay": 15,
  "don_da_giao": 12,
  "doanh_thu_hom_nay": 450000,
  "don_cho_giao": 3
}
```

### Order List
```json
{
  "data": [
    {
      "id": 1,
      "ma_don_hang": "DH20250504001",
      "ten_nguoi_nhan": "Phạm Thu Hà",
      "dia_chi_nhan": "45 Lê Lợi, Q.1, TP.HCM",
      "trang_thai": "delivering",
      "phi_giao_hang": 25000,
      "created_at": "2026-05-04T10:30:00"
    }
  ],
  "pagination": {...}
}
```

## 🎨 UI/UX Features

- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Dark Mode Support
- ✅ Real-time Status Updates
- ✅ Intuitive Navigation
- ✅ Data Visualization (Charts & Graphs)
- ✅ Print & Export Features

## 🔄 Trạng Thái Đơn Hàng

```
Pending → Confirmed → Picking Up → Picked Up → In Transit → Delivering → Delivered
                           ↓
                         Failed (có thể retry)
                           ↓
                       Returned/Cancelled
```

## 📧 Thông Báo

Khi cập nhật trạng thái đơn hàng:
- Khách hàng nhận được thông báo
- Cửa hàng nhận được thông báo (nếu cần)

## 🐛 Troubleshooting

### Routes không hoạt động
- Kiểm tra `routes/shipper.php` có được include trong `routes/api.php`
- Chạy `php artisan route:list` để liệt kê tất cả routes

### Views không tìm thấy
- Kiểm tra đường dẫn: `resources/views/shipper/`
- Chạy `php artisan view:clear` để clear cache

### Database errors
- Chạy `php artisan migrate` để tạo bảng
- Kiểm tra kết nối database trong `.env`

## 📝 Tính Năng Sắp Tới

- [ ] Tích hợp GPS tracking theo thời gian thực
- [ ] Notification push mobile
- [ ] Export Excel/PDF report
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 📞 Support

Liên hệ: support@zengo.com

## 📄 License

MIT License

---

**Version:** 1.0.0  
**Last Updated:** May 4, 2026  
**Status:** ✅ Production Ready
