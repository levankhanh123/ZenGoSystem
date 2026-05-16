<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

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
        'campaign_id',
        'cua_hang_id',
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
        'kieu_giam_gia',
        'doi_tuong_ap_dung',
        'danh_muc_id',
        'banner_url',
        'mo_ta_rich',
        'han_dang_ky'
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
        'han_dang_ky' => 'datetime',
        'gia_tri_voucher' => 'decimal:2',
        'gia_tri_don_toi_thieu' => 'decimal:2',
        'giam_toi_da' => 'decimal:2',
        'muc_ho_tro_san' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(ChienDich::class, 'campaign_id');
    }

    public function shop()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function danhMuc()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_id');
    }

    public function registrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'campaign_id');
    }

    public function approvedRegistrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'campaign_id')->where('trang_thai', 'da_duyet');
    }

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

    public function users()
    {
        return $this->belongsToMany(NguoiDung::class, 'nguoi_dung_voucher', 'voucher_id', 'nguoi_dung_id')
            ->withPivot(['trang_thai', 'ngay_thu_thap', 'ngay_su_dung'])
            ->withTimestamps();
    }
    // Tự động cập nhật trạng thái dựa trên thời gian
    public function refreshStatus(): bool
    {
        $now = now();
        $newStatus = $this->trang_thai;

        if ($now->gt($this->thoi_gian_ket_thuc)) {
            $newStatus = 'Đã kết thúc';
        } elseif ($this->trang_thai !== 'Tạm dừng') {
            if ($now->lt($this->thoi_gian_bat_dau)) {
                $newStatus = 'Sắp diễn ra';
            } else {
                $newStatus = 'Đang diễn ra';
            }
        }

        if ($this->trang_thai !== $newStatus) {
            $this->trang_thai = $newStatus;
            return $this->save();
        }

        return false;
    }
}
