<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhMucShop extends Model
{
    use HasFactory;

    protected $table = 'danh_muc_shop';

    protected $fillable = [
        'cua_hang_id',
        'ten_danh_muc_shop',
        'slug',
    ];

    public function cuaHang()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function products()
    {
        return $this->hasMany(SanPham::class, 'danh_muc_shop_id');
    }
}
