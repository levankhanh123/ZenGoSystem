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
        Schema::create('voucher', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('cua_hang_id')->nullable()->index('fk_voucher_cua_hang');
            $table->bigInteger('campaign_id')->nullable()->index('fk_voucher_campaign');
            $table->string('ma_voucher', 50)->unique('ma_voucher');
            $table->string('ten_voucher');
            $table->string('loai', 50)->index('idx_chien_dich_loai');
            $table->string('kieu_giam_gia', 20)->default('so_tien');
            $table->longText('mo_ta')->nullable();
            $table->dateTime('thoi_gian_bat_dau');
            $table->dateTime('thoi_gian_ket_thuc');
            $table->string('trang_thai', 30)->default('sap_dien_ra')->index('idx_chien_dich_trang_thai');
            $table->decimal('gia_tri_voucher', 15)->default(0);
            $table->decimal('gia_tri_don_toi_thieu', 15)->default(0);
            $table->decimal('giam_toi_da', 15)->default(0);
            $table->integer('so_luong_voucher')->default(0);
            $table->integer('so_luong_da_dung')->default(0);
            $table->integer('so_luong_con_lai')->default(0);
            $table->integer('so_luong_moi_nguoi')->default(1);
            $table->decimal('muc_ho_tro_san', 15)->default(0);
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
        Schema::dropIfExists('voucher');
    }
};
