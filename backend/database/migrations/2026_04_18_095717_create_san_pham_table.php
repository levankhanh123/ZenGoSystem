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
        Schema::create('san_pham', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('cua_hang_id')->index('idx_san_pham_cua_hang_id');
            $table->bigInteger('danh_muc_id')->index('idx_san_pham_danh_muc_id');
            $table->string('sku', 50)->nullable()->unique('idx_san_pham_sku_unique');
            $table->string('ten_san_pham', 200);
            $table->string('slug', 220)->unique('slug');
            $table->longText('mo_ta')->nullable();
            $table->decimal('gia', 15);
            $table->integer('so_luong_ton')->default(0);
            $table->integer('so_luong_tam_giu')->default(0);
            $table->integer('khoi_luong')->nullable();
            $table->string('hinh_dai_dien')->nullable();
            $table->string('trang_thai', 20)->default('nhap')->index('idx_san_pham_trang_thai');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('san_pham');
    }
};
