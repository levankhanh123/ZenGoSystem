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
        Schema::table('thanh_toan', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_thanh_toan_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('thanh_toan', function (Blueprint $table) {
            $table->dropForeign('fk_thanh_toan_don_hang');
        });
    }
};
