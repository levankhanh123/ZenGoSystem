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
        if (!Schema::hasTable('cua_hang')) {
            return;
        }

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
        if (!Schema::hasTable('cua_hang')) {
            return;
        }

        Schema::table('cua_hang', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('cua_hang', 'email_shop') ? 'email_shop' : null,
                Schema::hasColumn('cua_hang', 'sdt_shop') ? 'sdt_shop' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
