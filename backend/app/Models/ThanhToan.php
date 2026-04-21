<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanh_toan';

    protected $fillable = [
        'don_hang_id',
        'ma_giao_dich',
        'cong_thanh_toan',
        'so_tien',
        'trang_thai',
        'thoi_gian_thanh_toan',
        'ghi_chu',
    ];

    protected $casts = [
        'so_tien'             => 'float',
        'thoi_gian_thanh_toan'=> 'datetime',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function hoanTien()
    {
        return $this->hasMany(HoanTien::class, 'thanh_toan_id');
    }
}