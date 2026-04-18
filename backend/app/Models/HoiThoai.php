<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Eloquent
 * @property int $id
 * @property string $ma_hoi_thoai
 * @property string $loai_hoi_thoai
 * @property int|null $don_hang_id
 * @property int|null $khieu_nai_id
 * @property string $trang_thai
 * @property bool $chua_doc_admin
 * @property string|null $tin_nhan_cuoi
 * @property \Illuminate\Support\Carbon|null $thoi_gian_cuoi
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DonHang|null $order
 * @property-read \App\Models\KhieuNai|null $complaint
 */
class HoiThoai extends Model
{
    use HasFactory;

    protected $table = 'hoi_thoai';

    protected $fillable = [
        'ma_hoi_thoai',
        'loai_hoi_thoai',
        'don_hang_id',
        'khieu_nai_id',
        'trang_thai',
        'chua_doc_admin',
        'tin_nhan_cuoi',
        'thoi_gian_cuoi',
    ];

    protected $casts = [
        'chua_doc_admin' => 'boolean',
        'thoi_gian_cuoi' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function complaint()
    {
        return $this->belongsTo(KhieuNai::class, 'khieu_nai_id');
    }

    public function members()
    {
        return $this->hasMany(HoiThoaiThanhVien::class, 'hoi_thoai_id');
    }

    public function messages()
    {
        return $this->hasMany(TinNhanHoiThoai::class, 'hoi_thoai_id');
    }
}
