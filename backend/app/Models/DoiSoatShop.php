<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $ma_doi_soat
 * @property string|null $ky_doi_soat
 * @property int $shop_id
 * @property string $doanh_thu_gop
 * @property string $phi_san
 * @property string $phi_van_chuyen
 * @property string $voucher_ho_tro
 * @property string $hoan_tien
 * @property string $thuc_nhan
 * @property string $trang_thai
 * @property \Illuminate\Support\Carbon|null $ngay_doi_soat
 * @property string|null $ghi_chu
 * @property-read \App\Models\CuaHang|null $shop
 */
class DoiSoatShop extends Model
{
    use HasFactory;

    protected $table = 'doi_soat_shop';

    protected $fillable = [
        'ma_doi_soat',
        'ky_doi_soat',
        'shop_id',
        'doanh_thu_gop',
        'phi_san',
        'phi_van_chuyen',
        'voucher_ho_tro',
        'hoan_tien',
        'thuc_nhan',
        'trang_thai',
        'ngay_doi_soat',
        'ghi_chu',
    ];

    protected $casts = [
        'doanh_thu_gop' => 'decimal:2',
        'phi_san' => 'decimal:2',
        'phi_van_chuyen' => 'decimal:2',
        'voucher_ho_tro' => 'decimal:2',
        'hoan_tien' => 'decimal:2',
        'thuc_nhan' => 'decimal:2',
        'ngay_doi_soat' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(CuaHang::class, 'shop_id');
    }
}
