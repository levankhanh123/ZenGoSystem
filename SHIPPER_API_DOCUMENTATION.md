# 📚 API Documentation - Giao Diện Người Giao Hàng (Shipper)

## Base URL
```
http://localhost:8000/api/shipper
```

## Authentication
Tất cả requests yêu cầu header:
```
Authorization: Bearer {token}
```

---

## 🏠 Dashboard

### Get Dashboard Stats
```http
GET /dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tong_don_hom_nay": 15,
    "don_da_giao": 12,
    "doanh_thu_hom_nay": 450000,
    "don_cho_giao": 3,
    "recent_orders": [
      {
        "id": 1,
        "ma_don_hang": "DH20250504001",
        "ten_nguoi_nhan": "Phạm Thu Hà",
        "trang_thai": "delivering",
        "created_at": "2026-05-04T10:30:00"
      }
    ]
  }
}
```

---

## 📦 Quản Lý Đơn Hàng

### List Orders
```http
GET /orders?status=pending&date=2026-05-04&search=DH20250504
```

**Query Parameters:**
- `status` (optional) - pending, confirmed, picking_up, picked_up, in_transit, delivering, delivered, failed
- `date` (optional) - YYYY-MM-DD
- `search` (optional) - Mã đơn hàng
- `page` (optional) - Trang (default: 1)
- `per_page` (optional) - Số bản ghi/trang (default: 15)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "ma_don_hang": "DH20250504001",
        "ten_nguoi_nhan": "Phạm Thu Hà",
        "so_dien_thoai_nguoi_nhan": "0944567890",
        "dia_chi_nhan": "45 Lê Lợi, Q.1, TP.HCM",
        "trang_thai": "delivering",
        "phi_giao_hang": 25000,
        "created_at": "2026-05-04T10:30:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 100,
      "last_page": 7
    }
  }
}
```

### Get Order Detail
```http
GET /orders/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "don_hang_id": 5,
    "ma_van_don": "VD20250504001",
    "trang_thai": "delivering",
    "ngay_nhan_don": "2026-05-04T10:00:00",
    "ngay_giao_du_kien": "2026-05-04T17:00:00",
    "ngay_giao_thuc_te": null,
    "cod_thu_ho": 150000,
    "ghi_chu": "Giao hàng trong giờ hành chính",
    "order": {
      "id": 5,
      "ma_don_hang": "DH20250504001",
      "ten_nguoi_nhan": "Phạm Thu Hà",
      "so_dien_thoai_nguoi_nhan": "0944567890",
      "dia_chi_nhan": "45 Lê Lợi, Q.1, TP.HCM",
      "phi_giao_hang": 25000,
      "cua_hang": {
        "id": 2,
        "ten_cua_hang": "Cửa hàng XYZ",
        "dia_chi": "227 Nguyễn Văn Cừ, Q.5, TP.HCM",
        "so_dien_thoai": "0212345678"
      }
    }
  }
}
```

### Update Order Status
```http
PUT /orders/{id}/status
Content-Type: application/json

{
  "trang_thai": "delivered",
  "ghi_chu": "Giao thành công",
  "ly_do_that_bai": null,
  "so_lan_giao_lai": 0
}
```

**Valid Status Values:**
- confirmed
- picking_up
- picked_up
- in_transit
- delivering
- delivered
- failed

**Required Fields:**
- `trang_thai` (string)

**Optional Fields:**
- `ghi_chu` (string, max: 500)
- `ly_do_that_bai` (string, max: 500) - Required if status is 'failed'
- `so_lan_giao_lai` (integer, min: 0)

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công",
  "data": {
    "id": 1,
    "trang_thai": "delivered",
    "updated_at": "2026-05-04T15:30:00"
  }
}
```

---

## 👤 Quản Lý Tài Khoản

### Get Account Profile
```http
GET /account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ho_ten": "Nguyễn Văn An",
    "email": "an@ship.vn",
    "so_dien_thoai": "0901234567",
    "dia_chi": "Số 100, Đường Lê Lợi, Q.1, TP.HCM",
    "anh_dai_dien": "/storage/avatars/shippers/1.jpg",
    "loai_phuong_tien": "motorbike",
    "bien_so_xe": "59B1-12345"
  }
}
```

### Update Account Info
```http
PUT /account/update
Content-Type: multipart/form-data

{
  "ho_ten": "Nguyễn Văn An",
  "email": "an@ship.vn",
  "so_dien_thoai": "0901234567",
  "dia_chi": "Số 100, Đường Lê Lợi, Q.1, TP.HCM",
  "anh_dai_dien": <file>
}
```

