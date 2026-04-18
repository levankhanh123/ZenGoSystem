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
        Schema::table('tin_nhan_hoi_thoai', function (Blueprint $table) {
            $table->foreign(['hoi_thoai_id'], 'fk_tin_nhan_hoi_thoai_hoi_thoai')->references(['id'])->on('hoi_thoai')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_gui_id'], 'fk_tin_nhan_hoi_thoai_nguoi_gui')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tin_nhan_hoi_thoai', function (Blueprint $table) {
            $table->dropForeign('fk_tin_nhan_hoi_thoai_hoi_thoai');
            $table->dropForeign('fk_tin_nhan_hoi_thoai_nguoi_gui');
        });
    }
};
