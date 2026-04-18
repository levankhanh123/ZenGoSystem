<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $nguoi_ban_id
 * @property string $ten_cua_hang
 * @property string|null $email
 * @property string|null $so_dien_thoai
 * @property string|null $mo_ta
 * @property string|null $dia_chi_lay_hang
 * @property string|null $logo
 * @property string|null $ma_so_thue
 * @property string $trang_thai
 * @property string|null $ly_do_tu_choi
 * @property string|null $ghi_chu
 * @property \Illuminate\Support\Carbon|null $lan_kiem_tra_gan_nhat
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\NguoiDung|null $owner
 */
class CuaHang extends Model
{
    use HasFactory;

    protected $table = 'cua_hang';

    protected $fillable = [
        'nguoi_ban_id',
        'ten_cua_hang',
        'email',
        'so_dien_thoai',
        'mo_ta',
        'dia_chi_lay_hang',
        'logo',
        'ma_so_thue',
        'trang_thai',
        'ly_do_tu_choi',
        'ghi_chu',
        'lan_kiem_tra_gan_nhat',
        'updated_by',
    ];

    protected $casts = [
        'lan_kiem_tra_gan_nhat' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_ban_id');
    }

    public function products()
    {
        return $this->hasMany(SanPham::class, 'cua_hang_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'cua_hang_id');
    }

    public function orders()
    {
        return $this->hasMany(DonHang::class, 'cua_hang_id');
    }

    public function settlements()
    {
        return $this->hasMany(DoiSoatShop::class, 'shop_id');
    }

    public function campaignRegistrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'shop_id');
    }
}

