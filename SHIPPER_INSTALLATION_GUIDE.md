# 🚀 Hướng Dẫn Cài Đặt Giao Diện Người Giao Hàng (Shipper)

## 📋 Yêu Cầu

- PHP 8.1+
- Laravel 10+
- MySQL 8.0+
- Composer
- Node.js (cho frontend)

## ✅ Cài Đặt Từng Bước

### Bước 1: Database Migration

Chạy lệnh để tạo các bảng cần thiết:

```bash
cd backend
php artisan migrate
```

**Bảng được tạo:**
- `doi_soat_shipper` - Lưu thông tin đối soát
- `lich_su_trang_thai_don_hang` - Lưu lịch sử thay đổi trạng thái

### Bước 2: Kiểm Tra File Controllers

Đảm bảo file `app/Http/Controllers/Shipper/ShipperController.php` đã tồn tại

### Bước 3: Kiểm Tra Routes

File `routes/shipper.php` phải được include trong `routes/api.php`:

```php
// routes/api.php
require __DIR__ . '/shipper.php';
```

### Bước 4: Kiểm Tra Views

Tất cả files blade view phải nằm trong:
```
resources/views/shipper/
├── layouts/
│   └── app.blade.php
├── dashboard.blade.php
├── orders/
│   ├── list.blade.php
│   └── detail.blade.php
├── account/
│   └── profile.blade.php
├── reconciliation/
│   ├── index.blade.php
│   └── detail.blade.php
├── history/
│   └── index.blade.php
└── statistics.blade.php
```

### Bước 5: Kiểm Tra Localization

File `resources/lang/vi/shipper.php` phải tồn tại để hiển thị trạng thái tiếng Việt

### Bước 6: Clear Cache

```bash
php artisan cache:clear
php artisan view:clear
php artisan config:clear
php artisan route:clear
```

## 🧪 Kiểm Tra Installation

### 1. Kiểm Tra Routes

```bash
php artisan route:list | grep shipper
```

Kết quả nên hiển thị các routes:
```
GET|HEAD   /api/shipper/dashboard
GET|HEAD   /api/shipper/orders
GET|HEAD   /api/shipper/orders/{id}
PUT        /api/shipper/orders/{id}/status
GET|HEAD   /api/shipper/account
PUT        /api/shipper/account/update
POST       /api/shipper/account/change-password
GET|HEAD   /api/shipper/reconciliation
GET|HEAD   /api/shipper/reconciliation/{id}
GET|HEAD   /api/shipper/history
GET|HEAD   /api/shipper/statistics
```

### 2. Test API

```bash
# Test dengan Postman hoặc cURL
curl -X GET http://localhost:8000/api/shipper/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Kiểm Tra Database

```bash
php artisan tinker
# Trong tinker shell:
>>> \App\Models\DoiSoatShipper::count()
>>> \App\Models\LichSuTrangThaiDonHang::count()
```

## 📊 Cấu Trúc Database

### Bảng: doi_soat_shipper
```sql
CREATE TABLE doi_soat_shipper (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nguoi_giao_hang_id BIGINT NOT NULL,
  don_hang_id BIGINT,
  so_don_hang INT DEFAULT 0,
  tong_tien DECIMAL(12,2) DEFAULT 0,
  phi_va_chi_phi DECIMAL(12,2) DEFAULT 0,
  phi_khau_tru DECIMAL(12,2) DEFAULT 0,
  thuong DECIMAL(12,2) DEFAULT 0,
  tien_phai_tra DECIMAL(12,2) DEFAULT 0,
  trang_thai ENUM('pending', 'completed', 'paid') DEFAULT 'pending',
  ghi_chu TEXT,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_xac_nhan TIMESTAMP NULL,
  ngay_thanh_toan TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (nguoi_giao_hang_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);
```

### Bảng: lich_su_trang_thai_don_hang
```sql
CREATE TABLE lich_su_trang_thai_don_hang (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  don_hang_id BIGINT NOT NULL,
  trang_thai_cu VARCHAR(255),
  trang_thai_moi VARCHAR(255) NOT NULL,
  ghi_chu TEXT,
  nguoi_cap_nhat_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
  FOREIGN KEY (nguoi_cap_nhat_id) REFERENCES nguoi_dung(id) ON DELETE RESTRICT
);
```

## 🔐 Bảo Mật

### Thiết Lập CORS (nếu cần)
```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
```

### Token Authentication
Tất cả routes yêu cầu:
```
Authorization: Bearer {token}
```

## 📱 Testing Với Frontend

### Development
```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access URLs
- Backend API: `http://localhost:8000/api`
- Frontend: `http://localhost:5173`
- Shipper Dashboard: `http://localhost:5173/shipper/dashboard`

## 🐛 Gỡ Lỗi Thường Gặp

### Lỗi: "Route not found"
```bash
# Solution:
php artisan route:clear
php artisan route:cache
```

### Lỗi: "View not found"
```bash
# Solution:
php artisan view:clear
php artisan view:cache
```

### Lỗi: "SQLSTATE[42S02]: Table not found"
```bash
# Solution:
php artisan migrate:fresh
```

### Lỗi: "Unauthorized" (401)
```bash
# Kiểm tra token đã expired chưa
# Kiểm tra user đã login chưa
```

## 📈 Performance Optimization

### Caching
```php
// app/Http/Controllers/Shipper/ShipperController.php
$orders = Cache::remember("shipper.orders.{$shipper->id}", 3600, function () {
    return GiaoHang::where('nguoi_giao_hang_id', $shipper->id)->get();
});
```

### Database Indexing
```sql
CREATE INDEX idx_giao_hang_shipper ON giao_hang(nguoi_giao_hang_id);
CREATE INDEX idx_giao_hang_status ON giao_hang(trang_thai);
CREATE INDEX idx_doi_soat_shipper ON doi_soat_shipper(nguoi_giao_hang_id);
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `APP_ENV=production` trong `.env`
- [ ] Set `APP_DEBUG=false`
- [ ] Chạy `php artisan migrate --force`
- [ ] Chạy `php artisan optimize`
- [ ] Backup database trước deployment

### Commands
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

## 📞 Support & Help

### Liên Hệ
- Email: support@zengo.com
- Docs: https://docs.zengo.com

### Reporting Issues
Nếu gặp vấn đề, vui lòng tạo issue với:
- Mô tả chi tiết lỗi
- Error message đầy đủ
- Laravel version
- PHP version

## ✨ Next Steps

1. ✅ Cài đặt thành công
2. 🔄 Thêm sample data
3. 🧪 Test các tính năng
4. 🚀 Deploy lên production

---

**Cập nhật lần cuối:** May 4, 2026
**Phiên bản:** 1.0.0
