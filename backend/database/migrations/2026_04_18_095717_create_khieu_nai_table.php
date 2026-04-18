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
        Schema::create('khieu_nai', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_khieu_nai', 50)->unique('ma_khieu_nai');
            $table->string('nguon_tao', 20)->default('don_hang');
            $table->bigInteger('don_hang_id')->index('idx_khieu_nai_don_hang_id');
            $table->bigInteger('nguoi_khieu_nai_id')->index('idx_khieu_nai_nguoi_khieu_nai_id');
            $table->bigInteger('doi_tuong_bi_khieu_nai_id')->nullable()->index('idx_khieu_nai_doi_tuong_bi_khieu_nai_id');
            $table->string('loai_doi_tuong', 20)->nullable();
            $table->string('ly_do', 100);
            $table->longText('noi_dung');
            $table->longText('hinh_anh_bang_chung')->nullable();
            $table->string('trang_thai', 30)->default('dang_xu_ly')->index('idx_khieu_nai_trang_thai');
            $table->string('uu_tien', 20)->default('trung_binh');
            $table->longText('phan_quyet_admin')->nullable();
            $table->longText('ly_do_tu_choi')->nullable();
            $table->bigInteger('assigned_admin_id')->nullable()->index('fk_khieu_nai_assigned_admin');
            $table->dateTime('resolved_at')->nullable();
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
        Schema::dropIfExists('khieu_nai');
    }
};
