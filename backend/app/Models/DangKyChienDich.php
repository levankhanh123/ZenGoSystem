<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DangKyChienDich extends Model
{
    use HasFactory;

    protected $table = 'dang_ky_chien_dich';

    protected $fillable = [
        'campaign_id',
        'shop_id',
        'ngay_dang_ky',
        'trang_thai',
        'ly_do_tu_choi',
        'ghi_chu_admin'
    ];

    public function campaign()
    {
        return $this->belongsTo(ChienDich::class, 'campaign_id');
    }
}
