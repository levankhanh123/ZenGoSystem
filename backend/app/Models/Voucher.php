<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'voucher';

    protected $fillable = [
        'ma_voucher', 'ten_voucher', 'loai', 'mo_ta',
        'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'trang_thai',
        'gia_tri_voucher', 'gia_tri_don_toi_thieu', 'giam_toi_da',
        'so_luong_voucher', 'so_luong_da_dung', 'so_luong_con_lai',
        'so_luong_moi_nguoi', 'muc_ho_tro_san', 'ghi_chu',
    ];

    protected $casts = [
        'thoi_gian_bat_dau'     => 'datetime',
        'thoi_gian_ket_thuc'    => 'datetime',
        'gia_tri_voucher'       => 'float',
        'gia_tri_don_toi_thieu' => 'float',
        'giam_toi_da'           => 'float',
        'muc_ho_tro_san'        => 'float',
    ];

    // Kiểm tra voucher còn hiệu lực không
    public function getIsValidAttribute(): bool
    {
        return $this->trang_thai === 'dang_dien_ra'
            && $this->so_luong_con_lai > 0
            && now()->between($this->thoi_gian_bat_dau, $this->thoi_gian_ket_thuc);
    }

    // Tính số tiền được giảm cho 1 đơn hàng
    public function tinhGiamGia(float $tongDon): float
    {
        if ($tongDon < $this->gia_tri_don_toi_thieu) return 0;

        $giam = $this->loai === 'phan_tram'
            ? $tongDon * ($this->gia_tri_voucher / 100)
            : $this->gia_tri_voucher;

        // Không được vượt quá mức giảm tối đa
        return $this->giam_toi_da > 0
            ? min($giam, $this->giam_toi_da)
            : $giam;
    }
}