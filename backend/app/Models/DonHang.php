<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $ma_don_hang
 * @property int $nguoi_mua_id
 * @property int $cua_hang_id
 * @property string $ten_nguoi_nhan
 * @property string $so_dien_thoai_nguoi_nhan
 * @property string $dia_chi_nhan
 * @property string|null $ghi_chu
 * @property string $tam_tinh
 * @property string $phi_giao_hang
 * @property string $giam_gia
 * @property string $tong_tien
 * @property string|null $phuong_thuc_thanh_toan
 * @property string $trang_thai_thanh_toan
 * @property string $trang_thai_don_hang
 * @property string|null $ly_do_huy
 * @property bool $bat_thuong
 * @property array<int, string>|null $ly_do_bat_thuong
 * @property string|null $loai_xu_ly
 * @property string|null $trang_thai_xac_nhan
 * @property int|null $nguoi_xac_nhan_id
 * @property \Illuminate\Support\Carbon|null $thoi_gian_xac_nhan
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\NguoiDung|null $buyer
 * @property-read \App\Models\CuaHang|null $shop
 * @property-read \App\Models\GiaoHang|null $delivery
 */
class DonHang extends Model
{
    use HasFactory;

    protected $table = 'don_hang';

    protected $fillable = [
        'ma_don_hang',
        'nguoi_mua_id',
        'cua_hang_id',
        'ten_nguoi_nhan',
        'so_dien_thoai_nguoi_nhan',
        'dia_chi_nhan',
        'ghi_chu',
        'tam_tinh',
        'phi_giao_hang',
        'giam_gia',
        'tong_tien',
        'phuong_thuc_thanh_toan',
        'trang_thai_thanh_toan',
        'trang_thai_don_hang',
        'ly_do_huy',
        'bat_thuong',
        'ly_do_bat_thuong',
        'loai_xu_ly',
        'trang_thai_xac_nhan',
        'nguoi_xac_nhan_id',
        'thoi_gian_xac_nhan',
        'updated_by',
    ];

    protected $casts = [
        'tam_tinh' => 'decimal:2',
        'phi_giao_hang' => 'decimal:2',
        'giam_gia' => 'decimal:2',
        'tong_tien' => 'decimal:2',
        'bat_thuong' => 'boolean',
        'ly_do_bat_thuong' => 'array',
        'thoi_gian_xac_nhan' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function buyer()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function shop()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function delivery()
    {
        return $this->hasOne(GiaoHang::class, 'don_hang_id');
    }

    public function complaints()
    {
        return $this->hasMany(KhieuNai::class, 'don_hang_id');
    }

    public function conversations()
    {
        return $this->hasMany(HoiThoai::class, 'don_hang_id');
    }

    public function payments()
    {
        return $this->hasMany(ThanhToan::class, 'don_hang_id');
    }

    public function refunds()
    {
        return $this->hasMany(HoanTien::class, 'don_hang_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(LichSuTrangThaiDonHang::class, 'don_hang_id');
    }
}
