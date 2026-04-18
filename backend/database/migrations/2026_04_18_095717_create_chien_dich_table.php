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
        Schema::create('chien_dich', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('ma_chien_dich', 50)->nullable()->unique('ma_chien_dich');
            $table->string('ten_chien_dich');
            $table->text('mo_ta')->nullable();
            $table->dateTime('ngay_bat_dau');
            $table->dateTime('ngay_ket_thuc');
            $table->string('trang_thai', 50)->nullable()->default('dang_dien_ra');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chien_dich');
    }
};
