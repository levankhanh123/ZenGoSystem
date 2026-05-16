<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\DonHang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
            'status' => ['nullable', 'string', 'max:50'],
            'keyword' => ['nullable', 'string', 'max:120'],
        ]);

        $lineItems = DB::table('chi_tiet_don_hang')
            ->selectRaw("don_hang_id, GROUP_CONCAT(CONCAT(ten_san_pham, ' x', so_luong) ORDER BY id SEPARATOR ', ') as products")
            ->groupBy('don_hang_id');

        $query = DonHang::query()
            ->where('cua_hang_id', $validated['shop_id'])
            ->with('buyer:id,ho_ten')
            ->leftJoinSub($lineItems, 'line_items', function ($join) {
                $join->on('line_items.don_hang_id', '=', 'don_hang.id');
            })
            ->select('don_hang.*', 'line_items.products');

        if (! empty($validated['status'])) {
            $query->where('trang_thai_don_hang', $validated['status']);
        }

        if (! empty($validated['keyword'])) {
            $keyword = $validated['keyword'];
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_don_hang', 'like', "%{$keyword}%")
                    ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%")
                    ->orWhere('line_items.products', 'like', "%{$keyword}%");
            });
        }

        $orders = $query
            ->orderByDesc('don_hang.created_at')
            ->get()
            ->map(function (DonHang $order) {
                return [
                    'id' => $order->id,
                    'code' => $order->ma_don_hang,
                    'customer' => $order->buyer?->ho_ten ?? $order->ten_nguoi_nhan,
                    'products' => $order->products ?: 'Chua co chi tiet san pham',
                    'total' => (float) $order->tong_tien,
                    'total_formatted' => number_format((float) $order->tong_tien, 0, ',', '.') . 'đ',
                    'status' => $this->mapOrderStatus($order->trang_thai_don_hang),
                    'status_code' => $order->trang_thai_don_hang,
                    'recipient_name' => $order->ten_nguoi_nhan,
                    'recipient_phone' => $order->so_dien_thoai_nguoi_nhan,
                    'recipient_address' => $order->dia_chi_nhan,
                    'payment_status' => $order->trang_thai_thanh_toan,
                    'created_at' => optional($order->created_at)?->toIso8601String(),
                    'created_at_label' => optional($order->created_at)?->format('d/m/Y H:i'),
                ];
            })
            ->values();

        return response()->json(['data' => $orders]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => ['required', 'integer', 'exists:cua_hang,id'],
            'status' => ['required', 'string', 'max:50'],
            'ly_do_huy' => ['nullable', 'string', 'max:255'],
        ]);

        $order = DonHang::with('chiTietDonHangs')->where('id', $id)->where('cua_hang_id', $validated['shop_id'])->firstOrFail();
        $oldStatus = $order->trang_thai_don_hang;

        DB::transaction(function () use ($order, $validated, $oldStatus) {
            $order->trang_thai_don_hang = $validated['status'];
            
            if ($validated['status'] === 'da_huy' && !empty($validated['ly_do_huy'])) {
                $order->ly_do_huy = $validated['ly_do_huy'];
            }

            // Xử lý khi hủy đơn
            if ($validated['status'] === 'da_huy') {
                // 1. Hoàn tồn kho (trừ số lượng tạm giữ)
                foreach ($order->chiTietDonHangs as $item) {
                    \App\Models\SanPham::where('id', $item->san_pham_id)
                        ->decrement('so_luong_tam_giu', $item->so_luong);
                }

                // 2. Hoàn tiền nếu đã thanh toán
                if ($order->trang_thai_thanh_toan === 'da_thanh_toan') {
                    $order->trang_thai_thanh_toan = 'da_hoan_tien';
                    
                    $viTien = \App\Models\ViTien::firstOrCreate(
                        ['nguoi_dung_id' => $order->nguoi_mua_id],
                        ['so_du' => 0, 'so_du_dong_bang' => 0]
                    );

                    $viTien->so_du += $order->tong_tien;
                    $viTien->save();

                    \App\Models\NhatKyTaiChinh::create([
                        'loai' => 'hoan_tien',
                        'doi_tuong' => "nguoi_dung:{$order->nguoi_mua_id}",
                        'noi_dung' => "Hoàn tiền do người bán hủy đơn hàng {$order->ma_don_hang}",
                        'so_tien' => $order->tong_tien,
                        'created_at' => now(),
                    ]);
                }
            }
            
            $order->save();

            // Nếu chuyển sang Chờ lấy hàng hoặc Đang giao, tự động tạo/cập nhật bản ghi GiaoHang
            if (in_array($validated['status'], ['cho_lay_hang', 'dang_giao'])) {
                // Nếu seller bấm "Bàn giao", thường status sẽ là 'cho_lay_hang' 
                // hoặc 'dang_giao' tùy vào frontend. Chúng ta map cả 2 về trạng thái 
                // để shipper có thể thấy trong "Đơn trong vùng".
                $deliveryStatus = 'cho_lay_hang'; 
                
                \App\Models\GiaoHang::updateOrCreate(
                    ['don_hang_id' => $order->id],
                    [
                        'trang_thai' => $deliveryStatus,
                        'cod_thu_ho' => $order->tong_tien, // Cập nhật tiền thu hộ
                    ]
                );
            }

            \App\Models\LichSuTrangThaiDonHang::create([
                'don_hang_id' => $order->id,
                'nguoi_cap_nhat_id' => auth()->id(),
                'trang_thai_cu' => $oldStatus,
                'trang_thai_moi' => $validated['status'],
                'ghi_chu' => $validated['ly_do_huy'] ?? 'Seller cập nhật trạng thái',
            ]);
        });

        // Nếu hủy đơn, thông báo cho người mua (Buyer) ngoài transaction
        if ($validated['status'] === 'da_huy') {
            try {
                $notification = \App\Models\ThongBao::create([
                    'nguoi_dung_id'  => $order->nguoi_mua_id,
                    'tieu_de'        => 'Đơn hàng đã bị hủy',
                    'noi_dung'       => "Đơn hàng {$order->ma_don_hang} của bạn đã bị người bán hủy với lý do: " . ($validated['ly_do_huy'] ?? 'Hết hàng/Thông tin không hợp lệ.'),
                    'loai_thong_bao' => 'order',
                    'da_doc'         => 0,
                    'created_at'     => now(),
                ]);
                
                app(\App\Services\SocketRelayService::class)->emit('notification.created', [
                    'notification' => $notification->toArray(),
                ], ["user.{$order->nguoi_mua_id}"]);
            } catch (\Exception $e) {
                // ignore
            }
        }

        return response()->json(['message' => 'Cập nhật trạng thái thành công', 'data' => $order]);
    }

    private function mapOrderStatus(?string $status): string
    {
        return match ($status) {
            'cho_xac_nhan', 'cho_he_thong_xac_nhan' => 'Chờ xác nhận',
            'da_xac_nhan', 'dang_xu_ly', 'cho_lay_hang', 'dang_dong_goi' => 'Đang chuẩn bị',
            'dang_giao' => 'Đang giao',
            'da_giao' => 'Đã giao',
            'da_huy' => 'Đã hủy',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Khác',
        };
    }
}
