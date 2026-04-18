<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThongBao extends Model
{
    use HasFactory;

    protected $table = 'thong_bao';

    public $timestamps = false; // Bảng chỉ có cột created_at, không có updated_at

    protected $fillable = [
        'nguoi_dung_id',
        'tieu_de',
        'noi_dung',
        'loai_thong_bao',
        'da_doc',
        'created_at'
    ];
}
