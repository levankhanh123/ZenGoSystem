<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Eloquent
 * @property int $id
 * @property string $ma_khieu_nai
 * @property string|null $nguon_tao
 * @property int $don_hang_id
 * @property int $nguoi_khieu_nai_id
 * @property int|null $doi_tuong_bi_khieu_nai_id
 * @property string|null $loai_doi_tuong
 * @property string $ly_do
 * @property string $noi_dung
 * @property string|null $trang_thai
 * @property string|null $uu_tien
 * @property string|null $phan_quyet_admin
 * @property string|null $ly_do_tu_choi
 * @property int|null $assigned_admin_id
 * @property \Illuminate\Support\Carbon|null $resolved_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DonHang|null $order
 * @property-read \App\Models\NguoiDung|null $complainant
 * @property-read \App\Models\NguoiDung|null $assignedAdmin
 * @property-read \App\Models\HoiThoai|null $conversation
 */
class KhieuNai extends Model
{
    use HasFactory;

    protected $table = 'khieu_nai';

    protected $fillable = [
        'ma_khieu_nai',
        'nguon_tao',
        'don_hang_id',
        'nguoi_khieu_nai_id',
        'doi_tuong_bi_khieu_nai_id',
        'loai_doi_tuong',
        'ly_do',
        'noi_dung',
        'hinh_anh_bang_chung',
        'trang_thai',
        'uu_tien',
        'phan_quyet_admin',
        'ly_do_tu_choi',
        'assigned_admin_id',
        'resolved_at',
        'updated_by',
    ];

    protected $casts = [
        'hinh_anh_bang_chung' => 'array',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function donHang()
    {
        return $this->order();
    }

    public function complainant()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_khieu_nai_id');
    }

    public function nguoiKhieuNai()
    {
        return $this->complainant();
    }

    public function doiTuongBiKhieuNai()
    {
        return $this->belongsTo(NguoiDung::class, 'doi_tuong_bi_khieu_nai_id');
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(NguoiDung::class, 'assigned_admin_id');
    }

    public function conversation()
    {
        return $this->hasOne(HoiThoai::class, 'khieu_nai_id');
    }
}
