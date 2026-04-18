<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';

    protected $fillable = [
        'campaign_id',
        'cua_hang_id',
        'ma_voucher',
        'ten_voucher',
        'loai',
        'mo_ta',
        'thoi_gian_bat_dau',
        'thoi_gian_ket_thuc',
        'trang_thai',
        'gia_tri_voucher',
        'gia_tri_don_toi_thieu',
        'giam_toi_da',
        'so_luong_voucher',
        'so_luong_da_dung',
        'so_luong_con_lai',
        'so_luong_moi_nguoi',
        'muc_ho_tro_san',
        'ghi_chu',
        'kieu_giam_gia'
    ];

    public function campaign()
    {
        return $this->belongsTo(ChienDich::class, 'campaign_id');
    }

    public function shop()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }
}
