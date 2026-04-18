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
        Schema::table('thong_bao', function (Blueprint $table) {
            $table->foreign(['nguoi_dung_id'], 'fk_thong_bao_nguoi_dung')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('thong_bao', function (Blueprint $table) {
            $table->dropForeign('fk_thong_bao_nguoi_dung');
        });
    }
};
