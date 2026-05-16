<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\NguoiDung;
use App\Models\DiaChiNguoiDung;
use App\Models\ViTien;
use App\Models\ThongBao;
use App\Models\DonHang;
use App\Models\NhatKyTaiChinh;
use Illuminate\Support\Facades\DB;
use App\Services\ZaloPayService;
// use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Cloudinary\Cloudinary;


class AccountController extends Controller
{
    protected $zalopayService;

    public function __construct(ZaloPayService $zalopayService)
    {
        $this->zalopayService = $zalopayService;
    }

    // ================================================================
    // Tất cả routes đều yêu cầu auth:sanctum
    // Thêm vào routes/api.php:
    //
    // Route::middleware('auth:sanctum')->prefix('account')->group(function () {
    //     Route::get   ('/profile',                  [AccountController::class, 'getProfile']);
    //     Route::put   ('/profile',                  [AccountController::class, 'updateProfile']);
    //     Route::post  ('/profile/avatar',            [AccountController::class, 'updateAvatar']);
    //     Route::put   ('/profile/password',          [AccountController::class, 'changePassword']);
    //
    //     Route::get   ('/addresses',                [AccountController::class, 'getAddresses']);
    //     Route::post  ('/addresses',                [AccountController::class, 'addAddress']);
    //     Route::put   ('/addresses/{id}',           [AccountController::class, 'updateAddress']);
    //     Route::delete('/addresses/{id}',           [AccountController::class, 'deleteAddress']);
    //     Route::patch ('/addresses/{id}/default',   [AccountController::class, 'setDefaultAddress']);
    //
    //     Route::get   ('/wallet',                   [AccountController::class, 'getWallet']);
    //
    //     Route::get   ('/orders',                   [AccountController::class, 'getOrders']);
    //     Route::patch ('/orders/{id}/cancel',       [AccountController::class, 'cancelOrder']);
    //
    //     Route::get   ('/notifications',            [AccountController::class, 'getNotifications']);
    //     Route::patch ('/notifications/{id}/read',  [AccountController::class, 'markRead']);
    //     Route::patch ('/notifications/read-all',   [AccountController::class, 'markAllRead']);
    // });
    // ================================================================


    private function user(): NguoiDung
    {
        return auth()->user();
    }


    // ────────────────────────────────────────────────────────────────
    // PROFILE
    // ────────────────────────────────────────────────────────────────

    /** GET /api/account/profile */
    public function getProfile()
    {
        $u = $this->user();
        return response()->json($this->formatUser($u));
    }

    /** PUT /api/account/profile */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'ho_ten'        => 'required|string|max:100',
            'email'         => 'required|email|max:150|unique:nguoi_dung,email,' . $this->user()->id,
            'so_dien_thoai' => 'nullable|string|max:20',
        ]);

        $u = $this->user();
        $u->update($request->only('ho_ten', 'email', 'so_dien_thoai'));

        return response()->json(['message' => 'Cập nhật thành công', 'user' => $this->formatUser($u)]);
    }

    /** POST /api/account/profile/avatar  (multipart/form-data: avatar) */
    /** POST /api/account/profile/avatar */
