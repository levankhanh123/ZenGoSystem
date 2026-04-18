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
        Schema::table('hoi_thoai', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_hoi_thoai_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['khieu_nai_id'], 'fk_hoi_thoai_khieu_nai')->references(['id'])->on('khieu_nai')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hoi_thoai', function (Blueprint $table) {
            $table->dropForeign('fk_hoi_thoai_don_hang');
            $table->dropForeign('fk_hoi_thoai_khieu_nai');
        });
    }
};
