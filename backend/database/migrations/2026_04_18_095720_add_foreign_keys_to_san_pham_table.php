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
        Schema::table('san_pham', function (Blueprint $table) {
            $table->foreign(['cua_hang_id'], 'fk_san_pham_cua_hang')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['danh_muc_id'], 'fk_san_pham_danh_muc')->references(['id'])->on('danh_muc')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('san_pham', function (Blueprint $table) {
            $table->dropForeign('fk_san_pham_cua_hang');
            $table->dropForeign('fk_san_pham_danh_muc');
        });
    }
};
