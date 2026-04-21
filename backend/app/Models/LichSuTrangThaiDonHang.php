<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $don_hang_id
 * @property int|null $nguoi_cap_nhat_id
 * @property string|null $trang_thai_cu
 * @property string $trang_thai_moi
 * @property string|null $ghi_chu
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \App\Models\DonHang|null $order
 * @property-read \App\Models\NguoiDung|null $updatedBy
 */
class LichSuTrangThaiDonHang extends Model
{
    use HasFactory;

    protected $table = 'lich_su_trang_thai_don_hang';

    public $timestamps = false;

    protected $fillable = [
        'don_hang_id',
        'nguoi_cap_nhat_id',
        'trang_thai_cu',
        'trang_thai_moi',
        'ghi_chu',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function donHang()
    {
        return $this->order();
    }

    public function updatedBy()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_cap_nhat_id');
    }

    public function nguoiCapNhat()
    {
        return $this->updatedBy();
    }
}
