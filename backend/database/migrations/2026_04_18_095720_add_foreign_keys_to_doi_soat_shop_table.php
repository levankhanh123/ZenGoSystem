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
        Schema::table('doi_soat_shop', function (Blueprint $table) {
            $table->foreign(['shop_id'], 'fk_doi_soat_shop_shop')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doi_soat_shop', function (Blueprint $table) {
            $table->dropForeign('fk_doi_soat_shop_shop');
        });
    }
};
