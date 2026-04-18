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
        Schema::create('tin_nhan', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('cuoc_tro_chuyen_id')->index('idx_tin_nhan_cuoc_tro_chuyen_id');
            $table->bigInteger('nguoi_gui_id')->index('idx_tin_nhan_nguoi_gui_id');
            $table->longText('noi_dung');
            $table->string('loai_tin_nhan', 20)->default('van_ban');
            $table->boolean('da_xem')->default(false);
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tin_nhan');
    }
};
