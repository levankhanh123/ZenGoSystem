<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhieuNai extends Model
{
    protected $table = 'khieu_nai';

    protected $fillable = [
        'ma_khieu_nai', 'nguon_tao', 'don_hang_id',
        'nguoi_khieu_nai_id', 'doi_tuong_bi_khieu_nai_id',
        'loai_doi_tuong', 'ly_do', 'noi_dung',
        'hinh_anh_bang_chung', 'trang_thai', 'uu_tien',
    ];

    protected $casts = [
        'hinh_anh_bang_chung' => 'array',
        'resolved_at'         => 'datetime',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function nguoiKhieuNai()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_khieu_nai_id');
    }

    public function doiTuongBiKhieuNai()
    {
        return $this->belongsTo(NguoiDung::class, 'doi_tuong_bi_khieu_nai_id');
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(NguoiDung::class, 'assigned_admin_id');
    }
}