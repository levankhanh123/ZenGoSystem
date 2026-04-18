<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'lan_kiem_tra_gan_nhat'
    ];

    public function products()
    {
        return $this->hasMany(SanPham::class, 'cua_hang_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'cua_hang_id');
    }

    public function campain_registrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'shop_id');
    }
}
