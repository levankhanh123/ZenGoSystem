<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $ma_doi_soat_shipper
 * @property int $shipper_id
 * @property string $cod_da_thu
 * @property string $cod_da_nop
 * @property string $cod_con_thieu
 * @property string $phi_giao_hang_duoc_huong
 * @property string $ky_quy_hien_tai
 * @property string $cong_no
 * @property string $trang_thai_cong_no
 * @property \Illuminate\Support\Carbon|null $ngay_cap_nhat
 * @property string|null $ghi_chu
 * @property-read \App\Models\NguoiDung|null $shipper
 */
class DoiSoatShipper extends Model
{
    use HasFactory;

    protected $table = 'doi_soat_shipper';

    protected $fillable = [
        'ma_doi_soat_shipper',
        'shipper_id',
        'cod_da_thu',
        'cod_da_nop',
        'cod_con_thieu',
        'phi_giao_hang_duoc_huong',
        'ky_quy_hien_tai',
        'cong_no',
        'trang_thai_cong_no',
        'ngay_cap_nhat',
        'ghi_chu',
    ];

    protected $casts = [
        'cod_da_thu' => 'decimal:2',
        'cod_da_nop' => 'decimal:2',
        'cod_con_thieu' => 'decimal:2',
        'phi_giao_hang_duoc_huong' => 'decimal:2',
        'ky_quy_hien_tai' => 'decimal:2',
        'cong_no' => 'decimal:2',
        'ngay_cap_nhat' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function shipper()
    {
        return $this->belongsTo(NguoiDung::class, 'shipper_id');
    }
}
