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
        Schema::create('chi_tiet_gio_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('gio_hang_id')->index('idx_chi_tiet_gio_hang_gio_hang_id');
            $table->bigInteger('san_pham_id')->index('idx_chi_tiet_gio_hang_san_pham_id');
            $table->integer('so_luong')->default(1);
            $table->decimal('don_gia', 15);
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_gio_hang');
    }
};
