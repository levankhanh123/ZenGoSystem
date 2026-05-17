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
            if (!Schema::hasColumn('voucher', 'doi_tuong_ap_dung')) {
                $table->enum('doi_tuong_ap_dung', ['toan_san', 'shop_dang_ky'])->default('toan_san')->after('loai');
            }
            if (!Schema::hasColumn('voucher', 'danh_muc_id')) {
                $table->bigInteger('danh_muc_id')->nullable()->after('doi_tuong_ap_dung');
            }
            if (!Schema::hasColumn('voucher', 'banner_url')) {
                $table->string('banner_url')->nullable()->after('ten_voucher');
            }
            if (!Schema::hasColumn('voucher', 'mo_ta_rich')) {
                $table->longText('mo_ta_rich')->nullable()->after('mo_ta');
            }
            
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

            $columns = array_filter([
                Schema::hasColumn('voucher', 'doi_tuong_ap_dung') ? 'doi_tuong_ap_dung' : null,
                Schema::hasColumn('voucher', 'danh_muc_id') ? 'danh_muc_id' : null,
                Schema::hasColumn('voucher', 'banner_url') ? 'banner_url' : null,
                Schema::hasColumn('voucher', 'mo_ta_rich') ? 'mo_ta_rich' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
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
