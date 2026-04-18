<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $ma_voucher
 * @property string $ten_voucher
 * @property string $loai
 * @property string|null $mo_ta
 * @property \Illuminate\Support\Carbon|null $thoi_gian_bat_dau
 * @property \Illuminate\Support\Carbon|null $thoi_gian_ket_thuc
 * @property string $trang_thai
 * @property string|null $gia_tri_voucher
 * @property string|null $gia_tri_don_toi_thieu
 * @property string|null $giam_toi_da
 * @property int|null $so_luong_voucher
 * @property int|null $so_luong_da_dung
 * @property int|null $so_luong_con_lai
 * @property int|null $so_luong_moi_nguoi
 * @property string|null $muc_ho_tro_san
 * @property string|null $ghi_chu
 */
class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';

    protected $fillable = [
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
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
        'gia_tri_voucher' => 'decimal:2',
        'gia_tri_don_toi_thieu' => 'decimal:2',
        'giam_toi_da' => 'decimal:2',
        'muc_ho_tro_san' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function registrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'campaign_id');
    }

    public function approvedRegistrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'campaign_id')->where('trang_thai', 'da_duyet');
    }
}
