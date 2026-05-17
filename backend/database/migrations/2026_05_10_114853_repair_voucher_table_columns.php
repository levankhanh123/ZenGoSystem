<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voucher', function (Blueprint $table) {
            $table->bigInteger('danh_muc_id')->nullable()->change();
            
            if (!$this->constraintExists('voucher', 'voucher_danh_muc_id_foreign')) {
                $table->foreign('danh_muc_id')->references('id')->on('danh_muc')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher', function (Blueprint $table) {
            if ($this->constraintExists('voucher', 'voucher_danh_muc_id_foreign')) {
                $table->dropForeign(['danh_muc_id']);
            }
        });
    }

    private function constraintExists(string $table, string $constraint): bool
    {
        return DB::table('information_schema.table_constraints')
            ->where('constraint_schema', DB::getDatabaseName())
            ->where('table_name', $table)
            ->where('constraint_name', $constraint)
            ->exists();
    }
};
