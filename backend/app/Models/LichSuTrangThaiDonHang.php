<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichSuTrangThaiDonHang extends Model
{
    protected $table = 'lich_su_trang_thai_don_hang';
    public $timestamps = false;

    protected $fillable = [
        'don_hang_id',
        'nguoi_cap_nhat_id',
        'trang_thai_cu',
        'trang_thai_moi',
        'ghi_chu',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function nguoiCapNhat()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_cap_nhat_id');
    }
}