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
            $table->integer('suc_chua_don_hang')->default(5)->after('district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ho_so_giao_hang', function (Blueprint $table) {
            $table->dropColumn('suc_chua_don_hang');
        });
    }
};
