<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CuaHang extends Model
{
    protected $table = 'cua_hang';

    protected $fillable = [
        'nguoi_ban_id', 'ten_cua_hang', 'email',
        'so_dien_thoai', 'mo_ta', 'dia_chi_lay_hang',
        'logo', 'ma_so_thue', 'trang_thai',
    ];

    public function nguoiBan()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_ban_id');
    }

    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'cua_hang_id');
    }

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'cua_hang_id');
    }

    public function cuocTroChuyen()
    {
        return $this->hasMany(CuocTroChuyen::class, 'cua_hang_id');
    }
}