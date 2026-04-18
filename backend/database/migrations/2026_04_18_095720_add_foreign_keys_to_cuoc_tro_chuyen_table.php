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
        Schema::table('cuoc_tro_chuyen', function (Blueprint $table) {
            $table->foreign(['cua_hang_id'], 'fk_cuoc_tro_chuyen_cua_hang')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_mua_id'], 'fk_cuoc_tro_chuyen_nguoi_mua')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuoc_tro_chuyen', function (Blueprint $table) {
            $table->dropForeign('fk_cuoc_tro_chuyen_cua_hang');
            $table->dropForeign('fk_cuoc_tro_chuyen_nguoi_mua');
        });
    }
};
