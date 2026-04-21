<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $loai
 * @property string $doi_tuong
 * @property string $noi_dung
 * @property string $so_tien
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class NhatKyTaiChinh extends Model
{
    use HasFactory;

    protected $table = 'nhat_ky_tai_chinh';

    public $timestamps = false; // Only created_at exists

    protected $fillable = [
        'loai',
        'doi_tuong',
        'noi_dung',
        'so_tien',
        'created_at',
    ];

    protected $casts = [
        'so_tien' => 'decimal:2',
        'created_at' => 'datetime',
    ];
}

