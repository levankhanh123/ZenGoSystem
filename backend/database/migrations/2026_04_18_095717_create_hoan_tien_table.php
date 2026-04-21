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
        Schema::create('hoan_tien', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('don_hang_id')->index('idx_hoan_tien_don_hang_id');
            $table->bigInteger('thanh_toan_id')->nullable()->index('idx_hoan_tien_thanh_toan_id');
            $table->decimal('so_tien', 15);
            $table->string('ly_do', 100)->nullable();
            $table->string('trang_thai', 20)->default('cho_xu_ly');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->longText('ghi_chu')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoan_tien');
    }
};