public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $u = $this->user();

        // Khởi tạo Cloudinary SDK v2 trực tiếp
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);

        // Xoá ảnh cũ nếu có
        if ($u->anh_dai_dien && $u->cloudinary_public_id) {
            try {
                $cloudinary->uploadApi()->destroy($u->cloudinary_public_id);
            } catch (\Exception $e) {
                // ignore
            }
        }

        // Upload ảnh mới
        $upload = $cloudinary->uploadApi()->upload(
            $request->file('avatar')->getRealPath(),
            ['folder' => 'avatars']
        );

        $u->update([
            'anh_dai_dien'       => $upload['secure_url'],
            'cloudinary_public_id' => $upload['public_id'], // nếu có cột này
        ]);

        return response()->json([
            'message'      => 'Cập nhật ảnh thành công',
            'anh_dai_dien' => $upload['secure_url'],
        ]);
    }

    /** PUT /api/account/profile/password */
    public function changePassword(Request $request)
    {
        $request->validate([
            'mat_khau_cu'  => 'required|string',
            'mat_khau_moi' => 'required|string|min:8',
        ]);

        $u = $this->user();

        if (!Hash::check($request->mat_khau_cu, $u->mat_khau)) {
            throw ValidationException::withMessages([
                'mat_khau_cu' => 'Mật khẩu hiện tại không đúng.',
            ]);
        }

        $u->update(['mat_khau' => Hash::make($request->mat_khau_moi)]);

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }


    // ────────────────────────────────────────────────────────────────
    // ADDRESSES
    // ────────────────────────────────────────────────────────────────

    /** GET /api/account/addresses */
    public function getAddresses()
    {
        $addresses = DiaChiNguoiDung::where('nguoi_dung_id', $this->user()->id)
            ->orderByDesc('la_mac_dinh')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($addresses);
    }

    /** POST /api/account/addresses */
    public function addAddress(Request $request)
    {
        $request->validate([
            'ten_nguoi_nhan'   => 'required|string|max:100',
            'so_dien_thoai'    => 'required|string|max:20',
            'dia_chi_chi_tiet' => 'required|string',
            'province_id'      => 'required|integer',
            'district_id'      => 'required|integer',
            'ward_code'        => 'required|string|max:50',
            'la_mac_dinh'      => 'boolean',
        ]);

        $userId = $this->user()->id;

        // Nếu set default → bỏ default cũ
        if ($request->boolean('la_mac_dinh')) {
            DiaChiNguoiDung::where('nguoi_dung_id', $userId)->update(['la_mac_dinh' => 0]);
        }

        // Nếu chưa có địa chỉ nào → tự động set default
        $count = DiaChiNguoiDung::where('nguoi_dung_id', $userId)->count();

        $addr = DiaChiNguoiDung::create([
            'nguoi_dung_id'    => $userId,
            'ten_nguoi_nhan'   => $request->ten_nguoi_nhan,
            'so_dien_thoai'    => $request->so_dien_thoai,
            'dia_chi_chi_tiet' => $request->dia_chi_chi_tiet,
            'province_id'      => $request->province_id,
            'district_id'      => $request->district_id,
            'ward_code'        => $request->ward_code,
            'la_mac_dinh'      => $request->boolean('la_mac_dinh') || $count === 0 ? 1 : 0,
        ]);

        return response()->json(['message' => 'Thêm địa chỉ thành công', 'address' => $addr], 201);
    }

    /** PUT /api/account/addresses/{id} */
    public function updateAddress(Request $request, $id)
    {
        $addr = DiaChiNguoiDung::where('id', $id)
            ->where('nguoi_dung_id', $this->user()->id)
            ->firstOrFail();

        $request->validate([
            'ten_nguoi_nhan'   => 'required|string|max:100',
            'so_dien_thoai'    => 'required|string|max:20',
            'dia_chi_chi_tiet' => 'required|string',
            'province_id'      => 'required|integer',
            'district_id'      => 'required|integer',
            'ward_code'        => 'required|string|max:50',
            'la_mac_dinh'      => 'boolean',
        ]);

        if ($request->boolean('la_mac_dinh')) {
            DiaChiNguoiDung::where('nguoi_dung_id', $this->user()->id)
                ->where('id', '!=', $id)
                ->update(['la_mac_dinh' => 0]);
        }

        $addr->update($request->only('ten_nguoi_nhan', 'so_dien_thoai', 'dia_chi_chi_tiet', 'province_id', 'district_id', 'ward_code', 'la_mac_dinh'));

        return response()->json(['message' => 'Cập nhật địa chỉ thành công', 'address' => $addr]);
    }

    /** DELETE /api/account/addresses/{id} */
    public function deleteAddress($id)
    {
        $addr = DiaChiNguoiDung::where('id', $id)
            ->where('nguoi_dung_id', $this->user()->id)
            ->firstOrFail();

        $wasDefault = $addr->la_mac_dinh;
        $addr->delete();

        // Nếu xoá default → set default cho addr đầu tiên còn lại
        if ($wasDefault) {
            DiaChiNguoiDung::where('nguoi_dung_id', $this->user()->id)
                ->oldest()
                ->first()
                ?->update(['la_mac_dinh' => 1]);
        }

        return response()->json(['message' => 'Xoá địa chỉ thành công']);
    }

    /** PATCH /api/account/addresses/{id}/default */
    public function setDefaultAddress($id)
    {
        $userId = $this->user()->id;

        DiaChiNguoiDung::where('nguoi_dung_id', $userId)->update(['la_mac_dinh' => 0]);

        DiaChiNguoiDung::where('id', $id)
            ->where('nguoi_dung_id', $userId)
            ->firstOrFail()
            ->update(['la_mac_dinh' => 1]);

        return response()->json(['message' => 'Đặt địa chỉ mặc định thành công']);
    }


    // ────────────────────────────────────────────────────────────────
    // WALLET
    // ────────────────────────────────────────────────────────────────

    /** GET /api/account/wallet */
    public function getWallet()
    {
        $userId = $this->user()->id;

        // Tạo ví nếu chưa có
        $wallet = ViTien::firstOrCreate(
            ['nguoi_dung_id' => $userId],
            ['so_du' => 0, 'so_du_dong_bang' => 0]
        );

        // Lịch sử giao dịch từ nhat_ky_tai_chinh (20 giao dịch gần nhất)
        $transactions = NhatKyTaiChinh::where('doi_tuong', 'like', "nguoi_dung:{$userId}")
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($t) => [
                'id'         => $t->id,
                'loai'       => str_starts_with((string)$t->so_tien, '-') ? 'chi' : 'nap',
                'mo_ta'      => $t->noi_dung,
                'so_tien'    => (float) $t->so_tien,
                'created_at' => $t->created_at,
            ]);

        return response()->json([
            'so_du'          => (float) $wallet->so_du,
            'so_du_dong_bang'=> (float) $wallet->so_du_dong_bang,
            'so_du_kha_dung' => (float) ($wallet->so_du - $wallet->so_du_dong_bang),
            'updated_at'     => $wallet->updated_at,
            'transactions'   => $transactions,
        ]);
    }


    // ────────────────────────────────────────────────────────────────
    // ORDERS
    // ────────────────────────────────────────────────────────────────

    /** GET /api/account/orders?status=all&page=1 */
    public function getOrders(Request $request)
    {
        $query = DonHang::where('nguoi_mua_id', $this->user()->id)
            ->with([
                'chiTietDonHangs',
                'cuaHang:id,ten_cua_hang,logo',
                'giaHang:id,don_hang_id,trang_thai,ma_van_don,ngay_giao_du_kien,ngay_giao_thuc_te',
                'thanhToan:id,don_hang_id,trang_thai,cong_thanh_toan',
            ])
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('trang_thai_don_hang', $request->status);
        }

        $orders = $query->paginate($request->per_page ?? 10);

        $orders->getCollection()->transform(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    /** POST /api/account/orders */
    public function placeOrder(Request $request)
    {
        $request->validate([
            'dia_chi_id'             => 'required|exists:dia_chi_nguoi_dung,id',
            'phuong_thuc_thanh_toan' => 'required|string',
            'items'                  => 'required|array|min:1',
            'items.*.cart_item_id'   => 'required',
            'items.*.so_luong'       => 'required|integer|min:1',
        ]);

        $user = $this->user();
        $addr = DiaChiNguoiDung::where('id', $request->dia_chi_id)
            ->where('nguoi_dung_id', $user->id)
            ->firstOrFail();

        // Lấy thông tin các sản phẩm thực tế
        $cartItemIds = collect($request->items)->pluck('cart_item_id');
        $cartItems = \App\Models\ChiTietGioHang::whereIn('id', $cartItemIds)
            ->with('sanPham.cuaHang')
            ->get();

        if ($cartItems->count() === 0) {
            return response()->json(['message' => 'Giỏ hàng trống hoặc không hợp lệ.'], 422);
        }

        // Nhóm items theo shop để tạo nhiều đơn hàng nếu cần
        $groupedItems = $cartItems->groupBy(fn($item) => $item->sanPham->cua_hang_id);

        $createdOrders = [];

        try {
            DB::beginTransaction();

            foreach ($groupedItems as $cuaHangId => $items) {
                $shop = $items->first()->sanPham->cuaHang;
                $maDonHang = 'ZG' . strtoupper(uniqid());
                
                $tamTinh = $items->sum(fn($i) => $i->don_gia * $i->so_luong);
                $phiShip = 30000; // Mặc định hoặc tính toán thêm
                $tongTien = $tamTinh + $phiShip;

                $order = DonHang::create([
                    'ma_don_hang'              => $maDonHang,
                    'nguoi_mua_id'             => $user->id,
                    'cua_hang_id'              => $cuaHangId,
                    'ten_nguoi_nhan'           => $addr->ten_nguoi_nhan,
                    'so_dien_thoai_nguoi_nhan' => $addr->so_dien_thoai,
                    'dia_chi_nhan'             => $addr->dia_chi_chi_tiet,
                    'province_id'              => $addr->province_id,
                    'district_id'              => $addr->district_id,
                    'ward_code'                => $addr->ward_code,
                    'tam_tinh'                 => $tamTinh,
                    'phi_giao_hang'            => $phiShip,
                    'giam_gia'                 => 0, // Backend xử lý voucher sau nếu cần
                    'tong_tien'                => $tongTien,
                    'phuong_thuc_thanh_toan'   => $request->phuong_thuc_thanh_toan,
                    'trang_thai_thanh_toan'    => 'cho_thanh_toan',
                    'trang_thai_don_hang'      => 'cho_xac_nhan',
                ]);

                // Thông báo cho người bán
                $notification = ThongBao::create([
                    'nguoi_dung_id'  => $shop->nguoi_ban_id,
                    'tieu_de'        => 'Đơn hàng mới',
                    'noi_dung'       => "Bạn có đơn hàng mới {$maDonHang} từ khách hàng {$user->ho_ten}.",
                    'loai_thong_bao' => 'order',
                    'da_doc'         => 0,
                    'created_at'     => now(),
                ]);

                // Emit realtime socket
                try {
                    app(\App\Services\SocketRelayService::class)->emit('notification.created', [
                        'notification' => $notification->toArray(),
                    ], ["user.{$shop->nguoi_ban_id}"]);
                } catch (\Exception $e) {
                    // ignore socket error
                }

                foreach ($items as $item) {
                    $sp = $item->sanPham;
                    
                    // Tạo chi tiết
                    \App\Models\ChiTietDonHang::create([
                        'don_hang_id'  => $order->id,
                        'san_pham_id'  => $sp->id,
                        'ten_san_pham' => $sp->ten_san_pham,
                        'don_gia'      => $item->don_gia,
                        'so_luong'     => $item->so_luong,
                        'thanh_tien'   => $item->don_gia * $item->so_luong,
                        'created_at'   => now(),
                    ]);

                    // Cập nhật tồn kho (Tạm giữ)
                    $sp->increment('so_luong_tam_giu', $item->so_luong);
                }

                $createdOrders[] = $this->formatOrder($order->load('chiTietDonHangs', 'cuaHang'));
            }

            // Xóa items khỏi giỏ hàng
            \App\Models\ChiTietGioHang::whereIn('id', $cartItemIds)->delete();

            // Nếu thanh toán bằng ZaloPay
            if ($request->phuong_thuc_thanh_toan === 'zalopay') {
                $firstOrder = DonHang::find($createdOrders[0]['id']);
                $zpResult = $this->zalopayService->createOrder($firstOrder, $firstOrder->chiTietDonHangs);
                
                if ($zpResult['return_code'] === 1) {
                    DB::commit();
                    return response()->json([
                        'order' => $createdOrders[0],
                        'payment_url' => $zpResult['order_url']
                    ], 201);
                } else {
                    // Nếu lỗi ZaloPay, rollback để user có thể thử lại/chỉnh sửa
                    throw new \Exception('Lỗi khởi tạo thanh toán ZaloPay: ' . $zpResult['return_message']);
                }
            }

            DB::commit();

            // Trả về đơn hàng đầu tiên (hoặc cả list tùy frontend)
            return response()->json($createdOrders[0], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    /** PATCH /api/account/orders/{id}/cancel */
    public function cancelOrder(Request $request, $id)
    {
        $request->validate(['ly_do_huy' => 'required|string|max:255']);

        $order = DonHang::where('id', $id)
            ->where('nguoi_mua_id', $this->user()->id)
            ->firstOrFail();

        if (!in_array($order->trang_thai_don_hang, ['cho_xac_nhan', 'cho_lay_hang'])) {
            return response()->json(['message' => 'Không thể huỷ đơn này.'], 422);
        }

        DB::transaction(function () use ($order, $request) {
            $order->update([
                'trang_thai_don_hang' => 'da_huy',
                'ly_do_huy'           => $request->ly_do_huy,
            ]);

            // Hoàn lại tồn kho
            foreach ($order->chiTietDonHangs as $item) {
                \App\Models\SanPham::where('id', $item->san_pham_id)
                    ->decrement('so_luong_tam_giu', $item->so_luong);
            }

            // 2. Hoàn tiền nếu đã thanh toán
            if ($order->trang_thai_thanh_toan === 'da_thanh_toan') {
                \App\Models\NhatKyTaiChinh::create([
                    'loai' => 'hoan_tien',
                    'doi_tuong' => "nguoi_dung:{$order->nguoi_mua_id}",
                    'noi_dung' => "Hoàn tiền do người mua hủy đơn hàng {$order->ma_don_hang}",
                    'so_tien' => $order->tong_tien,
                    'created_at' => now(),
                ]);
            }

            // Ghi lịch sử
            \App\Models\LichSuTrangThaiDonHang::create([
                'don_hang_id'      => $order->id,
                'nguoi_cap_nhat_id'=> $this->user()->id,
                'trang_thai_cu'    => 'cho_xac_nhan',
                'trang_thai_moi'   => 'da_huy',
                'ghi_chu'          => $request->ly_do_huy,
            ]);
        });

        return response()->json(['message' => 'Huỷ đơn thành công']);
    }


    // ────────────────────────────────────────────────────────────────
    // NOTIFICATIONS
    // ────────────────────────────────────────────────────────────────

    /** GET /api/account/notifications?type=all&page=1 */
    public function getNotifications(Request $request)
    {
        $query = ThongBao::where('nguoi_dung_id', $this->user()->id)
            ->orderByDesc('created_at');

        if ($request->type && $request->type !== 'all') {
            $query->where('loai_thong_bao', $request->type);
        }

        $notis = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data'          => $notis->items(),
            'total'         => $notis->total(),
            'current_page'  => $notis->currentPage(),
            'last_page'     => $notis->lastPage(),
            'unread_count'  => ThongBao::where('nguoi_dung_id', $this->user()->id)
                                ->where('da_doc', 0)->count(),
        ]);
    }

    /** PATCH /api/account/notifications/{id}/read */
    public function markRead($id)
    {
        ThongBao::where('id', $id)
            ->where('nguoi_dung_id', $this->user()->id)
            ->update(['da_doc' => 1]);

        return response()->json(['message' => 'OK']);
    }

    /** PATCH /api/account/notifications/read-all */
    public function markAllRead()
    {
        ThongBao::where('nguoi_dung_id', $this->user()->id)
            ->where('da_doc', 0)
            ->update(['da_doc' => 1]);

        return response()->json(['message' => 'Đã đánh dấu tất cả đã đọc']);
    }


    public function repayOrder($id)
    {
        $user = $this->user();
        $order = DonHang::where('id', $id)
            ->where('nguoi_mua_id', $user->id)
            ->where('trang_thai_thanh_toan', 'cho_thanh_toan')
            ->where('phuong_thuc_thanh_toan', 'zalopay')
            ->firstOrFail();

        $zpResult = $this->zalopayService->createOrder($order, $order->chiTietDonHangs);

        if ($zpResult['return_code'] === 1) {
            return response()->json([
                'payment_url' => $zpResult['order_url']
            ]);
        } else {
            return response()->json([
                'message' => 'Lỗi khởi tạo thanh toán ZaloPay: ' . $zpResult['return_message']
            ], 400);
        }
    }

    public function getOrderStatus($id)
    {
        $user = request()->user();
        $order = DonHang::where('id', $id)->where('nguoi_mua_id', $user->id)->firstOrFail();

        return response()->json([
            'id' => $order->id,
            'ma_don_hang' => $order->ma_don_hang,
            'trang_thai_thanh_toan' => $order->trang_thai_thanh_toan,
            'trang_thai_don_hang' => $order->trang_thai_don_hang,
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // Private helpers
    // ────────────────────────────────────────────────────────────────

    private function formatUser(NguoiDung $u): array
    {
        $data = [
            'id'            => $u->id,
            'ho_ten'        => $u->ho_ten,
            'email'         => $u->email,
            'so_dien_thoai' => $u->so_dien_thoai,
            'vai_tro'       => $u->vai_tro,
            'anh_dai_dien'  => $u->anh_dai_dien,
            'trang_thai'    => $u->trang_thai,
            'ngay_sinh'     => $u->ngay_sinh,
            'gioi_tinh'     => $u->gioi_tinh,
            'last_login_at' => $u->last_login_at,
            'created_at'    => $u->created_at,
        ];

        // Nếu là shipper, đính kèm profile
        if ($u->vai_tro === 'shipper') {
            $data['shipper_profile'] = $u->shipperProfile;
        }

        return $data;
    }

    private function formatOrder(DonHang $o): array
    {
        return [
            'id'                       => $o->id,
            'ma_don_hang'              => $o->ma_don_hang,
            'trang_thai_don_hang'      => $o->trang_thai_don_hang,
            'trang_thai_thanh_toan'    => $o->trang_thai_thanh_toan,
            'phuong_thuc_thanh_toan'   => $o->phuong_thuc_thanh_toan,
            'tam_tinh'                 => (float) $o->tam_tinh,
            'phi_giao_hang'            => (float) $o->phi_giao_hang,
            'giam_gia'                 => (float) $o->giam_gia,
            'tong_tien'                => (float) $o->tong_tien,
            'ten_nguoi_nhan'           => $o->ten_nguoi_nhan,
            'so_dien_thoai_nguoi_nhan' => $o->so_dien_thoai_nguoi_nhan,
            'dia_chi_nhan'             => $o->dia_chi_nhan,
            'ly_do_huy'                => $o->ly_do_huy,
            'ghi_chu'                  => $o->ghi_chu,
            'created_at'               => $o->created_at,
            'ten_cua_hang'             => $o->cuaHang?->ten_cua_hang,
            'logo_cua_hang'            => $o->cuaHang?->logo,
            'giao_hang'                => $o->giaHang ? [
                'trang_thai'         => $o->giaHang->trang_thai,
                'ma_van_don'         => $o->giaHang->ma_van_don,
                'ngay_giao_du_kien'  => $o->giaHang->ngay_giao_du_kien,
                'ngay_giao_thuc_te'  => $o->giaHang->ngay_giao_thuc_te,
            ] : null,
            'chi_tiet' => $o->chiTietDonHangs->map(fn($i) => [
                'id'          => $i->id,
                'san_pham_id' => $i->san_pham_id,
                'ten_san_pham'=> $i->ten_san_pham,
                'don_gia'     => (float) $i->don_gia,
                'so_luong'    => $i->so_luong,
                'thanh_tien'  => (float) $i->thanh_tien,
                'hinh_anh'    => optional(\App\Models\SanPham::find($i->san_pham_id))->hinh_dai_dien,
            ]),
        ];
    }
}