<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $hoi_thoai_id
 * @property int $nguoi_gui_id
 * @property int|null $nguoi_nhan_id
 * @property string $noi_dung
 * @property string $loai_tin_nhan
 * @property bool $da_xem
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \App\Models\HoiThoai|null $conversation
 * @property-read \App\Models\NguoiDung|null $recipient
 * @property-read \App\Models\NguoiDung|null $sender
 */
class TinNhanHoiThoai extends Model
{
    use HasFactory;

    protected $table = 'tin_nhan_hoi_thoai';

    public $timestamps = false;

    protected $fillable = [
        'hoi_thoai_id',
        'nguoi_gui_id',
        'nguoi_nhan_id',
        'noi_dung',
        'loai_tin_nhan',
        'da_xem',
        'created_at',
    ];

    protected $casts = [
        'da_xem' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(HoiThoai::class, 'hoi_thoai_id');
    }

    public function sender()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_gui_id');
    }

    public function recipient()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_nhan_id');
    }
}
