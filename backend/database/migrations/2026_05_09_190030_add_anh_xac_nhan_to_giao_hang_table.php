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
            $table->string('anh_xac_nhan')->nullable()->after('ghi_chu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('giao_hang', function (Blueprint $table) {
            $table->dropColumn('anh_xac_nhan');
        });
    }
};
