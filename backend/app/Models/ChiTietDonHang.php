<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietDonHang extends Model
{
    protected $table = 'chi_tiet_don_hang';

    protected $fillable = [
        'don_hang_id',
        'san_pham_id',
        'ten_san_pham',
        'don_gia',
        'so_luong',
        'thanh_tien',
        'created_at'
    ];

    public $timestamps = false; // vì table không có updated_at

    // ================= RELATIONS =================

    // 👉 Liên kết tới sản phẩm
    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // 👉 QUAN TRỌNG: dùng cho withSum + whereHas
    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
}