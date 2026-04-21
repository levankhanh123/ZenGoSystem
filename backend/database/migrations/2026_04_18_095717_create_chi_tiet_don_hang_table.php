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
        Schema::create('chi_tiet_don_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('don_hang_id')->index('idx_chi_tiet_don_hang_don_hang_id');
            $table->bigInteger('san_pham_id')->index('idx_chi_tiet_don_hang_san_pham_id');
            $table->string('ten_san_pham', 200);
            $table->decimal('don_gia', 15);
            $table->integer('so_luong');
            $table->decimal('thanh_tien', 15);
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_don_hang');
    }
};
