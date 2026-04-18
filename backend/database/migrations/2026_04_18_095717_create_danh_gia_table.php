<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('danh_gia', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_mua_id')->index('idx_danh_gia_nguoi_mua_id');
            $table->bigInteger('san_pham_id')->index('idx_danh_gia_san_pham_id');
            $table->bigInteger('don_hang_id')->index('idx_danh_gia_don_hang_id');
            $table->integer('so_sao');
            $table->longText('noi_dung')->nullable();
            $table->longText('noi_dung_phan_hoi')->nullable();
            $table->dateTime('thoi_gian_phan_hoi')->nullable();
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('danh_gia');
    }
};
