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
        if (!Schema::hasTable('voucher') || Schema::hasColumn('voucher', 'kieu_giam_gia')) {
            return;
        }

        Schema::table('voucher', function (Blueprint $column) {
            $column->string('kieu_giam_gia', 20)->default('so_tien')->after('loai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('voucher') || !Schema::hasColumn('voucher', 'kieu_giam_gia')) {
            return;
        }

        Schema::table('voucher', function (Blueprint $column) {
            $column->dropColumn('kieu_giam_gia');
        });
    }
};
