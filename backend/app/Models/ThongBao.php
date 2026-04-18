<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $nguoi_dung_id
 * @property string $tieu_de
 * @property string $noi_dung
 * @property string|null $loai_thong_bao
 * @property bool $da_doc
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property string|null $target_role
 * @property-read \App\Models\NguoiDung|null $user
 */
class ThongBao extends Model
{
    use HasFactory;

    protected $table = 'thong_bao';

    public $timestamps = false;

    protected $appends = [
        'target_role',
    ];

    protected $fillable = [
        'nguoi_dung_id',
        'tieu_de',
        'noi_dung',
        'loai_thong_bao',
        'da_doc',
        'created_at',
    ];

    protected $casts = [
        'da_doc' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }

    public function getTargetRoleAttribute()
    {
        return $this->user?->vai_tro;
    }
}
