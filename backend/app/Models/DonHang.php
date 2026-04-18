<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    protected $table = 'don_hang';

    protected $fillable = [
        'ma_don_hang',
        'nguoi_mua_id',
        'cua_hang_id',
        'tong_tien',
        'phuong_thuc_thanh_toan',
        'trang_thai_thanh_toan',
        'trang_thai_don_hang',
        'dia_chi_giao_hang',
        'ghi_chu'
    ];

    public function reviews()
    {
        return $this->hasMany(DanhGia::class, 'don_hang_id');
    }
}
