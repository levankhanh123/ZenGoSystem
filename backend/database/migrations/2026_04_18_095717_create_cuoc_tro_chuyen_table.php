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
        Schema::create('cuoc_tro_chuyen', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_mua_id')->index('idx_cuoc_tro_chuyen_nguoi_mua_id');
            $table->bigInteger('cua_hang_id')->index('idx_cuoc_tro_chuyen_cua_hang_id');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuoc_tro_chuyen');
    }
};
