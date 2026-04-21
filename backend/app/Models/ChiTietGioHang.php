<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietGioHang extends Model
{
    protected $table = 'chi_tiet_gio_hang';
    public $timestamps = false;

    protected $fillable = [
        'gio_hang_id',
        'san_pham_id',
        'so_luong',
        'don_gia',
    ];

    protected $casts = [
        'don_gia'    => 'float',
        'so_luong'   => 'integer',
        'created_at' => 'datetime',
    ];

    public function gioHang()
    {
        return $this->belongsTo(GioHang::class, 'gio_hang_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Thành tiền của dòng này
    public function getThanhTienAttribute(): float
    {
        return $this->don_gia * $this->so_luong;
    }
}