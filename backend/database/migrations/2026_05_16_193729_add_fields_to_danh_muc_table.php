<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('danh_muc', function (Blueprint $row) {
            $row->string('hinh_anh')->nullable()->after('slug');
            $row->integer('thu_tu')->default(0)->after('hinh_anh');
            $row->boolean('trang_thai')->default(true)->after('thu_tu');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('danh_muc', function (Blueprint $row) {
            $row->dropColumn(['hinh_anh', 'thu_tu', 'trang_thai']);
        });
    }
};
