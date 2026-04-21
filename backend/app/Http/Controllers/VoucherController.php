<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    /**
     * GET /api/vouchers
     * Trả về danh sách voucher đang hoạt động (public)
     * Query params:
     *   - loai: loai_voucher (tuỳ chọn)
     *   - per_page: số lượng mỗi trang (default 12)
     */
    public function index(Request $request)
    {
        $now = now();

        $query = DB::table('voucher')
            ->where('trang_thai', 'dang_dien_ra')
            ->where('thoi_gian_bat_dau', '<=', $now)
            ->where('thoi_gian_ket_thuc', '>=', $now)
            ->where('so_luong_con_lai', '>', 0);

        if ($request->filled('loai')) {
            $query->where('loai', $request->loai);
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

        return response()->json($vouchers);
    }

    /**
     * GET /api/vouchers/types
     * Trả về danh sách loại voucher để filter
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
     * Chi tiết 1 voucher (dùng khi apply vào đơn hàng)
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
     * Kiểm tra mã voucher có hợp lệ không trước khi apply
     * Body: { ma_voucher, tong_tien }
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