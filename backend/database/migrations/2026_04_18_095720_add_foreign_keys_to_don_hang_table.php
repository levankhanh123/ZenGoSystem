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
        Schema::table('don_hang', function (Blueprint $table) {
            if (Schema::hasColumn('don_hang', 'cua_hang_id') && ! $this->constraintExists('don_hang', 'fk_don_hang_cua_hang')) {
                $table->foreign(['cua_hang_id'], 'fk_don_hang_cua_hang')->references(['id'])->on('cua_hang')->onUpdate('no action')->onDelete('no action');
            }
            if (Schema::hasColumn('don_hang', 'nguoi_mua_id') && ! $this->constraintExists('don_hang', 'fk_don_hang_nguoi_mua')) {
                $table->foreign(['nguoi_mua_id'], 'fk_don_hang_nguoi_mua')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
            }
            if (Schema::hasColumn('don_hang', 'nguoi_xac_nhan_id') && ! $this->constraintExists('don_hang', 'fk_don_hang_nguoi_xac_nhan')) {
                $table->foreign(['nguoi_xac_nhan_id'], 'fk_don_hang_nguoi_xac_nhan')->references(['id'])->on('nguoi_dung')->onUpdate('no action')->onDelete('no action');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('don_hang', function (Blueprint $table) {
            if ($this->constraintExists('don_hang', 'fk_don_hang_cua_hang')) {
                $table->dropForeign('fk_don_hang_cua_hang');
            }
            if ($this->constraintExists('don_hang', 'fk_don_hang_nguoi_mua')) {
                $table->dropForeign('fk_don_hang_nguoi_mua');
            }
            if ($this->constraintExists('don_hang', 'fk_don_hang_nguoi_xac_nhan')) {
                $table->dropForeign('fk_don_hang_nguoi_xac_nhan');
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
