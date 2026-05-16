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
        Schema::table('dang_ky_chien_dich', function (Blueprint $table) {
            // Xóa khóa ngoại cũ trỏ tới chien_dich
            $table->dropForeign('fk_dang_ky_chien_dich_campaign');
            
            // Thêm khóa ngoại mới trỏ tới voucher (vì hệ thống đã chuyển sang dùng Voucher làm Campaign)
            $table->foreign('campaign_id')
                ->references('id')
                ->on('voucher')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dang_ky_chien_dich', function (Blueprint $table) {
            $table->dropForeign(['campaign_id']);
            
            $table->foreign(['campaign_id'], 'fk_dang_ky_chien_dich_campaign')
                ->references(['id'])
                ->on('chien_dich')
                ->onUpdate('no action')
                ->onDelete('no action');
        });
    }
};
