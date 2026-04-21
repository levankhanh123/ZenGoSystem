<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhatKyTaiChinh extends Model
{
    protected $table = 'nhat_ky_tai_chinh';

    // Bảng chỉ có created_at, không có updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'loai',
        'doi_tuong',
        'noi_dung',
        'so_tien',
    ];

    protected $casts = [
        'so_tien'    => 'decimal:2',
        'created_at' => 'datetime',
    ];
}