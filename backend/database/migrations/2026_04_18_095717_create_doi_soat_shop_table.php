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
        Schema::create('doi_soat_shop', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_doi_soat', 50)->unique('ma_doi_soat');
            $table->string('ky_doi_soat', 20);
            $table->bigInteger('shop_id')->index('idx_doi_soat_shop_shop_id');
            $table->decimal('doanh_thu_gop', 15)->default(0);
            $table->decimal('phi_san', 15)->default(0);
            $table->decimal('phi_van_chuyen', 15)->default(0);
            $table->decimal('voucher_ho_tro', 15)->default(0);
            $table->decimal('hoan_tien', 15)->default(0);
            $table->decimal('thuc_nhan', 15)->default(0);
            $table->string('trang_thai', 20)->default('cho_chuyen_khoan')->index('idx_doi_soat_shop_trang_thai');
            $table->date('ngay_doi_soat')->nullable();
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
        Schema::dropIfExists('doi_soat_shop');
    }
};
