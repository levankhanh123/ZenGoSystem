<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoiSoatShipper;
use App\Models\ViTien;
use App\Models\NhatKyTaiChinh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReconciliationController extends Controller
{
    /**
     * Admin xác nhận đã thu tiền từ Shipper
     * Giải ngân tiền cho Seller
     */
    public function confirmShipperReconciliation(Request $request, $id)
    {
        $record = DoiSoatShipper::with(['delivery.order'])->findOrFail($id);

        if ($record->trang_thai_cong_no === 'paid') {
            return response()->json(['message' => 'Bản ghi này đã được đối soát trước đó'], 400);
        }

        try {
            DB::beginTransaction();

            // 1. Cập nhật bản ghi đối soát
            $record->update([
                'cod_da_nop' => $record->cod_da_thu,
                'cod_con_thieu' => 0,
                'trang_thai_cong_no' => 'paid',
                'ngay_cap_nhat' => now(),
            ]);

            // 2. Giảm công nợ shipper
            $shipperProfile = $record->shipper->shipperProfile;
            if ($shipperProfile) {
                $shipperProfile->decrement('cong_no_hien_tai', $record->cod_da_thu);
            }

            // 3. Giải ngân cho Seller (Từ Chờ về -> Khả dụng)
            $order = $record->delivery?->order;
            if ($order) {
                $sellerWallet = ViTien::where('nguoi_dung_id', $order->shop->nguoi_ban_id)->first();
                if ($sellerWallet) {
                    // Giảm tiền đóng băng (lúc này so_du tổng không đổi, nhưng so_du_dong_bang giảm -> kha_dung tăng)
                    $sellerWallet->decrement('so_du_dong_bang', $record->so_tien_nguoi_ban);
                    
                    NhatKyTaiChinh::create([
                        'loai' => 'giai_ngan_ban_hang',
                        'doi_tuong' => "order:{$order->id}",
                        'noi_dung' => "Giải ngân tiền từ đơn hàng COD #{$order->ma_don_hang} (Đối soát thành công)",
                        'so_tien' => $record->so_tien_nguoi_ban,
                        'created_at' => now(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Đối soát và giải ngân thành công',
                'data' => $record->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi đối soát: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Danh sách đối soát chờ xử lý
     */
    public function pendingList()
    {
        $list = DoiSoatShipper::where('trang_thai_cong_no', 'pending')
            ->with(['shipper', 'delivery.order'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($list);
    }
}
