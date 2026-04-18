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
        Schema::create('hoi_thoai', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_hoi_thoai', 50)->unique('ma_hoi_thoai');
            $table->string('loai_hoi_thoai', 20)->default('ho_tro');
            $table->bigInteger('don_hang_id')->nullable()->index('idx_hoi_thoai_don_hang_id');
            $table->bigInteger('khieu_nai_id')->nullable()->index('idx_hoi_thoai_khieu_nai_id');
            $table->string('trang_thai', 20)->default('moi')->index('idx_hoi_thoai_trang_thai');
            $table->boolean('chua_doc_admin')->default(true);
            $table->longText('tin_nhan_cuoi')->nullable();
            $table->dateTime('thoi_gian_cuoi')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoi_thoai');
    }
};
