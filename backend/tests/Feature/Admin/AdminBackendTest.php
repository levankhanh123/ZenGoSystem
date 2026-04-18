<?php

namespace Tests\Feature;

use App\Models\CuaHang;
use App\Models\DangKyChienDich;
use App\Models\DonHang;
use App\Models\HoSoGiaoHang;
use App\Models\HoiThoai;
use App\Models\NguoiDung;
use App\Models\Voucher;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminBackendTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropAllTables();

        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->id();
            $table->string('ho_ten');
            $table->string('email');
            $table->string('so_dien_thoai')->nullable();
            $table->string('mat_khau');
            $table->string('vai_tro');
            $table->string('trang_thai')->default('hoat_dong');
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('cua_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguoi_ban_id');
            $table->string('ten_cua_hang');
            $table->string('trang_thai')->default('cho_duyet');
            $table->timestamps();
        });

        Schema::create('don_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ma_don_hang');
            $table->unsignedBigInteger('nguoi_mua_id');
            $table->unsignedBigInteger('cua_hang_id');
            $table->string('ten_nguoi_nhan');
            $table->string('so_dien_thoai_nguoi_nhan');
            $table->longText('dia_chi_nhan');
            $table->decimal('tam_tinh', 15, 2)->default(0);
            $table->decimal('phi_giao_hang', 15, 2)->default(0);
            $table->decimal('giam_gia', 15, 2)->default(0);
            $table->decimal('tong_tien', 15, 2)->default(0);
            $table->string('trang_thai_thanh_toan')->default('chua_thanh_toan');
            $table->string('trang_thai_don_hang')->default('cho_xac_nhan');
            $table->longText('ly_do_huy')->nullable();
            $table->boolean('bat_thuong')->default(false);
            $table->longText('ly_do_bat_thuong')->nullable();
            $table->string('loai_xu_ly')->nullable();
            $table->string('trang_thai_xac_nhan')->default('cho_he_thong_xac_nhan');
            $table->unsignedBigInteger('nguoi_xac_nhan_id')->nullable();
            $table->dateTime('thoi_gian_xac_nhan')->nullable();
            $table->timestamps();
        });

        Schema::create('thong_bao', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->string('tieu_de');
            $table->longText('noi_dung');
            $table->string('loai_thong_bao')->nullable();
            $table->boolean('da_doc')->default(false);
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('doi_soat_shop', function (Blueprint $table) {
            $table->id();
            $table->string('ma_doi_soat');
            $table->string('ky_doi_soat')->nullable();
            $table->unsignedBigInteger('shop_id');
            $table->decimal('doanh_thu_gop', 15, 2)->default(0);
            $table->decimal('phi_san', 15, 2)->default(0);
            $table->decimal('phi_van_chuyen', 15, 2)->default(0);
            $table->decimal('voucher_ho_tro', 15, 2)->default(0);
            $table->decimal('hoan_tien', 15, 2)->default(0);
            $table->decimal('thuc_nhan', 15, 2)->default(0);
            $table->string('trang_thai')->default('cho_chuyen_khoan');
            $table->date('ngay_doi_soat')->nullable();
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('doi_soat_shipper', function (Blueprint $table) {
            $table->id();
            $table->string('ma_doi_soat_shipper');
            $table->unsignedBigInteger('shipper_id');
            $table->decimal('cod_da_thu', 15, 2)->default(0);
            $table->decimal('cod_da_nop', 15, 2)->default(0);
            $table->decimal('cod_con_thieu', 15, 2)->default(0);
            $table->decimal('phi_giao_hang_duoc_huong', 15, 2)->default(0);
            $table->decimal('ky_quy_hien_tai', 15, 2)->default(0);
            $table->decimal('cong_no', 15, 2)->default(0);
            $table->string('trang_thai_cong_no')->default('binh_thuong');
            $table->date('ngay_cap_nhat')->nullable();
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_id');
            $table->string('ma_giao_dich')->nullable();
            $table->string('cong_thanh_toan')->default('cod');
            $table->decimal('so_tien', 15, 2)->default(0);
            $table->string('trang_thai')->default('cho_xu_ly');
            $table->dateTime('thoi_gian_thanh_toan')->nullable();
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('hoan_tien', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('thanh_toan_id')->nullable();
            $table->decimal('so_tien', 15, 2)->default(0);
            $table->string('ly_do')->nullable();
            $table->string('trang_thai')->default('cho_xu_ly');
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('nhat_ky_tai_chinh', function (Blueprint $table) {
            $table->id();
            $table->string('loai');
            $table->string('doi_tuong');
            $table->longText('noi_dung');
            $table->decimal('so_tien', 15, 2)->default(0);
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('lich_su_trang_thai_don_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('nguoi_cap_nhat_id')->nullable();
            $table->string('trang_thai_cu')->nullable();
            $table->string('trang_thai_moi');
            $table->longText('ghi_chu')->nullable();
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('giao_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('nguoi_giao_hang_id')->nullable();
            $table->string('trang_thai')->default('cho_nhan');
            $table->timestamps();
        });

        Schema::create('khieu_nai', function (Blueprint $table) {
            $table->id();
            $table->string('ma_khieu_nai');
            $table->string('nguon_tao')->nullable();
            $table->unsignedBigInteger('don_hang_id');
            $table->unsignedBigInteger('nguoi_khieu_nai_id');
            $table->string('ly_do');
            $table->longText('noi_dung');
            $table->string('trang_thai')->default('dang_xu_ly');
            $table->string('uu_tien')->nullable();
            $table->longText('phan_quyet_admin')->nullable();
            $table->longText('ly_do_tu_choi')->nullable();
            $table->unsignedBigInteger('assigned_admin_id')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('hoi_thoai', function (Blueprint $table) {
            $table->id();
            $table->string('ma_hoi_thoai');
            $table->string('loai_hoi_thoai')->default('ho_tro');
            $table->unsignedBigInteger('don_hang_id')->nullable();
            $table->unsignedBigInteger('khieu_nai_id')->nullable();
            $table->string('trang_thai')->default('moi');
            $table->boolean('chua_doc_admin')->default(true);
            $table->longText('tin_nhan_cuoi')->nullable();
            $table->dateTime('thoi_gian_cuoi')->nullable();
            $table->timestamps();
        });

        Schema::create('hoi_thoai_thanh_vien', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hoi_thoai_id');
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->string('vai_tro_tham_gia');
            $table->boolean('da_doc')->default(false);
            $table->dateTime('last_read_at')->nullable();
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('tin_nhan_hoi_thoai', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hoi_thoai_id');
            $table->unsignedBigInteger('nguoi_gui_id');
            $table->unsignedBigInteger('nguoi_nhan_id')->nullable();
            $table->longText('noi_dung');
            $table->string('loai_tin_nhan')->default('van_ban');
            $table->boolean('da_xem')->default(false);
            $table->dateTime('created_at')->nullable();
        });

        Schema::create('ho_so_giao_hang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->string('ma_shipper');
            $table->string('trang_thai_noi_bo')->default('binh_thuong');
            $table->string('khu_vuc')->nullable();
            $table->dateTime('lan_can_thiep_gan_nhat')->nullable();
            $table->longText('ly_do_can_thiep_gan_nhat')->nullable();
            $table->integer('tong_don_giao')->default(0);
            $table->integer('don_dang_giao')->default(0);
            $table->integer('don_that_bai')->default(0);
            $table->integer('don_hom_nay')->default(0);
            $table->integer('don_tuan_nay')->default(0);
            $table->integer('don_thang_nay')->default(0);
            $table->integer('don_that_bai_thang_nay')->default(0);
            $table->decimal('ty_le_dung_han', 5, 2)->default(0);
            $table->decimal('danh_gia_trung_binh', 5, 2)->default(0);
            $table->decimal('ty_le_that_bai', 5, 2)->default(0);
            $table->decimal('ky_quy_hien_tai', 15, 2)->default(0);
            $table->decimal('cong_no_hien_tai', 15, 2)->default(0);
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('voucher', function (Blueprint $table) {
            $table->id();
            $table->string('ma_voucher');
            $table->string('ten_voucher');
            $table->string('loai');
            $table->longText('mo_ta')->nullable();
            $table->dateTime('thoi_gian_bat_dau');
            $table->dateTime('thoi_gian_ket_thuc');
            $table->string('trang_thai')->default('dang_mo_dang_ky');
            $table->decimal('gia_tri_voucher', 15, 2)->default(0);
            $table->decimal('gia_tri_don_toi_thieu', 15, 2)->default(0);
            $table->decimal('giam_toi_da', 15, 2)->default(0);
            $table->integer('so_luong_voucher')->default(0);
            $table->integer('so_luong_da_dung')->default(0);
            $table->integer('so_luong_con_lai')->default(0);
            $table->integer('so_luong_moi_nguoi')->default(1);
            $table->decimal('muc_ho_tro_san', 15, 2)->default(0);
            $table->longText('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('dang_ky_chien_dich', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campaign_id');
            $table->unsignedBigInteger('shop_id');
            $table->dateTime('ngay_dang_ky')->nullable();
            $table->string('trang_thai')->default('cho_duyet');
            $table->longText('ly_do_tu_choi')->nullable();
            $table->longText('ghi_chu_admin')->nullable();
            $table->timestamps();
        });
    }

    public function test_broadcast_notifications_to_all_matching_roles(): void
    {
        $customerOne = NguoiDung::create([
            'ho_ten' => 'Khach 1',
            'email' => 'customer1@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $customerTwo = NguoiDung::create([
            'ho_ten' => 'Khach 2',
            'email' => 'customer2@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'customer',
        ]);

        NguoiDung::create([
            'ho_ten' => 'Shop 1',
            'email' => 'shop@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $response = $this->postJson('/api/admin/notifications/broadcast', [
            'vai_tro' => 'customer',
            'tieu_de' => 'Flash Sale',
            'noi_dung' => 'Co uu dai moi',
            'loai_thong_bao' => 'promotion',
        ]);

        $response->assertOk()->assertJsonPath('sent_count', 2);
        $this->assertDatabaseHas('thong_bao', ['nguoi_dung_id' => $customerOne->id, 'tieu_de' => 'Flash Sale']);
        $this->assertDatabaseHas('thong_bao', ['nguoi_dung_id' => $customerTwo->id, 'tieu_de' => 'Flash Sale']);
    }

    public function test_order_status_update_creates_history_and_notifications(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Nguoi mua',
            'email' => 'buyer@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Nguoi ban',
            'email' => 'seller@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $admin = NguoiDung::create([
            'ho_ten' => 'Admin',
            'email' => 'admin@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'quan_tri',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop test',
            'trang_thai' => 'hoat_dong',
        ]);

        $order = DonHang::create([
            'ma_don_hang' => 'DH001',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach hang',
            'so_dien_thoai_nguoi_nhan' => '0900000000',
            'dia_chi_nhan' => 'Dia chi test',
            'trang_thai_don_hang' => 'cho_xac_nhan',
            'trang_thai_thanh_toan' => 'chua_thanh_toan',
        ]);

        $response = $this->putJson('/api/admin/orders/' . $order->id . '/status', [
            'trang_thai_don_hang' => 'dang_giao',
            'ghi_chu_lich_su' => 'Admin duyet don',
            'nguoi_cap_nhat_id' => $admin->id,
        ]);

        $response->assertOk()->assertJsonPath('data.trang_thai_don_hang', 'dang_giao');
        $this->assertDatabaseHas('lich_su_trang_thai_don_hang', [
            'don_hang_id' => $order->id,
            'trang_thai_cu' => 'cho_xac_nhan',
            'trang_thai_moi' => 'dang_giao',
        ]);
        $this->assertDatabaseHas('thong_bao', ['nguoi_dung_id' => $buyer->id, 'loai_thong_bao' => 'order']);
        $this->assertDatabaseHas('thong_bao', ['nguoi_dung_id' => $shopOwner->id, 'loai_thong_bao' => 'order']);
    }

    public function test_dashboard_returns_ops_signal_metrics(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Buyer Dashboard',
            'email' => 'buyer-dashboard@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Seller Dashboard',
            'email' => 'seller-dashboard@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $admin = NguoiDung::create([
            'ho_ten' => 'Admin Dashboard',
            'email' => 'admin-dashboard@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'quan_tri',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop Dashboard',
            'trang_thai' => 'cho_duyet',
        ]);

        $order = DonHang::create([
            'ma_don_hang' => 'DH-DASH-01',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach Dashboard',
            'so_dien_thoai_nguoi_nhan' => '0904000001',
            'dia_chi_nhan' => 'Dia chi dashboard',
            'trang_thai_thanh_toan' => 'da_thanh_toan',
            'trang_thai_don_hang' => 'dang_giao',
            'bat_thuong' => true,
            'trang_thai_xac_nhan' => 'can_admin_xac_nhan',
        ]);

        $complaint = \App\Models\KhieuNai::create([
            'ma_khieu_nai' => 'KN-DASH-01',
            'don_hang_id' => $order->id,
            'nguoi_khieu_nai_id' => $buyer->id,
            'ly_do' => 'Cham xu ly',
            'noi_dung' => 'Case da qua SLA',
            'trang_thai' => 'dang_xu_ly',
            'uu_tien' => 'cao',
        ]);

        DB::table('khieu_nai')->where('id', $complaint->id)->update([
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        HoiThoai::create([
            'ma_hoi_thoai' => 'HT-DASH-01',
            'loai_hoi_thoai' => 'ho_tro',
            'trang_thai' => 'moi',
            'chua_doc_admin' => 1,
            'tin_nhan_cuoi' => 'Buyer dang doi phan hoi',
            'thoi_gian_cuoi' => now()->subHours(8),
            'created_at' => now()->subHours(8),
            'updated_at' => now()->subHours(8),
        ]);

        \App\Models\ThongBao::create([
            'nguoi_dung_id' => $admin->id,
            'tieu_de' => 'Alert dashboard',
            'noi_dung' => 'Can review ngay',
            'loai_thong_bao' => 'alert',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $campaign = Voucher::create([
            'ma_voucher' => 'VC-DASH-01',
            'ten_voucher' => 'Campaign Dashboard',
            'loai' => 'voucher_san',
            'thoi_gian_bat_dau' => now(),
            'thoi_gian_ket_thuc' => now()->addDays(7),
            'trang_thai' => 'dang_mo_dang_ky',
            'gia_tri_voucher' => 50000,
            'gia_tri_don_toi_thieu' => 200000,
            'giam_toi_da' => 50000,
            'so_luong_voucher' => 100,
            'so_luong_da_dung' => 0,
            'so_luong_con_lai' => 100,
            'so_luong_moi_nguoi' => 1,
            'muc_ho_tro_san' => 10000,
        ]);

        DangKyChienDich::create([
            'campaign_id' => $campaign->id,
            'shop_id' => $shop->id,
            'ngay_dang_ky' => now(),
            'trang_thai' => 'cho_duyet',
        ]);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.ops_signals.orders_need_attention', 1)
            ->assertJsonPath('data.ops_signals.high_priority_complaints', 1)
            ->assertJsonPath('data.ops_signals.unassigned_complaints', 1)
            ->assertJsonPath('data.ops_signals.breached_complaints', 1)
            ->assertJsonPath('data.ops_signals.stale_unread_conversations', 1)
            ->assertJsonPath('data.ops_signals.pending_shops', 1)
                ->assertJsonPath('data.ops_signals.unread_notifications', 1)
                ->assertJsonPath('data.ops_signals.pending_campaign_registrations', 1)
                ->assertJsonPath('data.campaigns.pending_registrations', 1);
    }

    public function test_complaint_index_filters_by_keyword_and_assignee(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Buyer Complaint',
            'email' => 'buyer-complaint@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Shop Complaint',
            'email' => 'shop-complaint@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $admin = NguoiDung::create([
            'ho_ten' => 'Admin Queue',
            'email' => 'admin-queue@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'quan_tri',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop Queue',
            'trang_thai' => 'hoat_dong',
        ]);

        $firstOrder = DonHang::create([
            'ma_don_hang' => 'DH-KN-01',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach Queue 1',
            'so_dien_thoai_nguoi_nhan' => '0903000001',
            'dia_chi_nhan' => 'Dia chi 1',
            'trang_thai_thanh_toan' => 'da_thanh_toan',
            'trang_thai_don_hang' => 'dang_giao',
        ]);

        $secondOrder = DonHang::create([
            'ma_don_hang' => 'DH-KN-02',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach Queue 2',
            'so_dien_thoai_nguoi_nhan' => '0903000002',
            'dia_chi_nhan' => 'Dia chi 2',
            'trang_thai_thanh_toan' => 'da_thanh_toan',
            'trang_thai_don_hang' => 'dang_giao',
        ]);

        $targetComplaint = \App\Models\KhieuNai::create([
            'ma_khieu_nai' => 'KN-FAST-001',
            'don_hang_id' => $firstOrder->id,
            'nguoi_khieu_nai_id' => $buyer->id,
            'ly_do' => 'Cham giao hang',
            'noi_dung' => 'Buyer can tra soat don hang gap',
            'trang_thai' => 'dang_xu_ly',
            'uu_tien' => 'cao',
            'assigned_admin_id' => $admin->id,
        ]);

        \App\Models\KhieuNai::create([
            'ma_khieu_nai' => 'KN-SLOW-002',
            'don_hang_id' => $secondOrder->id,
            'nguoi_khieu_nai_id' => $buyer->id,
            'ly_do' => 'Hoi thong tin',
            'noi_dung' => 'Case khac khong lien quan',
            'trang_thai' => 'moi',
            'uu_tien' => 'thap',
        ]);

        $response = $this->getJson('/api/admin/complaints?keyword=FAST&assigned_admin_id=' . $admin->id);

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetComplaint->id)
            ->assertJsonPath('data.0.ma_khieu_nai', 'KN-FAST-001');
    }

    public function test_conversation_index_filters_by_keyword(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Buyer Chat',
            'email' => 'buyer-chat@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $admin = NguoiDung::create([
            'ho_ten' => 'Admin Chat',
            'email' => 'admin-chat@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'quan_tri',
        ]);

        $matchedConversation = HoiThoai::create([
            'ma_hoi_thoai' => 'HT-HOT-001',
            'loai_hoi_thoai' => 'ho_tro',
            'trang_thai' => 'moi',
            'tin_nhan_cuoi' => 'Buyer dang cho phan hoi gap',
            'thoi_gian_cuoi' => now(),
        ]);

        $otherConversation = HoiThoai::create([
            'ma_hoi_thoai' => 'HT-OTHER-002',
            'loai_hoi_thoai' => 'ho_tro',
            'trang_thai' => 'da_phan_hoi',
            'tin_nhan_cuoi' => 'Case da xong',
            'thoi_gian_cuoi' => now(),
        ]);

        foreach ([$matchedConversation, $otherConversation] as $conversation) {
            \App\Models\HoiThoaiThanhVien::create([
                'hoi_thoai_id' => $conversation->id,
                'nguoi_dung_id' => $buyer->id,
                'vai_tro_tham_gia' => 'customer',
                'da_doc' => 0,
                'created_at' => now(),
            ]);

            \App\Models\HoiThoaiThanhVien::create([
                'hoi_thoai_id' => $conversation->id,
                'nguoi_dung_id' => $admin->id,
                'vai_tro_tham_gia' => 'admin',
                'da_doc' => 0,
                'created_at' => now(),
            ]);
        }

        $response = $this->getJson('/api/admin/conversations?keyword=HOT-001');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchedConversation->id)
            ->assertJsonPath('data.0.ma_hoi_thoai', 'HT-HOT-001');
    }

    public function test_send_conversation_message_notifies_other_members(): void
    {
        $sender = NguoiDung::create([
            'ho_ten' => 'Admin ho tro',
            'email' => 'support@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'quan_tri',
        ]);

        $receiver = NguoiDung::create([
            'ho_ten' => 'Nguoi mua',
            'email' => 'customer@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $conversation = HoiThoai::create([
            'ma_hoi_thoai' => 'HT001',
            'loai_hoi_thoai' => 'ho_tro',
            'trang_thai' => 'moi',
        ]);

        \App\Models\HoiThoaiThanhVien::create([
            'hoi_thoai_id' => $conversation->id,
            'nguoi_dung_id' => $sender->id,
            'vai_tro_tham_gia' => 'admin',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        \App\Models\HoiThoaiThanhVien::create([
            'hoi_thoai_id' => $conversation->id,
            'nguoi_dung_id' => $receiver->id,
            'vai_tro_tham_gia' => 'customer',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/admin/conversations/' . $conversation->id . '/messages', [
            'nguoi_gui_id' => $sender->id,
            'noi_dung' => 'Don hang dang duoc xu ly',
        ]);

        $response->assertCreated()->assertJsonPath('data.noi_dung', 'Don hang dang duoc xu ly');
        $this->assertDatabaseHas('tin_nhan_hoi_thoai', ['hoi_thoai_id' => $conversation->id, 'nguoi_gui_id' => $sender->id]);
        $this->assertDatabaseHas('thong_bao', ['nguoi_dung_id' => $receiver->id, 'loai_thong_bao' => 'chat_admin']);
    }

    public function test_bulk_delete_notifications_removes_selected_records(): void
    {
        $user = NguoiDung::create([
            'ho_ten' => 'Khach hang',
            'email' => 'bulk@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $first = \App\Models\ThongBao::create([
            'nguoi_dung_id' => $user->id,
            'tieu_de' => 'TB1',
            'noi_dung' => 'Noi dung 1',
            'loai_thong_bao' => 'general',
            'created_at' => now(),
        ]);

        $second = \App\Models\ThongBao::create([
            'nguoi_dung_id' => $user->id,
            'tieu_de' => 'TB2',
            'noi_dung' => 'Noi dung 2',
            'loai_thong_bao' => 'general',
            'created_at' => now(),
        ]);

        $response = $this->deleteJson('/api/admin/notifications', [
            'ids' => [$first->id, $second->id],
        ]);

        $response->assertOk()->assertJsonPath('deleted_count', 2);
        $this->assertDatabaseMissing('thong_bao', ['id' => $first->id]);
        $this->assertDatabaseMissing('thong_bao', ['id' => $second->id]);
    }

    public function test_mark_all_notifications_as_read_for_role_scope(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Buyer Notify',
            'email' => 'buyer-notify@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Shop Notify',
            'email' => 'shop-notify@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $firstBuyerNotification = DB::table('thong_bao')->insertGetId([
            'nguoi_dung_id' => $buyer->id,
            'tieu_de' => 'Buyer 1',
            'noi_dung' => 'Buyer unread 1',
            'loai_thong_bao' => 'general',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $secondBuyerNotification = DB::table('thong_bao')->insertGetId([
            'nguoi_dung_id' => $buyer->id,
            'tieu_de' => 'Buyer 2',
            'noi_dung' => 'Buyer unread 2',
            'loai_thong_bao' => 'alert',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $shopNotification = DB::table('thong_bao')->insertGetId([
            'nguoi_dung_id' => $shopOwner->id,
            'tieu_de' => 'Shop 1',
            'noi_dung' => 'Shop unread 1',
            'loai_thong_bao' => 'general',
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $response = $this->putJson('/api/admin/notifications/read-all', [
            'vai_tro' => 'customer',
        ]);

        $response->assertOk()->assertJsonPath('updated_count', 2);

        $this->assertDatabaseHas('thong_bao', [
            'id' => $firstBuyerNotification,
            'da_doc' => 1,
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'id' => $secondBuyerNotification,
            'da_doc' => 1,
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'id' => $shopNotification,
            'da_doc' => 0,
        ]);
    }

    public function test_bulk_update_user_status_updates_multiple_buyers_and_creates_notifications(): void
    {
        $firstBuyer = NguoiDung::create([
            'ho_ten' => 'Buyer Bulk One',
            'email' => 'buyer-bulk-one@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
            'trang_thai' => 'hoat_dong',
        ]);

        $secondBuyer = NguoiDung::create([
            'ho_ten' => 'Buyer Bulk Two',
            'email' => 'buyer-bulk-two@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
            'trang_thai' => 'hoat_dong',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Owner Unchanged',
            'email' => 'owner-unchanged@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
            'trang_thai' => 'hoat_dong',
        ]);

        $response = $this->putJson('/api/admin/users/status/bulk', [
            'ids' => [$firstBuyer->id, $secondBuyer->id],
            'trang_thai' => 'khoa',
            'ghi_chu' => 'Bulk khoa buyer do canh bao he thong',
        ]);

        $response->assertOk()->assertJsonPath('updated_count', 2);

        $this->assertDatabaseHas('nguoi_dung', [
            'id' => $firstBuyer->id,
            'trang_thai' => 'khoa',
            'ghi_chu' => 'Bulk khoa buyer do canh bao he thong',
        ]);

        $this->assertDatabaseHas('nguoi_dung', [
            'id' => $secondBuyer->id,
            'trang_thai' => 'khoa',
            'ghi_chu' => 'Bulk khoa buyer do canh bao he thong',
        ]);

        $this->assertDatabaseHas('nguoi_dung', [
            'id' => $shopOwner->id,
            'trang_thai' => 'hoat_dong',
        ]);

        $this->assertSame(2, DB::table('thong_bao')->where('loai_thong_bao', 'account')->count());
        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $firstBuyer->id,
            'loai_thong_bao' => 'account',
        ]);
        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $secondBuyer->id,
            'loai_thong_bao' => 'account',
        ]);
    }

    public function test_update_payment_creates_finance_log_and_notifies_buyer(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Nguoi mua finance',
            'email' => 'buyer-finance@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Chu shop finance',
            'email' => 'shop-finance@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop finance',
            'trang_thai' => 'hoat_dong',
        ]);

        $order = DonHang::create([
            'ma_don_hang' => 'DH-FIN-01',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach finance',
            'so_dien_thoai_nguoi_nhan' => '0901000000',
            'dia_chi_nhan' => 'Dia chi finance',
            'tong_tien' => 500000,
            'trang_thai_thanh_toan' => 'chua_thanh_toan',
            'trang_thai_don_hang' => 'cho_xac_nhan',
        ]);

        $payment = \App\Models\ThanhToan::create([
            'don_hang_id' => $order->id,
            'ma_giao_dich' => 'GD-FIN-01',
            'cong_thanh_toan' => 'chuyen_khoan',
            'so_tien' => 500000,
            'trang_thai' => 'cho_xu_ly',
        ]);

        $response = $this->putJson('/api/admin/finance/payments/' . $payment->id, [
            'trang_thai' => 'thanh_cong',
            'ghi_chu' => 'Admin da doi soat',
        ]);

        $response->assertOk()->assertJsonPath('data.trang_thai', 'thanh_cong');
        $this->assertDatabaseHas('nhat_ky_tai_chinh', [
            'loai' => 'giao_dich_nguoi_mua',
            'doi_tuong' => 'GD-FIN-01',
        ]);
        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $buyer->id,
            'loai_thong_bao' => 'payment',
        ]);
    }

    public function test_update_shop_settlement_creates_finance_log_and_notifies_shop_owner(): void
    {
        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Owner Settlement',
            'email' => 'owner-settlement@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop Settlement',
            'trang_thai' => 'hoat_dong',
        ]);

        $settlement = \App\Models\DoiSoatShop::create([
            'ma_doi_soat' => 'DSS-001',
            'ky_doi_soat' => '2024-W18',
            'shop_id' => $shop->id,
            'doanh_thu_gop' => 900000,
            'phi_san' => 45000,
            'phi_van_chuyen' => 30000,
            'voucher_ho_tro' => 20000,
            'hoan_tien' => 0,
            'thuc_nhan' => 805000,
            'trang_thai' => 'cho_chuyen_khoan',
        ]);

        $response = $this->putJson('/api/admin/finance/shop-settlements/' . $settlement->id, [
            'trang_thai' => 'da_chuyen_khoan',
            'ghi_chu' => 'Đã chốt payout cho shop',
            'ngay_doi_soat' => now()->toDateString(),
        ]);

        $response->assertOk()->assertJsonPath('data.trang_thai', 'da_chuyen_khoan');

        $this->assertDatabaseHas('doi_soat_shop', [
            'id' => $settlement->id,
            'trang_thai' => 'da_chuyen_khoan',
            'ghi_chu' => 'Đã chốt payout cho shop',
        ]);

        $this->assertDatabaseHas('nhat_ky_tai_chinh', [
            'loai' => 'doi_soat_shop',
            'doi_tuong' => 'DSS-001',
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $shopOwner->id,
            'loai_thong_bao' => 'settlement_shop',
        ]);
    }

    public function test_update_shipper_settlement_creates_finance_log_and_notifies_shipper(): void
    {
        $shipper = NguoiDung::create([
            'ho_ten' => 'Shipper Settlement',
            'email' => 'shipper-settlement@example.com',
            'so_dien_thoai' => '0903111222',
            'mat_khau' => 'secret',
            'vai_tro' => 'giao_hang',
        ]);

        HoSoGiaoHang::create([
            'nguoi_dung_id' => $shipper->id,
            'ma_shipper' => 'GH-SETTLE',
            'trang_thai_noi_bo' => 'binh_thuong',
        ]);

        $settlement = \App\Models\DoiSoatShipper::create([
            'ma_doi_soat_shipper' => 'DSSP-001',
            'shipper_id' => $shipper->id,
            'cod_da_thu' => 1200000,
            'cod_da_nop' => 900000,
            'cod_con_thieu' => 300000,
            'phi_giao_hang_duoc_huong' => 150000,
            'ky_quy_hien_tai' => 500000,
            'cong_no' => 300000,
            'trang_thai_cong_no' => 'canh_bao',
        ]);

        $response = $this->putJson('/api/admin/finance/shipper-settlements/' . $settlement->id, [
            'trang_thai_cong_no' => 'rui_ro',
            'ghi_chu' => 'COD nộp thiếu quá hạn',
            'ngay_cap_nhat' => now()->toDateString(),
            'cod_da_nop' => 950000,
            'cod_con_thieu' => 250000,
            'cong_no' => 250000,
        ]);

        $response->assertOk()->assertJsonPath('data.trang_thai_cong_no', 'rui_ro');

        $this->assertDatabaseHas('doi_soat_shipper', [
            'id' => $settlement->id,
            'trang_thai_cong_no' => 'rui_ro',
            'ghi_chu' => 'COD nộp thiếu quá hạn',
        ]);

        $this->assertDatabaseHas('nhat_ky_tai_chinh', [
            'loai' => 'doi_soat_shipper',
            'doi_tuong' => 'DSSP-001',
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $shipper->id,
            'loai_thong_bao' => 'settlement_shipper',
        ]);
    }

    public function test_update_refund_creates_finance_log_and_notifies_buyer(): void
    {
        $buyer = NguoiDung::create([
            'ho_ten' => 'Nguoi mua refund',
            'email' => 'buyer-refund@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_mua',
        ]);

        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Chu shop refund',
            'email' => 'shop-refund@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop refund',
            'trang_thai' => 'hoat_dong',
        ]);

        $order = DonHang::create([
            'ma_don_hang' => 'DH-REF-01',
            'nguoi_mua_id' => $buyer->id,
            'cua_hang_id' => $shop->id,
            'ten_nguoi_nhan' => 'Khach refund',
            'so_dien_thoai_nguoi_nhan' => '0902000000',
            'dia_chi_nhan' => 'Dia chi refund',
            'tong_tien' => 450000,
            'trang_thai_thanh_toan' => 'da_thanh_toan',
            'trang_thai_don_hang' => 'da_huy',
        ]);

        $payment = \App\Models\ThanhToan::create([
            'don_hang_id' => $order->id,
            'ma_giao_dich' => 'GD-REF-01',
            'cong_thanh_toan' => 'chuyen_khoan',
            'so_tien' => 450000,
            'trang_thai' => 'thanh_cong',
        ]);

        $refund = \App\Models\HoanTien::create([
            'don_hang_id' => $order->id,
            'thanh_toan_id' => $payment->id,
            'so_tien' => 450000,
            'ly_do' => 'Khach huy don',
            'trang_thai' => 'cho_xu_ly',
        ]);

        $response = $this->putJson('/api/admin/finance/refunds/' . $refund->id, [
            'trang_thai' => 'hoan_tat',
            'ghi_chu' => 'Da hoan tien cho khach',
        ]);

        $response->assertOk()->assertJsonPath('data.trang_thai', 'hoan_tat');
        $this->assertDatabaseHas('nhat_ky_tai_chinh', [
            'loai' => 'hoan_tien',
            'doi_tuong' => 'refund:' . $refund->id,
        ]);
        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $buyer->id,
            'loai_thong_bao' => 'refund',
        ]);
    }

    public function test_intervene_shipper_updates_profile_and_notifies_shipper(): void
    {
        $shipper = NguoiDung::create([
            'ho_ten' => 'Shipper Test',
            'email' => 'shipper@example.com',
            'so_dien_thoai' => '0912345678',
            'mat_khau' => 'secret',
            'vai_tro' => 'giao_hang',
            'trang_thai' => 'hoat_dong',
        ]);

        HoSoGiaoHang::create([
            'nguoi_dung_id' => $shipper->id,
            'ma_shipper' => 'GH999',
            'trang_thai_noi_bo' => 'binh_thuong',
            'khu_vuc' => 'TP.HCM',
            'tong_don_giao' => 120,
            'don_dang_giao' => 3,
            'ky_quy_hien_tai' => 2500000,
            'cong_no_hien_tai' => 0,
        ]);

        $response = $this->putJson('/api/admin/shippers/' . $shipper->id . '/intervene', [
            'trang_thai' => 'khoa',
            'trang_thai_noi_bo' => 'rui_ro',
            'ly_do_can_thiep_gan_nhat' => 'Tỷ lệ giao thất bại tăng đột biến',
            'ghi_chu' => 'Tạm khóa để rà soát vận hành',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.trang_thai', 'khoa')
            ->assertJsonPath('data.shipper_profile.trang_thai_noi_bo', 'rui_ro');

        $this->assertDatabaseHas('nguoi_dung', [
            'id' => $shipper->id,
            'trang_thai' => 'khoa',
        ]);

        $this->assertDatabaseHas('ho_so_giao_hang', [
            'nguoi_dung_id' => $shipper->id,
            'trang_thai_noi_bo' => 'rui_ro',
            'ly_do_can_thiep_gan_nhat' => 'Tỷ lệ giao thất bại tăng đột biến',
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $shipper->id,
            'loai_thong_bao' => 'shipper_ops',
        ]);
    }

    public function test_create_campaign_and_update_registration_notifies_shop_owner(): void
    {
        $shopOwner = NguoiDung::create([
            'ho_ten' => 'Campaign Shop Owner',
            'email' => 'campaign-owner@example.com',
            'mat_khau' => 'secret',
            'vai_tro' => 'nguoi_ban',
        ]);

        $shop = CuaHang::create([
            'nguoi_ban_id' => $shopOwner->id,
            'ten_cua_hang' => 'Shop Campaign',
            'trang_thai' => 'hoat_dong',
        ]);

        $createResponse = $this->postJson('/api/admin/campaigns', [
            'ma_voucher' => 'VC-APRIL',
            'ten_voucher' => 'Voucher tháng 4',
            'loai' => 'voucher_san',
            'mo_ta' => 'Chiến dịch thử nghiệm cho admin',
            'thoi_gian_bat_dau' => now()->toDateTimeString(),
            'thoi_gian_ket_thuc' => now()->addDays(7)->toDateTimeString(),
            'trang_thai' => 'dang_mo_dang_ky',
            'gia_tri_voucher' => 50000,
            'gia_tri_don_toi_thieu' => 300000,
            'giam_toi_da' => 50000,
            'so_luong_voucher' => 1000,
            'so_luong_moi_nguoi' => 1,
            'muc_ho_tro_san' => 15000,
            'ghi_chu' => 'Theo dõi chuyển đổi',
        ]);

        $createResponse->assertCreated()
            ->assertJsonPath('data.ma_voucher', 'VC-APRIL')
            ->assertJsonPath('data.so_luong_con_lai', 1000);

        $campaign = Voucher::firstOrFail();

        $registration = DangKyChienDich::create([
            'campaign_id' => $campaign->id,
            'shop_id' => $shop->id,
            'ngay_dang_ky' => now(),
            'trang_thai' => 'cho_duyet',
        ]);

        $updateResponse = $this->putJson('/api/admin/campaign-registrations/' . $registration->id, [
            'trang_thai' => 'da_duyet',
            'ghi_chu_admin' => 'Đủ điều kiện tham gia',
        ]);

        $updateResponse->assertOk()
            ->assertJsonPath('data.trang_thai', 'da_duyet')
            ->assertJsonPath('data.shop.id', $shop->id)
            ->assertJsonPath('data.campaign.id', $campaign->id);

        $this->assertDatabaseHas('dang_ky_chien_dich', [
            'id' => $registration->id,
            'trang_thai' => 'da_duyet',
            'ghi_chu_admin' => 'Đủ điều kiện tham gia',
        ]);

        $this->assertDatabaseHas('thong_bao', [
            'nguoi_dung_id' => $shopOwner->id,
            'loai_thong_bao' => 'campaign',
        ]);
    }
}
