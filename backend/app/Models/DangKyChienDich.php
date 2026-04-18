<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $campaign_id
 * @property int $shop_id
 * @property \Illuminate\Support\Carbon|null $ngay_dang_ky
 * @property string $trang_thai
 * @property string|null $ly_do_tu_choi
 * @property string|null $ghi_chu_admin
 * @property-read \App\Models\Voucher|null $campaign
 * @property-read \App\Models\CuaHang|null $shop
 */
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
        'ghi_chu_admin',
    ];

    protected $casts = [
        'ngay_dang_ky' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(Voucher::class, 'campaign_id');
    }

    public function shop()
    {
        return $this->belongsTo(CuaHang::class, 'shop_id');
    }
}
