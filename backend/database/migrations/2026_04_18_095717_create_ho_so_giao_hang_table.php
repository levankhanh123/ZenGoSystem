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
        Schema::create('ho_so_giao_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_dung_id')->unique('nguoi_dung_id');
            $table->string('ma_shipper', 30)->unique('ma_shipper');
            $table->string('trang_thai_noi_bo', 20)->default('binh_thuong');
            $table->string('khu_vuc')->nullable();
            $table->dateTime('lan_can_thiep_gan_nhat')->nullable();
            $table->longText('ly_do_can_thiep_gan_nhat')->nullable();
            $table->integer('tong_don_giao')->default(0);
            $table->integer('don_dang_giao')->default(0);
            $table->integer('don_that_bai')->default(0);
            $table->integer('don_hom_nay')->default(0);
            $table->integer('don_tuan_nay')->default(0);
            $table->integer('don_thang_nay')->default(0);
            $table->integer('don_that_bai_thang_nay')->default(0);
            $table->decimal('ty_le_dung_han', 5)->default(0);
            $table->decimal('danh_gia_trung_binh', 3)->default(0);
            $table->decimal('ty_le_that_bai', 5)->default(0);
            $table->decimal('ky_quy_hien_tai', 15)->default(0);
            $table->decimal('cong_no_hien_tai', 15)->default(0);
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ho_so_giao_hang');
    }
};
