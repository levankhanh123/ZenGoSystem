<?php
// app/Models/DanhMuc.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class DanhMuc extends Model
{
    protected $table = 'danh_muc';

    protected $fillable = ['ten_danh_muc', 'slug', 'danh_muc_cha_id', 'hinh_anh', 'thu_tu', 'trang_thai'];

    // ================= RELATIONS =================

    public function parent()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_cha_id');
    }
    public function danhMucCha()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_cha_id');
    }

    public function children()
    {
        return $this->hasMany(DanhMuc::class, 'danh_muc_cha_id')->orderBy('thu_tu');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'danh_muc_id');
    }

    // ================= SCOPES =================

    // Chỉ lấy danh mục cha (danh mục gốc)
    public function scopeDanhMucGoc(Builder $query): Builder
    {
        return $query->whereNull('danh_muc_cha_id');
    }
}