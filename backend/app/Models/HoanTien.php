<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $don_hang_id
 * @property int|null $thanh_toan_id
 * @property string $so_tien
 * @property string|null $ly_do
 * @property string $trang_thai
 * @property string|null $ghi_chu
 * @property-read \App\Models\DonHang|null $order
 * @property-read \App\Models\ThanhToan|null $payment
 */
class HoanTien extends Model
{
    use HasFactory;

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
        'so_tien' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function payment()
    {
        return $this->belongsTo(ThanhToan::class, 'thanh_toan_id');
    }
}
