<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaoHang extends Model
{
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
        'ngay_nhan_don'      => 'datetime',
        'ngay_giao_du_kien'  => 'datetime',
        'ngay_giao_thuc_te'  => 'datetime',
        'cod_thu_ho'         => 'float',
        'so_lan_giao_lai'    => 'integer',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function nguoiGiaoHang()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_giao_hang_id');
    }
}