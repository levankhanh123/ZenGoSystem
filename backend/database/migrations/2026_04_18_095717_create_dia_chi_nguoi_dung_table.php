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
        Schema::create('dia_chi_nguoi_dung', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_dung_id')->index('idx_dia_chi_nguoi_dung_nguoi_dung_id');
            $table->string('ten_nguoi_nhan', 100);
            $table->string('so_dien_thoai', 20);
            $table->longText('dia_chi_chi_tiet');
            $table->boolean('la_mac_dinh')->default(false);
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dia_chi_nguoi_dung');
    }
};
