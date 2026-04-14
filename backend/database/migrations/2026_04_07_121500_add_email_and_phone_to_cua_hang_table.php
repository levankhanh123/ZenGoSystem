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
        Schema::table('cua_hang', function (Blueprint $table) {
            if (!Schema::hasColumn('cua_hang', 'email_shop')) {
                $table->string('email_shop', 150)->nullable()->after('ten_cua_hang');
            }
            if (!Schema::hasColumn('cua_hang', 'sdt_shop')) {
                $table->string('sdt_shop', 20)->nullable()->after('email_shop');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cua_hang', function (Blueprint $table) {
            $table->dropColumn(['email_shop', 'sdt_shop']);
        });
    }
};
