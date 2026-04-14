<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TinNhan extends Model
{
    use HasFactory;

    protected $table = 'tin_nhan';
    
    const UPDATED_AT = null;
    
    protected $fillable = [
        'cuoc_tro_chuyen_id',
        'nguoi_gui_id',
        'noi_dung',
        'loai_tin_nhan',
    ];

    public function cuoc_tro_chuyen() {
        return $this->belongsTo(CuocTroChuyen::class, 'cuoc_tro_chuyen_id', 'id');
    }
}
