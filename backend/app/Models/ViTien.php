<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViTien extends Model
{
    protected $table = 'vi_tien';
    public $timestamps = false;

    protected $fillable = [
        'nguoi_dung_id',
        'so_du',
        'so_du_dong_bang',
    ];

    protected $casts = [
        'so_du'           => 'float',
        'so_du_dong_bang' => 'float',
        'updated_at'      => 'datetime',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }

    // Số dư thực tế có thể dùng
    public function getSoDuKhaDungAttribute(): float
    {
        return $this->so_du - $this->so_du_dong_bang;
    }
}