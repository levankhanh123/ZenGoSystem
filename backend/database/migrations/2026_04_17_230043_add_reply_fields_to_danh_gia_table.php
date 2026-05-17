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
        if (!Schema::hasTable('danh_gia')) {
            return;
        }

        Schema::table('danh_gia', function (Blueprint $table) {
            if (!Schema::hasColumn('danh_gia', 'noi_dung_phan_hoi')) {
                $table->longText('noi_dung_phan_hoi')->nullable()->after('noi_dung');
            }
            if (!Schema::hasColumn('danh_gia', 'thoi_gian_phan_hoi')) {
                $table->datetime('thoi_gian_phan_hoi')->nullable()->after('noi_dung_phan_hoi');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('danh_gia')) {
            return;
        }

        Schema::table('danh_gia', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('danh_gia', 'noi_dung_phan_hoi') ? 'noi_dung_phan_hoi' : null,
                Schema::hasColumn('danh_gia', 'thoi_gian_phan_hoi') ? 'thoi_gian_phan_hoi' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
