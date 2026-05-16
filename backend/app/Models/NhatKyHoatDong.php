<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NhatKyHoatDong extends Model
{
    use HasFactory;

    protected $table = 'nhat_ky_hoat_dong';

    protected $fillable = [
        'nguoi_dung_id',
        'hanh_dong',
        'mo_ta',
        'ip_address',
        'user_agent',
    ];

    public function nguoiDung(): BelongsTo
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }
}
