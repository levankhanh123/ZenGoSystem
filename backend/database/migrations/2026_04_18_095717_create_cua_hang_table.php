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
        Schema::create('cua_hang', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_ban_id')->index('idx_cua_hang_nguoi_ban_id');
            $table->string('ten_cua_hang', 150);
            $table->string('email', 150)->nullable();
            $table->string('so_dien_thoai', 20)->nullable();
            $table->longText('mo_ta')->nullable();
            $table->longText('dia_chi_lay_hang')->nullable();
            $table->string('logo')->nullable();
            $table->string('ma_so_thue', 30)->nullable()->unique('ma_so_thue');
            $table->string('trang_thai', 20)->default('cho_duyet')->index('idx_cua_hang_trang_thai');
            $table->longText('ly_do_tu_choi')->nullable();
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('lan_kiem_tra_gan_nhat')->nullable();
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
        Schema::dropIfExists('cua_hang');
    }
};
