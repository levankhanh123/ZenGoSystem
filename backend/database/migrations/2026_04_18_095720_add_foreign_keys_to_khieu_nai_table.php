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
        Schema::table('khieu_nai', function (Blueprint $table) {
            $table->foreign(['assigned_admin_id'], 'fk_khieu_nai_assigned_admin')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['doi_tuong_bi_khieu_nai_id'], 'fk_khieu_nai_doi_tuong_bi_khieu_nai')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['don_hang_id'], 'fk_khieu_nai_don_hang')->references(['id'])->on('don_hang')->onUpdate('no action')->onDelete('no action');
            $table->foreign(['nguoi_khieu_nai_id'], 'fk_khieu_nai_nguoi_khieu_nai')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('khieu_nai', function (Blueprint $table) {
            $table->dropForeign('fk_khieu_nai_assigned_admin');
            $table->dropForeign('fk_khieu_nai_doi_tuong_bi_khieu_nai');
            $table->dropForeign('fk_khieu_nai_don_hang');
            $table->dropForeign('fk_khieu_nai_nguoi_khieu_nai');
        });
    }
};
