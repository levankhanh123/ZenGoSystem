<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $hoi_thoai_id
 * @property int $nguoi_dung_id
 * @property string $vai_tro_tham_gia
 * @property bool $da_doc
 * @property \Illuminate\Support\Carbon|null $last_read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \App\Models\HoiThoai|null $conversation
 * @property-read \App\Models\NguoiDung|null $user
 */
class HoiThoaiThanhVien extends Model
{
    use HasFactory;

    protected $table = 'hoi_thoai_thanh_vien';

    public $timestamps = false;

    protected $fillable = [
        'hoi_thoai_id',
        'nguoi_dung_id',
        'vai_tro_tham_gia',
        'da_doc',
        'last_read_at',
        'created_at',
    ];

    protected $casts = [
        'da_doc' => 'boolean',
        'last_read_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(HoiThoai::class, 'hoi_thoai_id');
    }

    public function user()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }
}
