<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GioHang extends Model
{
    protected $table = 'gio_hang';

    protected $fillable = ['nguoi_mua_id'];

    public function nguoiMua()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function chiTiet()
    {
        return $this->hasMany(ChiTietGioHang::class, 'gio_hang_id');
    }

    // Tổng số lượng sản phẩm trong giỏ
    public function getTongSoLuongAttribute(): int
    {
        return $this->chiTiet->sum('so_luong');
    }

    // Tổng tiền giỏ hàng
    public function getTongTienAttribute(): float
    {
        return $this->chiTiet->sum(fn($c) => $c->don_gia * $c->so_luong);
    }
}