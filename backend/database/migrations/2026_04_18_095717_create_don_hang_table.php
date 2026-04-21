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
        Schema::create('don_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_don_hang', 50)->unique('ma_don_hang');
            $table->bigInteger('nguoi_mua_id')->index('idx_don_hang_nguoi_mua_id');
            $table->bigInteger('cua_hang_id')->index('idx_don_hang_cua_hang_id');
            $table->string('ten_nguoi_nhan', 100);
            $table->string('so_dien_thoai_nguoi_nhan', 20);
            $table->longText('dia_chi_nhan');
            $table->longText('ghi_chu')->nullable();
            $table->decimal('tam_tinh', 15)->default(0);
            $table->decimal('phi_giao_hang', 15)->default(0);
            $table->decimal('giam_gia', 15)->default(0);
            $table->decimal('tong_tien', 15)->default(0);
            $table->string('phuong_thuc_thanh_toan', 20)->nullable();
            $table->string('trang_thai_thanh_toan', 30)->default('chua_thanh_toan')->index('idx_don_hang_trang_thai_thanh_toan');
            $table->string('trang_thai_don_hang', 30)->default('cho_xac_nhan')->index('idx_don_hang_trang_thai_don_hang');
            $table->longText('ly_do_huy')->nullable();
            $table->boolean('bat_thuong')->default(false)->index('idx_don_hang_bat_thuong');
            $table->longText('ly_do_bat_thuong')->nullable();
            $table->string('loai_xu_ly', 20)->default('tu_dong');
            $table->string('trang_thai_xac_nhan', 30)->default('cho_he_thong_xac_nhan');
            $table->bigInteger('nguoi_xac_nhan_id')->nullable()->index('fk_don_hang_nguoi_xac_nhan');
            $table->dateTime('thoi_gian_xac_nhan')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->bigInteger('updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don_hang');
    }
};
