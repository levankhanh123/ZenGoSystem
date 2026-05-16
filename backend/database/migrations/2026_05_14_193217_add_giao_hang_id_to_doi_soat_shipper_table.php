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
        Schema::table('doi_soat_shipper', function (Blueprint $table) {
            $table->unsignedBigInteger('giao_hang_id')->nullable()->after('shipper_id');
            // $table->foreign('giao_hang_id')->references('id')->on('giao_hang')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doi_soat_shipper', function (Blueprint $table) {
            $table->dropColumn('giao_hang_id');
        });
    }
};
