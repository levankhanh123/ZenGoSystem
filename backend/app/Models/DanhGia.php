<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    use HasFactory;

    protected $table = 'danh_gia';
    
    public $timestamps = false; // Based on schema, it only has created_at

    protected $fillable = [
        'nguoi_mua_id',
        'san_pham_id',
        'don_hang_id',
        'so_sao',
        'noi_dung',
        'noi_dung_phan_hoi',
        'thoi_gian_phan_hoi',
        'created_at'
    ];

    protected $casts = [
        'thoi_gian_phan_hoi' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function nguoiMua()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function nguoiDung()
    {
        return $this->nguoiMua();
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

