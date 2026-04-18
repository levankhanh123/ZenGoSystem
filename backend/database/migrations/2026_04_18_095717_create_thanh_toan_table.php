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
        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('don_hang_id')->index('idx_thanh_toan_don_hang_id');
            $table->string('ma_giao_dich', 100)->nullable()->unique('ma_giao_dich');
            $table->string('cong_thanh_toan', 20);
            $table->decimal('so_tien', 15);
            $table->string('trang_thai', 20)->default('cho_xu_ly')->index('idx_thanh_toan_trang_thai');
            $table->dateTime('thoi_gian_thanh_toan')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->longText('ghi_chu')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thanh_toan');
    }
};
