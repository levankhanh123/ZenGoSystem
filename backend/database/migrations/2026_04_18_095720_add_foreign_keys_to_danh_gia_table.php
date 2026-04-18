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
        Schema::table('danh_gia', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_danh_gia_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_mua_id'], 'fk_danh_gia_nguoi_mua')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['san_pham_id'], 'fk_danh_gia_san_pham')->references(['id'])->on('san_pham')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('danh_gia', function (Blueprint $table) {
            $table->dropForeign('fk_danh_gia_don_hang');
            $table->dropForeign('fk_danh_gia_nguoi_mua');
            $table->dropForeign('fk_danh_gia_san_pham');
        });
    }
};
