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
        Schema::table('dang_ky_chien_dich', function (Blueprint $table) {
            $table->foreign(['campaign_id'], 'fk_dang_ky_chien_dich_campaign')->references(['id'])->on('chien_dich')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['shop_id'], 'fk_dang_ky_chien_dich_shop')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dang_ky_chien_dich', function (Blueprint $table) {
            $table->dropForeign('fk_dang_ky_chien_dich_campaign');
            $table->dropForeign('fk_dang_ky_chien_dich_shop');
        });
    }
};
