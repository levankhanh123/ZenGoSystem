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
        Schema::table('voucher', function (Blueprint $table) {
            $table->foreign(['campaign_id'], 'fk_voucher_campaign')->references(['id'])->on('chien_dich')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['cua_hang_id'], 'fk_voucher_cua_hang')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher', function (Blueprint $table) {
            $table->dropForeign('fk_voucher_campaign');
            $table->dropForeign('fk_voucher_cua_hang');
        });
    }
};
