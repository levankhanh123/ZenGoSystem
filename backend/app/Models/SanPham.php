<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

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
        'updated_by',
    ];

    protected $casts = [
        'gia'              => 'decimal:2',
        'so_luong_ton'     => 'integer',
        'so_luong_tam_giu' => 'integer',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    public function danhMuc()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_id');
    }

    public function cuaHang()
    {
        return $this->belongsTo(CuaHang::class, 'cua_hang_id');
    }

    public function chiTietDonHang()
    {
        return $this->hasMany(ChiTietDonHang::class, 'san_pham_id');
    }

    public function danhGia()
    {
        return $this->hasMany(DanhGia::class, 'san_pham_id');
    }

    // Tên đúng để dùng trong ProductController::detail()
    public function hinhAnhSanPham()
    {
        return $this->hasMany(HinhAnhSanPham::class, 'san_pham_id');
    }

    // Alias cũ (giữ tương thích)
    public function hinhAnhs()
    {
        return $this->hinhAnhSanPham();
    }

    public function chiTietGioHang()
    {
        return $this->hasMany(ChiTietGioHang::class, 'san_pham_id');
    }

    // Tồn kho thực tế
    public function getTonKhoThucTeAttribute(): int
    {
        return $this->so_luong_ton - ($this->so_luong_tam_giu ?? 0);
    }

    // Scopes
    public function scopeDangBan(Builder $query): Builder
    {
        return $query->where('trang_thai', 'dang_ban')
                     ->orWhere('trang_thai', 'Hoạt động'); // Handle both conventions
    }
}