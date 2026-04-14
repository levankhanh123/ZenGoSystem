<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SanPham extends Model
{
    use HasFactory;

    protected $table = 'san_pham';

    protected $fillable = [
        'cua_hang_id',
        'danh_muc_id',
        'sku',
        'ten_san_pham',
        'slug',
        'mo_ta',
        'gia',
        'so_luong_ton',
        'so_luong_tam_giu',
        'khoi_luong',
        'hinh_dai_dien',
        'trang_thai',
        'created_by',
        'updated_by'
    ];
}
