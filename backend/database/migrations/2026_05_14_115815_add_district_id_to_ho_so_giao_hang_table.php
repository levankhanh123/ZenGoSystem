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
        Schema::table('ho_so_giao_hang', function (Blueprint $table) {
            $table->integer('district_id')->nullable()->after('khu_vuc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ho_so_giao_hang', function (Blueprint $table) {
            $table->dropColumn('district_id');
        });
    }
};
