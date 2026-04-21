<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $don_hang_id
 * @property string|null $ma_giao_dich
 * @property string $cong_thanh_toan
 * @property string $so_tien
 * @property string $trang_thai
 * @property \Illuminate\Support\Carbon|null $thoi_gian_thanh_toan
 * @property string|null $ghi_chu
 * @property-read \App\Models\DonHang|null $order
 */
class ThanhToan extends Model
{
    use HasFactory;

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
        'so_tien' => 'decimal:2',
        'thoi_gian_thanh_toan' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function donHang()
    {
        return $this->order();
    }

    public function hoanTien()
    {
        return $this->hasMany(HoanTien::class, 'thanh_toan_id');
    }
}
