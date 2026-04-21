<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    protected $table = 'don_hang';

    protected $fillable = [
        'ma_don_hang', 'nguoi_mua_id', 'cua_hang_id',
        'ten_nguoi_nhan', 'so_dien_thoai_nguoi_nhan',
        'dia_chi_nhan', 'ghi_chu',
        'tam_tinh', 'phi_giao_hang', 'giam_gia', 'tong_tien',
        'phuong_thuc_thanh_toan', 'trang_thai_thanh_toan',
        'trang_thai_don_hang', 'ly_do_huy',
    ];

    protected $casts = [
        'tam_tinh'         => 'float',
        'phi_giao_hang'    => 'float',
        'giam_gia'         => 'float',
        'tong_tien'        => 'float',
        'thoi_gian_xac_nhan'=> 'datetime',
    ];

    public function nguoiMua()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function cuaHang()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function chiTietDonHangs()
    {
        return $this->hasMany(ChiTietDonHang::class, 'don_hang_id');
    }

    public function thanhToan()
    {
        return $this->hasOne(ThanhToan::class, 'don_hang_id');
    }

    public function giaHang()
    {
        return $this->hasOne(GiaoHang::class, 'don_hang_id');
    }

    public function hoanTiens()
    {
        return $this->hasMany(HoanTien::class, 'don_hang_id');
    }

    public function danhGias()
    {
        return $this->hasMany(DanhGia::class, 'don_hang_id');
    }

    public function khieuNais()
    {
        return $this->hasMany(KhieuNai::class, 'don_hang_id');
    }

    public function lichSuTrangThai()
    {
        return $this->hasMany(LichSuTrangThaiDonHang::class, 'don_hang_id')
                    ->orderBy('created_at');
    }
}