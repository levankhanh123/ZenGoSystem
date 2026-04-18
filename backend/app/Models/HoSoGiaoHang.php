<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $nguoi_dung_id
 * @property string $ma_shipper
 * @property string $trang_thai_noi_bo
 * @property string|null $khu_vuc
 * @property \Illuminate\Support\Carbon|null $lan_can_thiep_gan_nhat
 * @property string|null $ly_do_can_thiep_gan_nhat
 * @property int|null $tong_don_giao
 * @property int|null $don_dang_giao
 * @property int|null $don_that_bai
 * @property int|null $don_hom_nay
 * @property int|null $don_tuan_nay
 * @property int|null $don_thang_nay
 * @property int|null $don_that_bai_thang_nay
 * @property string|null $ty_le_dung_han
 * @property string|null $danh_gia_trung_binh
 * @property string|null $ty_le_that_bai
 * @property string|null $ky_quy_hien_tai
 * @property string|null $cong_no_hien_tai
 * @property string|null $ghi_chu
 * @property-read \App\Models\NguoiDung|null $user
 */
class HoSoGiaoHang extends Model
{
    use HasFactory;

    protected $table = 'ho_so_giao_hang';

    protected $fillable = [
        'nguoi_dung_id',
        'ma_shipper',
        'trang_thai_noi_bo',
        'khu_vuc',
        'lan_can_thiep_gan_nhat',
        'ly_do_can_thiep_gan_nhat',
        'tong_don_giao',
        'don_dang_giao',
        'don_that_bai',
        'don_hom_nay',
        'don_tuan_nay',
        'don_thang_nay',
        'don_that_bai_thang_nay',
        'ty_le_dung_han',
        'danh_gia_trung_binh',
        'ty_le_that_bai',
        'ky_quy_hien_tai',
        'cong_no_hien_tai',
        'ghi_chu',
    ];

    protected $casts = [
        'lan_can_thiep_gan_nhat' => 'datetime',
        'ty_le_dung_han' => 'decimal:2',
        'danh_gia_trung_binh' => 'decimal:2',
        'ty_le_that_bai' => 'decimal:2',
        'ky_quy_hien_tai' => 'decimal:2',
        'cong_no_hien_tai' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }
}
