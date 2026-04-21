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
        Schema::table('hoan_tien', function (Blueprint $table) {
            $table->foreign(['don_hang_id'], 'fk_hoan_tien_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['thanh_toan_id'], 'fk_hoan_tien_thanh_toan')->references(['id'])->on('thanh_toan')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hoan_tien', function (Blueprint $table) {
            $table->dropForeign('fk_hoan_tien_don_hang');
            $table->dropForeign('fk_hoan_tien_thanh_toan');
        });
    }
};
