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
        Schema::create('lich_su_trang_thai_don_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('don_hang_id')->index('idx_lich_su_trang_thai_don_hang_don_hang_id');
            $table->bigInteger('nguoi_cap_nhat_id')->nullable()->index('fk_lich_su_trang_thai_don_hang_nguoi_cap_nhat');
            $table->string('trang_thai_cu', 50)->nullable();
            $table->string('trang_thai_moi', 50);
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lich_su_trang_thai_don_hang');
    }
};
