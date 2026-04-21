<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $don_hang_id
 * @property int|null $nguoi_giao_hang_id
 * @property string|null $ma_van_don
 * @property \Illuminate\Support\Carbon|null $ngay_nhan_don
 * @property \Illuminate\Support\Carbon|null $ngay_giao_du_kien
 * @property \Illuminate\Support\Carbon|null $ngay_giao_thuc_te
 * @property string $trang_thai
 * @property string|null $ly_do_that_bai
 * @property int|null $so_lan_giao_lai
 * @property string|null $cod_thu_ho
 * @property string|null $ghi_chu
 * @property-read \App\Models\DonHang|null $order
 * @property-read \App\Models\NguoiDung|null $shipper
 */
class GiaoHang extends Model
{
    use HasFactory;

    protected $table = 'giao_hang';

    protected $fillable = [
        'don_hang_id',
        'nguoi_giao_hang_id',
        'ma_van_don',
        'ngay_nhan_don',
        'ngay_giao_du_kien',
        'ngay_giao_thuc_te',
        'trang_thai',
        'ly_do_that_bai',
        'so_lan_giao_lai',
        'cod_thu_ho',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_nhan_don' => 'datetime',
        'ngay_giao_du_kien' => 'datetime',
        'ngay_giao_thuc_te' => 'datetime',
        'cod_thu_ho' => 'decimal:2',
        'so_lan_giao_lai' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function donHang()
    {
        return $this->order();
    }

    public function shipper()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_giao_hang_id');
    }

    public function nguoiGiaoHang()
    {
        return $this->shipper();
    }
}
