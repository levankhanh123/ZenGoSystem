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
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->foreign(['cuoc_tro_chuyen_id'], 'fk_tin_nhan_cuoc_tro_chuyen')->references(['id'])->on('cuoc_tro_chuyen')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_gui_id'], 'fk_tin_nhan_nguoi_gui')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->dropForeign('fk_tin_nhan_cuoc_tro_chuyen');
            $table->dropForeign('fk_tin_nhan_nguoi_gui');
        });
    }
};
