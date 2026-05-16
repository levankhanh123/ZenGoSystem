<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DonHang;
use App\Models\NhatKyTaiChinh;
use App\Models\ThongBao;
use App\Services\ZaloPayService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ZaloPayController extends Controller
{
    protected $zalopayService;

    public function __construct(ZaloPayService $zalopayService)
    {
        $this->zalopayService = $zalopayService;
    }

    /**
     * Xử lý Callback từ ZaloPay
     */
    public function callback(Request $request)
    {
        $result = [];
        $dataStr = $request->input('data');
        $requestMac = $request->input('mac');

        if ($this->zalopayService->verifyCallback($dataStr, $requestMac)) {
            $dataJson = json_decode($dataStr, true);
            
            // app_trans_id có dạng yyMMdd_ma_don_hang
            $appTransId = $dataJson['app_trans_id'];
            $parts = explode('_', $appTransId);
            $maDonHang = isset($parts[1]) ? $parts[1] : $appTransId;

            $order = DonHang::where('ma_don_hang', $maDonHang)->first();

            if ($order) {
                if ($order->trang_thai_thanh_toan !== 'da_thanh_toan') {
                    try {
                        DB::beginTransaction();

                        // Kiểm tra số tiền (ZaloPay amount)
                        if ((int)$dataJson['amount'] === (int)$order->tong_tien) {
                            $order->trang_thai_thanh_toan = 'da_thanh_toan';
                            $order->save();

                            // Trừ tồn kho thực tế (đã tạm giữ ở bước placeOrder)
                            foreach ($order->chiTietDonHangs as $item) {
                                $product = $item->sanPham;
                                if ($product) {
                                    $product->decrement('so_luong_ton', $item->so_luong);
                                    $product->decrement('so_luong_tam_giu', $item->so_luong);
                                }
                            }

                            // Ghi log tài chính
                            NhatKyTaiChinh::create([
                                'nguoi_dung_id' => $order->nguoi_mua_id,
                                'don_hang_id' => $order->id,
                                'loai_giao_dich' => 'thanh_toan',
                                'so_tien' => $order->tong_tien,
                                'trang_thai' => 'thanh_cong',
                                'mo_ta' => "Thanh toan ZaloPay cho don hang #{$order->ma_don_hang}",
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);

                            // Thông báo cho người bán
                            $shop = $order->shop;
                            $notification = ThongBao::create([
                                'nguoi_dung_id'  => $shop->nguoi_ban_id,
                                'tieu_de'        => 'Đơn hàng đã thanh toán',
                                'noi_dung'       => "Đơn hàng {$order->ma_don_hang} đã được thanh toán qua ZaloPay.",
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
                                // ignore
                            }

                            DB::commit();
                            $result['return_code'] = 1;
                            $result['return_message'] = "success";
                        } else {
                            Log::warning("ZaloPay Callback: Amount mismatch for order #{$maDonHang}");
                            $result['return_code'] = 2;
                            $result['return_message'] = "amount mismatch";
                        }
                    } catch (\Exception $e) {
                        DB::rollBack();
                        Log::error("ZaloPay Callback Error: " . $e->getMessage());
                        $result['return_code'] = 2;
                        $result['return_message'] = $e->getMessage();
                    }
                } else {
                    $result['return_code'] = 1;
                    $result['return_message'] = "already processed";
                }
            } else {
                Log::error("ZaloPay Callback: Order not found #{$maDonHang}");
                $result['return_code'] = 2;
                $result['return_message'] = "order not found";
            }
        } else {
            Log::error("ZaloPay Callback: MAC verification failed");
            $result['return_code'] = -1;
            $result['return_message'] = "mac verification failed";
        }

        return response()->json($result);
    }
}
