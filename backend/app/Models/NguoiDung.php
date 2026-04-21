<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $ho_ten
 * @property string $email
 * @property string|null $so_dien_thoai
 * @property string $mat_khau
 * @property string $vai_tro
 * @property string|null $anh_dai_dien
 * @property string $trang_thai
 * @property \Illuminate\Support\Carbon|null $ngay_sinh
 * @property string|null $gioi_tinh
 * @property string|null $cccd
 * @property string|null $dia_chi_mac_dinh
 * @property string|null $ghi_chu
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\HoSoGiaoHang|null $shipperProfile
 */
class NguoiDung extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'nguoi_dung';

    protected $fillable = [
        'ho_ten',
        'email',
        'so_dien_thoai',
        'mat_khau',
        'vai_tro',
        'anh_dai_dien',
        'trang_thai',
        'ngay_sinh',
        'gioi_tinh',
        'cccd',
        'dia_chi_mac_dinh',
        'ghi_chu',
        'last_login_at',
        'updated_by',
    ];

    protected $hidden = [
        'mat_khau',
    ];

    protected $casts = [
        'ngay_sinh' => 'date',
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Sanctum dùng field mat_khau
    public function getAuthPassword()
    {
        return $this->mat_khau;
    }

    // ── COMMON RELATIONS ──
    public function thongBaos()
    {
        return $this->hasMany(ThongBao::class, 'nguoi_dung_id');
    }

    public function thongBao() // Alias or legacy
    {
        return $this->thongBaos();
    }

    public function khieuNais()
    {
        return $this->hasMany(KhieuNai::class, 'nguoi_khieu_nai_id');
    }

    public function complaints() // Alias or legacy
    {
        return $this->khieuNais();
    }

    // ── BUYER RELATIONS ──
    public function gioHang()
    {
        return $this->hasOne(GioHang::class, 'nguoi_mua_id');
    }

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'nguoi_mua_id');
    }

    public function buyerOrders() // Legacy
    {
        return $this->donHangs();
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

    public function conversations() // Possible legacy or different system
    {
        return $this->hasMany(HoiThoaiThanhVien::class, 'nguoi_dung_id');
    }

    public function viTien()
    {
        return $this->hasOne(ViTien::class, 'nguoi_dung_id');
    }

    // ── SELLER RELATIONS ──
    public function cuaHang()
    {
        return $this->hasOne(CuaHang::class, 'nguoi_ban_id');
    }

    public function sellerShops() // In case one user has multiple shops
    {
        return $this->hasMany(CuaHang::class, 'nguoi_ban_id');
    }

    // ── ADMIN / SHIPPER RELATIONS ──
    public function assignedComplaints()
    {
        return $this->hasMany(KhieuNai::class, 'assigned_admin_id');
    }

    public function shipperProfile()
    {
        return $this->hasOne(HoSoGiaoHang::class, 'nguoi_dung_id');
    }

    public function shipperSettlements()
    {
        return $this->hasMany(DoiSoatShipper::class, 'shipper_id');
    }

    // ── HELPERS ──
    public function isAdmin(): bool    { return $this->vai_tro === 'admin'; }
    public function isNguoiMua(): bool { return $this->vai_tro === 'nguoi_mua'; }
    public function isNguoiBan(): bool { return $this->vai_tro === 'nguoi_ban'; }
    public function isShipper(): bool  { return $this->vai_tro === 'shipper'; }
}

