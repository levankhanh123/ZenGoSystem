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
        Schema::create('nhat_ky_tai_chinh', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->string('loai', 50)->index('idx_nhat_ky_tai_chinh_loai');
            $table->string('doi_tuong');
            $table->longText('noi_dung');
            $table->decimal('so_tien', 15)->default(0);
            $table->dateTime('created_at')->nullable()->index('idx_nhat_ky_tai_chinh_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nhat_ky_tai_chinh');
    }
};
