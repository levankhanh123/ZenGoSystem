<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CuocTroChuyen extends Model
{
    use HasFactory;

    protected $table = 'cuoc_tro_chuyen';
    
    // Các trường có thể được fill array
    protected $fillable = [
        'nguoi_mua_id',
        'cua_hang_id',
    ];

    public function tin_nhan() {
        return $this->hasMany(TinNhan::class, 'cuoc_tro_chuyen_id', 'id');
    }
}
