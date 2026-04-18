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
        Schema::table('gio_hang', function (Blueprint $table) {
            $table->foreign(['nguoi_mua_id'], 'fk_gio_hang_nguoi_mua')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gio_hang', function (Blueprint $table) {
            $table->dropForeign('fk_gio_hang_nguoi_mua');
        });
    }
};
