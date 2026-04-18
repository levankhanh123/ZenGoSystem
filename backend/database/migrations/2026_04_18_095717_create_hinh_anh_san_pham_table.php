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
        Schema::create('hinh_anh_san_pham', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('san_pham_id')->index('idx_hinh_anh_san_pham_san_pham_id');
            $table->string('duong_dan_anh');
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hinh_anh_san_pham');
    }
};
