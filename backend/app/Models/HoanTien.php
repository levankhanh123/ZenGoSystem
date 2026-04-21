<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoanTien extends Model
{
    protected $table = 'hoan_tien';

    protected $fillable = [
        'don_hang_id',
        'thanh_toan_id',
        'so_tien',
        'ly_do',
        'trang_thai',
        'ghi_chu',
    ];

    protected $casts = [
        'so_tien' => 'float',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function thanhToan()
    {
        return $this->belongsTo(ThanhToan::class, 'thanh_toan_id');
    }
}