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
        Schema::table('lich_su_trang_thai_don_hang', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_lich_su_trang_thai_don_hang_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_cap_nhat_id'], 'fk_lich_su_trang_thai_don_hang_nguoi_cap_nhat')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lich_su_trang_thai_don_hang', function (Blueprint $table) {
            $table->dropForeign('fk_lich_su_trang_thai_don_hang_don_hang');
            $table->dropForeign('fk_lich_su_trang_thai_don_hang_nguoi_cap_nhat');
        });
    }
};
