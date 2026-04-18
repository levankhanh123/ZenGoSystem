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
        Schema::table('chi_tiet_don_hang', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_chi_tiet_don_hang_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['san_pham_id'], 'fk_chi_tiet_don_hang_san_pham')->references(['id'])->on('san_pham')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chi_tiet_don_hang', function (Blueprint $table) {
            $table->dropForeign('fk_chi_tiet_don_hang_don_hang');
            $table->dropForeign('fk_chi_tiet_don_hang_san_pham');
        });
    }
};
