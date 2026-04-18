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
        Schema::create('thong_bao', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_dung_id')->index('idx_thong_bao_nguoi_dung_id');
            $table->string('tieu_de');
            $table->longText('noi_dung');
            $table->string('loai_thong_bao', 50)->nullable();
            $table->boolean('da_doc')->default(false);
            $table->dateTime('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thong_bao');
    }
};
