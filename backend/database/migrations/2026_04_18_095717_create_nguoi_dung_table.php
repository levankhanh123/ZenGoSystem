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
        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ho_ten', 100);
            $table->string('email', 150)->unique('email');
            $table->string('so_dien_thoai', 20)->nullable();
            $table->string('mat_khau');
            $table->string('vai_tro', 20)->index('idx_nguoi_dung_vai_tro');
            $table->string('anh_dai_dien')->nullable();
            $table->string('trang_thai', 20)->default('hoat_dong')->index('idx_nguoi_dung_trang_thai');
            $table->date('ngay_sinh')->nullable();
            $table->string('gioi_tinh', 10)->nullable();
            $table->string('cccd', 20)->nullable()->unique('cccd');
            $table->longText('dia_chi_mac_dinh')->nullable();
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('last_login_at')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->bigInteger('updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nguoi_dung');
    }
};
