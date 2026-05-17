<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tin_nhan_hoi_thoai')) {
            return;
        }

        if (Schema::hasColumn('tin_nhan_hoi_thoai', 'nguoi_nhan_id')) {
            return;
        }

        Schema::table('tin_nhan_hoi_thoai', function (Blueprint $table) {
            $table->bigInteger('nguoi_nhan_id')
                ->nullable()
                ->after('nguoi_gui_id');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tin_nhan_hoi_thoai')) {
            return;
        }

        if (!Schema::hasColumn('tin_nhan_hoi_thoai', 'nguoi_nhan_id')) {
            return;
        }

        Schema::table('tin_nhan_hoi_thoai', function (Blueprint $table) {
            $table->dropColumn('nguoi_nhan_id');
        });
    }
};
