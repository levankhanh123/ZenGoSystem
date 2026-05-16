<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\KhieuNai;
use App\Models\DonHang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnController extends Controller
{
    /**
     * Lấy danh sách yêu cầu Trả hàng / Hoàn tiền
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ]);

        $returns = KhieuNai::with(['order', 'complainant'])
            ->whereHas('order', function ($query) use ($validated) {
                $query->where('cua_hang_id', $validated['shop_id']);
            })
            ->where('loai_doi_tuong', 'tra_hang_hoan_tien')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($return) {
                return [
                    'id' => $return->id,
                    'code' => $return->order->ma_don_hang ?? 'N/A',
                    'order_id' => $return->order->id ?? null,
                    'customer' => $return->complainant->ho_ten ?? 'Khách vãng lai',
                    'buyer_id' => $return->nguoi_khieu_nai_id,
                    'reason' => $return->ly_do,
                    'content' => $return->noi_dung,
                    'evidence_images' => $return->hinh_anh_bang_chung ?? [],
                    'status' => $this->mapStatus($return->trang_thai),
                    'status_code' => $return->trang_thai,
                    'created_at_label' => optional($return->created_at)->format('d/m/Y H:i'),
                ];
            });

        return response()->json(['data' => $returns]);
    }

    /**
     * Chấp nhận hoàn tiền
     */
    public function accept(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
        ]);

        $return = KhieuNai::with('order')->where('id', $id)->firstOrFail();
        $order = $return->order;

        if (!$order || $order->cua_hang_id != $validated['shop_id']) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        DB::transaction(function () use ($return, $order) {
            $return->trang_thai = 'da_giai_quyet';
            $return->phan_quyet_admin = 'Người bán đồng ý hoàn tiền';
            $return->resolved_at = now();
            $return->save();

            // Hoàn tiền nếu đã thanh toán
            if ($order->trang_thai_thanh_toan === 'da_thanh_toan') {
                $order->trang_thai_thanh_toan = 'da_hoan_tien';
                
                $viTien = \App\Models\ViTien::firstOrCreate(
                    ['nguoi_dung_id' => $order->nguoi_mua_id],
                    ['so_du' => 0, 'so_du_dong_bang' => 0]
                );

                $viTien->so_du += $order->tong_tien;
                $viTien->save();

                \App\Models\NhatKyTaiChinh::create([
                    'nguoi_dung_id' => $order->nguoi_mua_id,
                    'don_hang_id' => $order->id,
                    'loai_giao_dich' => 'hoan_tien',
                    'so_tien' => $order->tong_tien,
                    'trang_thai' => 'thanh_cong',
                    'mo_ta' => "Hoàn tiền do trả hàng đơn {$order->ma_don_hang}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Đổi trạng thái đơn hàng (Có thể để da_huy hoặc tra_hang tùy nghiệp vụ sàn)
            // Ở đây tạm set là da_huy
            $oldStatus = $order->trang_thai_don_hang;
            $order->trang_thai_don_hang = 'da_huy';
            $order->ly_do_huy = 'Trả hàng / Hoàn tiền thành công';
            $order->save();

            \App\Models\LichSuTrangThaiDonHang::create([
                'don_hang_id' => $order->id,
                'nguoi_cap_nhat_id' => auth()->id(),
                'trang_thai_cu' => $oldStatus,
                'trang_thai_moi' => 'da_huy',
                'ghi_chu' => 'Hoàn tiền trả hàng',
            ]);
        });

        // Gửi thông báo cho người mua
        try {
            $notification = \App\Models\ThongBao::create([
                'nguoi_dung_id'  => $order->nguoi_mua_id,
                'tieu_de'        => 'Hoàn tiền thành công',
                'noi_dung'       => "Yêu cầu trả hàng/hoàn tiền của đơn hàng {$order->ma_don_hang} đã được người bán chấp nhận. Số tiền đã được cộng vào ví của bạn.",
                'loai_thong_bao' => 'order',
                'da_doc'         => 0,
                'created_at'     => now(),
            ]);
            
            app(\App\Services\SocketRelayService::class)->emit('notification.created', [
                'notification' => $notification->toArray(),
            ], ["user.{$order->nguoi_mua_id}"]);
        } catch (\Exception $e) {}

        return response()->json(['message' => 'Đã chấp nhận hoàn tiền thành công.']);
    }

    /**
     * Khiếu nại (Dispute) - Chuyển cho Admin xử lý
     */
    public function dispute(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
            'ly_do_tu_choi' => ['required', 'string', 'max:255'],
        ]);

        $return = KhieuNai::with('order')->where('id', $id)->firstOrFail();
        $order = $return->order;

        if (!$order || $order->cua_hang_id != $validated['shop_id']) {
            return response()->json(['message' => 'Không có quyền truy cập.'], 403);
        }

        $return->trang_thai = 'dang_xu_ly'; // Chờ admin xử lý
        $return->uu_tien = 'cao'; // Nâng mức ưu tiên
        $return->ly_do_tu_choi = $validated['ly_do_tu_choi']; // Ghi chú lý do người bán từ chối
        $return->save();

        return response()->json(['message' => 'Đã gửi khiếu nại lên hệ thống quản trị.']);
    }

    private function mapStatus(?string $status): string
    {
        return match ($status) {
            'cho_xu_ly' => 'Chờ xử lý',
            'dang_xu_ly' => 'Đang khiếu nại (Admin)',
            'da_giai_quyet' => 'Đã hoàn tiền',
            'tu_choi' => 'Bị từ chối',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Chờ xử lý',
        };
    }
}
