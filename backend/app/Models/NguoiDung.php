<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NguoiDung extends Model
{
    protected $table = 'nguoi_dung';
    public $timestamps = true;

    protected $fillable = [
        'ho_ten',
        'email',
        'so_dien_thoai',
        'mat_khau',
        'vai_tro',
        'anh_dai_dien',
        'trang_thai'
    ];

    protected $hidden = [
        'mat_khau',
    ];
}
