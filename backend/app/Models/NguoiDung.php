<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
class NguoiDung extends Model
{
    use HasFactory;

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

    public function thongBao()
    {
        return $this->hasMany(ThongBao::class, 'nguoi_dung_id');
    }

    public function conversations()
    {
        return $this->hasMany(HoiThoaiThanhVien::class, 'nguoi_dung_id');
    }

    public function complaints()
    {
        return $this->hasMany(KhieuNai::class, 'nguoi_khieu_nai_id');
    }

    public function buyerOrders()
    {
        return $this->hasMany(DonHang::class, 'nguoi_mua_id');
    }

    public function sellerShops()
    {
        return $this->hasMany(CuaHang::class, 'nguoi_ban_id');
    }

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
}
