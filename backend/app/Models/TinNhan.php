<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TinNhan extends Model
{
    protected $table = 'tin_nhan';
    public $timestamps = false;

    protected $fillable = [
        'cuoc_tro_chuyen_id',
        'nguoi_gui_id',
        'noi_dung',
        'loai_tin_nhan',
        'da_xem',
    ];

    protected $casts = [
        'da_xem'     => 'boolean',
        'created_at' => 'datetime',
    ];

    public function cuocTroChuyen()
    {
        return $this->belongsTo(CuocTroChuyen::class, 'cuoc_tro_chuyen_id');
    }

    public function nguoiGui()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_gui_id');
    }
}