<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class NguoiDung extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'nguoi_dung';

    protected $fillable = [
        'ho_ten', 'email', 'so_dien_thoai',
        'mat_khau', 'vai_tro', 'anh_dai_dien',
        'trang_thai', 'ngay_sinh', 'gioi_tinh',
        'cccd', 'dia_chi_mac_dinh', 'ghi_chu',
    ];

    protected $hidden = ['mat_khau'];

    protected $casts = [
        'ngay_sinh'   => 'date',
        'last_login_at'=> 'datetime',
    ];

    // Sanctum dùng field mat_khau
    public function getAuthPassword()
    {
        return $this->mat_khau;
    }

    // ── QUAN HỆ NGƯỜI MUA ──

    public function gioHang()
    {
        return $this->hasOne(GioHang::class, 'nguoi_mua_id');
    }

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'nguoi_mua_id');
    }

    public function diaChis()
    {
        return $this->hasMany(DiaChiNguoiDung::class, 'nguoi_dung_id');
    }

    public function diaChiMacDinh()
    {
        return $this->hasOne(DiaChiNguoiDung::class, 'nguoi_dung_id')
                    ->where('la_mac_dinh', true);
    }

    public function danhGias()
    {
        return $this->hasMany(DanhGia::class, 'nguoi_mua_id');
    }

    public function cuocTroChuyen()
    {
        return $this->hasMany(CuocTroChuyen::class, 'nguoi_mua_id');
    }

    public function thongBaos()
    {
        return $this->hasMany(ThongBao::class, 'nguoi_dung_id');
    }

    public function viTien()
    {
        return $this->hasOne(ViTien::class, 'nguoi_dung_id');
    }

    public function khieuNais()
    {
        return $this->hasMany(KhieuNai::class, 'nguoi_khieu_nai_id');
    }

    // ── QUAN HỆ NGƯỜI BÁN ──

    public function cuaHang()
    {
        return $this->hasOne(CuaHang::class, 'nguoi_ban_id');
    }

    // ── HELPER ──

    public function isAdmin(): bool    { return $this->vai_tro === 'admin'; }
    public function isNguoiMua(): bool { return $this->vai_tro === 'nguoi_mua'; }
    public function isNguoiBan(): bool { return $this->vai_tro === 'nguoi_ban'; }
    public function isShipper(): bool  { return $this->vai_tro === 'shipper'; }
}