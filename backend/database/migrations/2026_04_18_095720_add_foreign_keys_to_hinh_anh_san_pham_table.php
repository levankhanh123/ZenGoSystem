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
        Schema::table('hinh_anh_san_pham', function (Blueprint $table) {
            $table->foreign(['san_pham_id'], 'fk_hinh_anh_san_pham_san_pham')->references(['id'])->on('san_pham')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hinh_anh_san_pham', function (Blueprint $table) {
            $table->dropForeign('fk_hinh_anh_san_pham_san_pham');
        });
    }
};
