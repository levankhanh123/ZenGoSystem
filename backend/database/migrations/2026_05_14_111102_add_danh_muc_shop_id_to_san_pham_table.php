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
        Schema::table('san_pham', function (Blueprint $table) {
            $table->unsignedBigInteger('danh_muc_shop_id')->nullable()->after('danh_muc_id')->index();
            
            // Foreign key to danh_muc_shop table
            $table->foreign('danh_muc_shop_id')->references('id')->on('danh_muc_shop')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('san_pham', function (Blueprint $table) {
            $table->dropForeign(['danh_muc_shop_id']);
            $table->dropColumn('danh_muc_shop_id');
        });
    }
};
