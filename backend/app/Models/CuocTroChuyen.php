<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CuocTroChuyen extends Model
{
    protected $table = 'cuoc_tro_chuyen';

    protected $fillable = [
        'nguoi_mua_id',
        'cua_hang_id',
    ];

    public function nguoiMua()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_mua_id');
    }

    public function cuaHang()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function tinNhans()
    {
        return $this->hasMany(TinNhan::class, 'cuoc_tro_chuyen_id');
    }

    // Tin nhắn mới nhất
    public function tinNhanCuoi()
    {
        return $this->hasOne(TinNhan::class, 'cuoc_tro_chuyen_id')->latestOfMany();
    }
}