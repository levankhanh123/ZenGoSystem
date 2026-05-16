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
        Schema::create('danh_muc_shop', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('cua_hang_id')->index();
            $table->string('ten_danh_muc_shop', 150);
            $table->string('slug', 180);
            $table->timestamps();

            // Foreign key to cua_hang table
            $table->foreign('cua_hang_id')->references('id')->on('cua_hang')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('danh_muc_shop');
    }
};
