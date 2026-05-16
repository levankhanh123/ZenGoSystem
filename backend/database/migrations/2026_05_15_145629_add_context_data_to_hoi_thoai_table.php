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
        Schema::table('hoi_thoai', function (Blueprint $table) {
            $table->json('context_data')->nullable()->after('chua_doc_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hoi_thoai', function (Blueprint $table) {
            $table->dropColumn('context_data');
        });
    }
};
