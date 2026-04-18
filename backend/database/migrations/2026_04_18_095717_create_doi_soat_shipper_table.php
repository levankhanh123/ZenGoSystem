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
        Schema::create('doi_soat_shipper', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_doi_soat_shipper', 50)->unique('ma_doi_soat_shipper');
            $table->bigInteger('shipper_id')->index('idx_doi_soat_shipper_shipper_id');
            $table->decimal('cod_da_thu', 15)->default(0);
            $table->decimal('cod_da_nop', 15)->default(0);
            $table->decimal('cod_con_thieu', 15)->default(0);
            $table->decimal('phi_giao_hang_duoc_huong', 15)->default(0);
            $table->decimal('ky_quy_hien_tai', 15)->default(0);
            $table->decimal('cong_no', 15)->default(0);
            $table->string('trang_thai_cong_no', 20)->default('binh_thuong');
            $table->date('ngay_cap_nhat')->nullable();
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
        Schema::dropIfExists('doi_soat_shipper');
    }
};
