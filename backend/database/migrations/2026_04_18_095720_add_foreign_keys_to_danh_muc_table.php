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
        Schema::table('danh_muc', function (Blueprint $table) {
            $table->foreign(['danh_muc_cha_id'], 'fk_danh_muc_cha')->references(['id'])->on('danh_muc')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('danh_muc', function (Blueprint $table) {
            $table->dropForeign('fk_danh_muc_cha');
        });
    }
};
