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
        Schema::table('danh_gia', function (Blueprint $table) {
            $table->longText('noi_dung_phan_hoi')->nullable()->after('noi_dung');
            $table->datetime('thoi_gian_phan_hoi')->nullable()->after('noi_dung_phan_hoi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('danh_gia', function (Blueprint $table) {
            $table->dropColumn(['noi_dung_phan_hoi', 'thoi_gian_phan_hoi']);
        });
    }
};
