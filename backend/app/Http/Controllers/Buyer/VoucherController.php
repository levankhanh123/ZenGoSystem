<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    /**
     * GET /api/vouchers
     * Trả về danh sách voucher đang hoạt động (public)
     */
    public function index(Request $request)
    {
        $now = now();
        $user = auth('sanctum')->user();

        $query = DB::table('voucher')
            ->where('trang_thai', 'dang_dien_ra')
            ->where('thoi_gian_bat_dau', '<=', $now)
            ->where('thoi_gian_ket_thuc', '>=', $now)
            ->where('so_luong_con_lai', '>', 0);

        if ($request->filled('loai')) {
            $query->where('loai', $request->loai);
        }

        if ($request->filled('q')) {
            $query->where(function($q) use ($request) {
                $q->where('ma_voucher', 'like', '%' . $request->q . '%')
                  ->orWhere('ten_voucher', 'like', '%' . $request->q . '%');
            });
        }

        $vouchers = $query
            ->select([
                'id', 'ma_voucher', 'ten_voucher', 'loai',
                'mo_ta', 'gia_tri_voucher', 'gia_tri_don_toi_thieu',
                'giam_toi_da', 'so_luong_voucher', 'so_luong_con_lai',
                'thoi_gian_bat_dau', 'thoi_gian_ket_thuc',
            ])
            ->orderByDesc('gia_tri_voucher')
            ->paginate($request->get('per_page', 12));

        if ($user) {
            $collectedVoucherIds = DB::table('nguoi_dung_voucher')
                ->where('nguoi_dung_id', $user->id)
                ->pluck('voucher_id')
                ->toArray();

            $vouchers->getCollection()->transform(function($v) use ($collectedVoucherIds) {
                $v->is_collected = in_array($v->id, $collectedVoucherIds);
                return $v;
            });
        }

        return response()->json($vouchers);
    }

    /**
     * POST /api/vouchers/collect
     */
    public function collect(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|exists:voucher,id'
        ]);

        $user = $request->user();
        $voucherId = $request->voucher_id;

        // Check if already collected
        $exists = DB::table('nguoi_dung_voucher')
            ->where('nguoi_dung_id', $user->id)
            ->where('voucher_id', $voucherId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Bạn đã thu thập voucher này rồi'], 422);
        }

        // Check voucher availability
        $voucher = DB::table('voucher')->find($voucherId);
        
        if (!$voucher || $voucher->trang_thai !== 'dang_dien_ra') {
            return response()->json(['message' => 'Voucher không khả dụng'], 422);
        }

        if ($voucher->so_luong_con_lai <= 0) {
            return response()->json(['message' => 'Voucher đã hết lượt'], 422);
        }

        // Transaction
        DB::beginTransaction();
        try {
            DB::table('nguoi_dung_voucher')->insert([
                'nguoi_dung_id' => $user->id,
                'voucher_id'    => $voucherId,
                'trang_thai'    => 'chua_dung',
                'ngay_thu_thap' => now(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            DB::table('voucher')
                ->where('id', $voucherId)
                ->decrement('so_luong_con_lai');

            DB::commit();
            return response()->json(['message' => 'Thu thập voucher thành công!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/vouchers/types
     */
    public function types()
    {
        $types = DB::table('voucher')
            ->where('trang_thai', 'dang_dien_ra')
            ->select('loai')
            ->distinct()
            ->pluck('loai');

        return response()->json($types);
    }

    /**
     * GET /api/vouchers/{id}
     */
    public function show($id)
    {
        $voucher = DB::table('voucher')->where('id', $id)->first();

        if (!$voucher) {
            return response()->json(['message' => 'Không tìm thấy voucher'], 404);
        }

        return response()->json($voucher);
    }

    /**
     * POST /api/vouchers/check
     */
    public function check(Request $request)
    {
        $request->validate([
            'ma_voucher' => 'required|string',
            'tong_tien'  => 'required|numeric|min:0',
        ]);

        $now     = now();
        $voucher = DB::table('voucher')
            ->where('ma_voucher', strtoupper(trim($request->ma_voucher)))
            ->first();

        // Không tồn tại
        if (!$voucher) {
            return response()->json(['valid' => false, 'message' => 'Mã voucher không tồn tại'], 422);
        }

        // Hết hạn
        if ($voucher->thoi_gian_ket_thuc < $now) {
            return response()->json(['valid' => false, 'message' => 'Voucher đã hết hạn'], 422);
        }

        // Chưa tới ngày
        if ($voucher->thoi_gian_bat_dau > $now) {
            return response()->json(['valid' => false, 'message' => 'Voucher chưa có hiệu lực'], 422);
        }

        // Hết số lượng
        if ($voucher->so_luong_con_lai <= 0) {
            return response()->json(['valid' => false, 'message' => 'Voucher đã hết lượt sử dụng'], 422);
        }

        // --- Kiểm tra điều kiện Shop tham gia chiến dịch ---
        $user = auth('sanctum')->user();
        if ($user) {
            // Lấy danh sách Shop ID có sản phẩm trong giỏ hàng hiện tại
            $cartShopIds = DB::table('chi_tiet_gio_hang')
                ->join('gio_hang', 'chi_tiet_gio_hang.gio_hang_id', '=', 'gio_hang.id')
                ->join('san_pham', 'chi_tiet_gio_hang.san_pham_id', '=', 'san_pham.id')
                ->where('gio_hang.nguoi_mua_id', $user->id)
                ->distinct()
                ->pluck('san_pham.cua_hang_id')
                ->toArray();

            if (!empty($cartShopIds)) {
                // Nếu là Voucher Shop (Shop tự tạo)
                if ($voucher->cua_hang_id) {
                    if (!in_array($voucher->cua_hang_id, $cartShopIds)) {
                        return response()->json(['valid' => false, 'message' => 'Voucher này chỉ áp dụng cho sản phẩm của Shop sở hữu.'], 422);
                    }
                } 
                // Nếu là Voucher Sàn (Admin tạo) và có liên kết chiến dịch
                elseif ($voucher->campaign_id) {
                    $registeredShopIds = DB::table('dang_ky_chien_dich')
                        ->where('campaign_id', $voucher->campaign_id)
                        ->where('trang_thai', 'da_duyet')
                        ->pluck('cua_hang_id')
                        ->toArray();
                    
                    $hasRegisteredShop = false;
                    foreach ($cartShopIds as $shopId) {
                        if (in_array($shopId, $registeredShopIds)) {
                            $hasRegisteredShop = true;
                            break;
                        }
                    }

                    if (!$hasRegisteredShop) {
                        return response()->json(['valid' => false, 'message' => 'Voucher sàn này chỉ áp dụng khi mua hàng từ các Shop tham gia chiến dịch.'], 422);
                    }
                }
            }
        }

        // Không đủ giá trị đơn tối thiểu
        if ($request->tong_tien < $voucher->gia_tri_don_toi_thieu) {
            return response()->json([
                'valid'   => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format($voucher->gia_tri_don_toi_thieu) . '₫',
            ], 422);
        }

        // Tính số tiền giảm
        $giam = 0;
        if ($voucher->loai === 'giam_phan_tram') {
            $giam = $request->tong_tien * ($voucher->gia_tri_voucher / 100);
            if ($voucher->giam_toi_da > 0) {
                $giam = min($giam, $voucher->giam_toi_da);
            }
        } else {
            // co_dinh
            $giam = min($voucher->gia_tri_voucher, $request->tong_tien);
        }

        return response()->json([
            'valid'   => true,
            'message' => 'Áp dụng voucher thành công!',
            'voucher' => $voucher,
            'so_tien_giam' => round($giam),
            'thanh_toan'   => round($request->tong_tien - $giam),
        ]);
    }
}