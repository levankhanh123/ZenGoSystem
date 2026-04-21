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
        Schema::create('dang_ky_chien_dich', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('campaign_id');
            $table->bigInteger('shop_id')->index('idx_dang_ky_chien_dich_shop_id');
            $table->dateTime('ngay_dang_ky')->nullable();
            $table->string('trang_thai', 20)->default('cho_duyet')->index('idx_dang_ky_chien_dich_trang_thai');
            $table->longText('ly_do_tu_choi')->nullable();
            $table->longText('ghi_chu_admin')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();

            $table->unique(['campaign_id', 'shop_id'], 'uq_dang_ky_chien_dich');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dang_ky_chien_dich');
    }
};
