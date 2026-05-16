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
            $table->decimal('so_tien_nguoi_ban', 15, 2)->default(0)->after('cod_da_thu');
            $table->decimal('so_tien_hoa_hong', 15, 2)->default(0)->after('so_tien_nguoi_ban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doi_soat_shipper', function (Blueprint $table) {
            $table->dropColumn(['so_tien_nguoi_ban', 'so_tien_hoa_hong']);
        });
    }
};
