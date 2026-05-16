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
        Schema::table('dia_chi_nguoi_dung', function (Blueprint $table) {
            $table->integer('province_id')->nullable()->after('dia_chi_chi_tiet');
            $table->integer('district_id')->nullable()->after('province_id');
            $table->string('ward_code', 50)->nullable()->after('district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dia_chi_nguoi_dung', function (Blueprint $table) {
            $table->dropColumn(['province_id', 'district_id', 'ward_code']);
        });
    }
};
