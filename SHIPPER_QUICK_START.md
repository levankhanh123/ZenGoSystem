# ⚡ Quick Start - Giao Diện Người Giao Hàng (Shipper)

## 🎯 5 Phút Setup Nhanh

### 1️⃣ Chạy Migration (1 phút)
```bash
cd backend
php artisan migrate
```

### 2️⃣ Clear Cache (30 giây)
```bash
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### 3️⃣ Kiểm Tra Routes (30 giây)
```bash
php artisan route:list | grep shipper
```

### 4️⃣ Kiểm Tra Files Tồn Tại
```bash
# Controller
ls -la app/Http/Controllers/Shipper/ShipperController.php

# Routes
ls -la routes/shipper.php

# Views
ls -la resources/views/shipper/
```

### 5️⃣ Start Server (30 giây)
```bash
php artisan serve
# Truy cập: http://localhost:8000/api/shipper/dashboard
```

✅ **Hoàn thành!**

---

## 🔐 Lấy Access Token

### Cách 1: Database
```bash
php artisan tinker
```

```php
>>> $user = \App\Models\NguoiDung::where('role', 'shipper')->first();
>>> $token = $user->createToken('Shipper App')->plainTextToken;
>>> echo $token;
```

### Cách 2: API Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shipper@example.com",
    "password": "password"
  }'
```

---

## 🚀 Thử Gọi API Đầu Tiên

### Dashboard
```bash
curl -X GET http://localhost:8000/api/shipper/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Orders
```bash
curl -X GET http://localhost:8000/api/shipper/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Statistics
```bash
curl -X GET http://localhost:8000/api/shipper/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 File Cấu Trúc

```
✅ app/Http/Controllers/Shipper/ShipperController.php
✅ routes/shipper.php
✅ resources/views/shipper/
   ✅ layouts/app.blade.php
   ✅ dashboard.blade.php
   ✅ orders/list.blade.php
   ✅ orders/detail.blade.php
   ✅ account/profile.blade.php
   ✅ reconciliation/index.blade.php
   ✅ reconciliation/detail.blade.php
   ✅ history/index.blade.php
   ✅ statistics.blade.php
✅ database/migrations/2026_05_04_000000_create_shipper_tables.php
✅ resources/lang/vi/shipper.php
```

---

## 📊 Routes Chính

| Method | Endpoint | Chức năng |
|--------|----------|----------|
| GET | `/dashboard` | Dashboard chính |
| GET | `/orders` | Danh sách đơn hàng |
| GET | `/orders/{id}` | Chi tiết đơn hàng |
| PUT | `/orders/{id}/status` | Cập nhật trạng thái |
| GET | `/account` | Tài khoản |
| PUT | `/account/update` | Cập nhật tài khoản |
| POST | `/account/change-password` | Đổi mật khẩu |
| GET | `/reconciliation` | Đối soát |
| GET | `/history` | Lịch sử |
| GET | `/statistics` | Thống kê |

---

## 🎨 Giao Diện

### Dashboard
![Dashboard](https://via.placeholder.com/600x400?text=Dashboard)

### Orders List
![Orders](https://via.placeholder.com/600x400?text=Orders+List)

### Reconciliation
![Reconciliation](https://via.placeholder.com/600x400?text=Reconciliation)

---

## ❓ Troubleshooting

### "Route not found"
```bash
php artisan route:clear
php artisan route:cache
```

### "View not found"
```bash
php artisan view:clear
php artisan view:cache
```

### "Token invalid"
- Kiểm tra token đã expired
- Kiểm tra user đã login

---

## 📖 Documentation Đầy Đủ

1. **README**: `SHIPPER_INTERFACE_README.md` - Tổng quan các tính năng
2. **Installation**: `SHIPPER_INSTALLATION_GUIDE.md` - Hướng dẫn cài đặt chi tiết
3. **API Docs**: `SHIPPER_API_DOCUMENTATION.md` - Tài liệu API chi tiết

---

## ✨ Tiếp Theo

- [ ] Thêm sample data
- [ ] Test trên mobile
- [ ] Tích hợp WebSocket để real-time updates
- [ ] Thêm push notifications
- [ ] Cài đặt môi trường production

---

**Ngày**: May 4, 2026  
**Phiên bản**: 1.0.0  
**Status**: ✅ Ready to Use
