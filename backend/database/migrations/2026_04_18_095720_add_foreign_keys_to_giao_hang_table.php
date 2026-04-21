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
        Schema::table('giao_hang', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_giao_hang_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_giao_hang_id'], 'fk_giao_hang_nguoi_giao_hang')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('giao_hang', function (Blueprint $table) {
            $table->dropForeign('fk_giao_hang_don_hang');
            $table->dropForeign('fk_giao_hang_nguoi_giao_hang');
        });
    }
};
