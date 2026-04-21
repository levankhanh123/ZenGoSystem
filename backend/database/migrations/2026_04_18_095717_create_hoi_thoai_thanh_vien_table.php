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
        Schema::create('hoi_thoai_thanh_vien', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('hoi_thoai_id');
            $table->bigInteger('nguoi_dung_id')->index('idx_hoi_thoai_thanh_vien_nguoi_dung_id');
            $table->string('vai_tro_tham_gia', 20);
            $table->boolean('da_doc')->default(false);
            $table->dateTime('last_read_at')->nullable();
            $table->dateTime('created_at')->nullable();

            $table->unique(['hoi_thoai_id', 'nguoi_dung_id'], 'uq_hoi_thoai_thanh_vien');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoi_thoai_thanh_vien');
    }
};
