<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    protected $table = 'danh_gia';
    public $timestamps = false;

    protected $fillable = [
        'nguoi_mua_id',
        'san_pham_id',
        'don_hang_id',
        'so_sao',
        'noi_dung',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function nguoiMua()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
}