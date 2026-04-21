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
        Schema::create('giao_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('don_hang_id')->unique('don_hang_id');
            $table->bigInteger('nguoi_giao_hang_id')->nullable()->index('idx_giao_hang_nguoi_giao_hang_id');
            $table->string('ma_van_don', 100)->nullable()->unique('ma_van_don');
            $table->dateTime('ngay_nhan_don')->nullable();
            $table->dateTime('ngay_giao_du_kien')->nullable();
            $table->dateTime('ngay_giao_thuc_te')->nullable();
            $table->string('trang_thai', 30)->default('cho_nhan')->index('idx_giao_hang_trang_thai');
            $table->longText('ly_do_that_bai')->nullable();
            $table->integer('so_lan_giao_lai')->default(0);
            $table->decimal('cod_thu_ho', 15)->default(0);
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('giao_hang');
    }
};
