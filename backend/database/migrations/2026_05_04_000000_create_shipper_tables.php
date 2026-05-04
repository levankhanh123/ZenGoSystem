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
        // Bảng Đối soát Shipper
        if (!Schema::hasTable('doi_soat_shipper')) {
            Schema::create('doi_soat_shipper', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('nguoi_giao_hang_id');
                $table->unsignedBigInteger('don_hang_id')->nullable();
                $table->integer('so_don_hang')->default(0);
                $table->decimal('tong_tien', 12, 2)->default(0);
                $table->decimal('phi_va_chi_phi', 12, 2)->default(0);
                $table->decimal('phi_khau_tru', 12, 2)->default(0);
                $table->decimal('thuong', 12, 2)->default(0);
                $table->decimal('tien_phai_tra', 12, 2)->default(0);
                $table->enum('trang_thai', ['pending', 'completed', 'paid'])->default('pending');
                $table->text('ghi_chu')->nullable();
                $table->timestamp('ngay_tao')->useCurrent();
                $table->timestamp('ngay_xac_nhan')->nullable();
                $table->timestamp('ngay_thanh_toan')->nullable();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                
                $table->foreign('nguoi_giao_hang_id')
                    ->references('id')
                    ->on('nguoi_dung')
                    ->onDelete('cascade');
            });
        }

        // Bảng Lịch sử trạng thái đơn hàng
        if (!Schema::hasTable('lich_su_trang_thai_don_hang')) {
            Schema::create('lich_su_trang_thai_don_hang', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('don_hang_id');
                $table->string('trang_thai_cu')->nullable();
                $table->string('trang_thai_moi');
                $table->text('ghi_chu')->nullable();
                $table->unsignedBigInteger('nguoi_cap_nhat_id');
                $table->timestamp('created_at')->useCurrent();
                
                $table->foreign('don_hang_id')
                    ->references('id')
                    ->on('don_hang')
                    ->onDelete('cascade');
                    
                $table->foreign('nguoi_cap_nhat_id')
                    ->references('id')
                    ->on('nguoi_dung')
                    ->onDelete('restrict');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lich_su_trang_thai_don_hang');
        Schema::dropIfExists('doi_soat_shipper');
    }
};
