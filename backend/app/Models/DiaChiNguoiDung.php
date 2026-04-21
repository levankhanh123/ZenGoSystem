<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaChiNguoiDung extends Model
{
    protected $table = 'dia_chi_nguoi_dung';

    protected $fillable = [
        'nguoi_dung_id',
        'ten_nguoi_nhan',
        'so_dien_thoai',
        'dia_chi_chi_tiet',
        'la_mac_dinh',
    ];

    protected $casts = [
        'la_mac_dinh' => 'boolean',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }
}