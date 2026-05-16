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
        Schema::create('nguoi_dung_voucher', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('nguoi_dung_id')->index();
            $table->bigInteger('voucher_id')->index();
            $table->string('trang_thai', 20)->default('chua_dung'); // chua_dung, da_dung, het_han
            $table->dateTime('ngay_thu_thap')->useCurrent();
            $table->dateTime('ngay_su_dung')->nullable();
            $table->timestamps();

            $table->foreign('nguoi_dung_id')->references('id')->on('nguoi_dung')->onDelete('cascade');
            $table->foreign('voucher_id')->references('id')->on('voucher')->onDelete('cascade');
            
            // Một người dùng chỉ được thu thập 1 loại voucher 1 lần (theo logic thông thường)
            $table->unique(['nguoi_dung_id', 'voucher_id'], 'unique_user_voucher');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nguoi_dung_voucher');
    }
};
