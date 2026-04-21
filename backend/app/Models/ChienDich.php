<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChienDich extends Model
{
    use HasFactory;

    protected $table = 'chien_dich';

    protected $fillable = [
        'ma_chien_dich',
        'ten_chien_dich',
        'mo_ta',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'trang_thai'
    ];

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'campaign_id');
    }

    public function registrations()
    {
        return $this->hasMany(DangKyChienDich::class, 'campaign_id');
    }
}
