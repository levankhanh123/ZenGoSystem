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
        Schema::create('vi_tien', function (Blueprint $table) {
            $table->bigInteger('id', true);
            $table->bigInteger('nguoi_dung_id')->unique('nguoi_dung_id');
            $table->decimal('so_du', 15)->default(0);
            $table->decimal('so_du_dong_bang', 15)->default(0);
            $table->dateTime('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vi_tien');
    }
};
