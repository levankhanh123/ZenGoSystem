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
        Schema::table('chi_tiet_gio_hang', function (Blueprint $table) {
            $table->foreign(['gio_hang_id'], 'fk_chi_tiet_gio_hang_gio_hang')->references(['id'])->on('gio_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['san_pham_id'], 'fk_chi_tiet_gio_hang_san_pham')->references(['id'])->on('san_pham')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chi_tiet_gio_hang', function (Blueprint $table) {
            $table->dropForeign('fk_chi_tiet_gio_hang_gio_hang');
            $table->dropForeign('fk_chi_tiet_gio_hang_san_pham');
        });
    }
};