**Required Fields:**
- ho_ten
- email
- so_dien_thoai
- dia_chi

**Optional Fields:**
- anh_dai_dien (image, max: 2MB)

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật tài khoản thành công"
}
```

### Change Password
```http
POST /account/change-password
Content-Type: application/json

{
  "mat_khau_cu": "current_password",
  "mat_khau_moi": "new_password",
  "mat_khau_moi_confirmation": "new_password"
}
```

**Required Fields:**
- mat_khau_cu (min: 6)
- mat_khau_moi (min: 6)
- mat_khau_moi_confirmation (must match mat_khau_moi)

**Response:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

## 💰 Đối Soát

### List Reconciliation
```http
GET /reconciliation?from_date=2026-05-01&to_date=2026-05-31&trang_thai=pending
```

**Query Parameters:**
- `from_date` (optional) - YYYY-MM-DD
- `to_date` (optional) - YYYY-MM-DD
- `trang_thai` (optional) - pending, completed, paid
- `page` (optional)
- `per_page` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "tong_doanh_thu": 5000000,
      "tong_da_nhan": 4500000,
      "tong_con_no": 500000
    },
    "records": [
      {
        "id": 1,
        "nguoi_giao_hang_id": 1,
        "so_don_hang": 50,
        "tong_tien": 1250000,
        "phi_va_chi_phi": 150000,
        "tien_phai_tra": 1100000,
        "trang_thai": "paid",
        "ngay_tao": "2026-05-01T00:00:00",
        "ngay_xac_nhan": "2026-05-02T10:00:00",
        "ngay_thanh_toan": "2026-05-05T14:30:00"
      }
    ]
  }
}
```

### Get Reconciliation Detail
```http
GET /reconciliation/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "so_don_hang": 50,
    "tong_tien": 1250000,
    "phi_va_chi_phi": 150000,
    "phi_khau_tru": 100000,
    "thuong": 50000,
    "tien_phai_tra": 1100000,
    "trang_thai": "paid",
    "ghi_chu": "Thanh toán khoá 1 tháng 5",
    "ngay_tao": "2026-05-01T00:00:00",
    "ngay_xac_nhan": "2026-05-02T10:00:00",
    "ngay_thanh_toan": "2026-05-05T14:30:00"
  }
}
```

---

## 📜 Lịch Sử

### Get Delivery History
```http
GET /history?month=5&year=2026
```

**Query Parameters:**
- `month` (optional) - 1-12
- `year` (optional) - YYYY
- `page` (optional)
- `per_page` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "ma_don_hang": "DH20250504001",
        "ten_nguoi_nhan": "Phạm Thu Hà",
        "dia_chi_nhan": "45 Lê Lợi, Q.1, TP.HCM",
        "phi_giao_hang": 25000,
        "trang_thai": "delivered",
        "ngay_giao_thuc_te": "2026-05-04T15:30:00"
      }
    ],
    "statistics": {
      "tong_don_thanh_cong": 45,
      "tong_don_that_bai": 2,
      "tong_doanh_thu": 1200000
    }
  }
}
```

---

## 📊 Thống Kê

### Get Statistics
```http
GET /statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tong_so_don_giao": 500,
    "tong_don_thanh_cong": 485,
    "tong_don_that_bai": 15,
    "ty_le_thanh_cong": 97.0,
    "trung_binh_danh_gia": 4.8,
    "doanh_thu_thang_nay": 15000000
  }
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "trang_thai": ["Trạng thái không hợp lệ"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 🧪 Testing với cURL

### Get Dashboard
```bash
curl -X GET http://localhost:8000/api/shipper/dashboard \
  -H "Authorization: Bearer your_token_here" \
  -H "Accept: application/json"
```

### Update Order Status
```bash
curl -X PUT http://localhost:8000/api/shipper/orders/1/status \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "trang_thai": "delivered",
    "ghi_chu": "Giao thành công"
  }'
```

### Upload Avatar
```bash
curl -X PUT http://localhost:8000/api/shipper/account/update \
  -H "Authorization: Bearer your_token_here" \
  -F "ho_ten=Nguyễn Văn An" \
  -F "email=an@ship.vn" \
  -F "so_dien_thoai=0901234567" \
  -F "dia_chi=Địa chỉ" \
  -F "anh_dai_dien=@/path/to/image.jpg"
```

---

## 📱 Testing với Postman

### Import Collection
1. Tạo collection mới: `Shipper API`
2. Thêm các requests trên
3. Set variable: `{{base_url}}` = `http://localhost:8000/api/shipper`
4. Set header: `Authorization: Bearer {{token}}`

---

**Version:** 1.0.0  
**Last Updated:** May 4, 2026
