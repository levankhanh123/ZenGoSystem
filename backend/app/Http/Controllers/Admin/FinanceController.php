<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoiSoatShipper;
use App\Models\DoiSoatShop;
use App\Models\HoanTien;
use App\Models\NhatKyTaiChinh;
use App\Models\ThanhToan;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'tong_thanh_toan_online' => ThanhToan::where('cong_thanh_toan', '!=', 'cod')->sum('so_tien'),
                'tong_cod_chua_doi_soat' => DoiSoatShipper::sum('cod_con_thieu'),
                'tong_tien_cho_tra_shop' => DoiSoatShop::where('trang_thai', 'cho_chuyen_khoan')->sum('thuc_nhan'),
                'tong_phi_san' => DoiSoatShop::sum('phi_san'),
                'tong_phi_ship' => DoiSoatShipper::sum('phi_giao_hang_duoc_huong'),
                'tong_hoan_tien' => HoanTien::sum('so_tien'),
                'tong_ky_quy_shipper' => DoiSoatShipper::sum('ky_quy_hien_tai'),
                'tong_cong_no_shipper' => DoiSoatShipper::sum('cong_no'),
            ],
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $query = ThanhToan::query()->with(['order.buyer', 'order.shop']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_giao_dich', 'like', "%{$keyword}%")
                    ->orWhereHas('order', function ($orderQuery) use ($keyword) {
                        $orderQuery->where('ma_don_hang', 'like', "%{$keyword}%")
                            ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        if ($request->filled('cong_thanh_toan')) {
            $query->where('cong_thanh_toan', $request->string('cong_thanh_toan'));
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
    }

    public function shopSettlements(Request $request): JsonResponse
    {
        $query = DoiSoatShop::query()->with(['shop.owner']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_doi_soat', 'like', "%{$keyword}%")
                    ->orWhereHas('shop', function ($shopQuery) use ($keyword) {
                        $shopQuery->where('ten_cua_hang', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
    }

    public function shipperSettlements(Request $request): JsonResponse
    {
        $query = DoiSoatShipper::query()->with(['shipper.shipperProfile']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_doi_soat_shipper', 'like', "%{$keyword}%")
                    ->orWhereHas('shipper', function ($shipperQuery) use ($keyword) {
                        $shipperQuery->where('ho_ten', 'like', "%{$keyword}%")
                            ->orWhere('email', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai_cong_no')) {
            $query->where('trang_thai_cong_no', $request->string('trang_thai_cong_no'));
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
    }

    public function logs(Request $request): JsonResponse
    {
        $query = NhatKyTaiChinh::query();

        if ($request->filled('loai')) {
            $query->where('loai', $request->string('loai'));
        }

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('doi_tuong', 'like', "%{$keyword}%")
                    ->orWhere('noi_dung', 'like', "%{$keyword}%");
            });
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
    }

    public function refunds(Request $request): JsonResponse
    {
        $query = HoanTien::query()->with(['order.buyer', 'order.shop', 'payment']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ly_do', 'like', "%{$keyword}%")
                    ->orWhereHas('order', function ($orderQuery) use ($keyword) {
                        $orderQuery->where('ma_don_hang', 'like', "%{$keyword}%")
                            ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('payment', function ($paymentQuery) use ($keyword) {
                        $paymentQuery->where('ma_giao_dich', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
    }

    public function updatePayment(Request $request, ThanhToan $thanhToan, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
            'thoi_gian_thanh_toan' => 'nullable|date',
        ]);

        DB::transaction(function () use ($thanhToan, $data, $notificationService) {
            $thanhToan->update([
                'trang_thai' => $data['trang_thai'],
                'ghi_chu' => $data['ghi_chu'] ?? $thanhToan->ghi_chu,
                'thoi_gian_thanh_toan' => $data['thoi_gian_thanh_toan'] ?? $thanhToan->thoi_gian_thanh_toan,
            ]);

            NhatKyTaiChinh::create([
                'loai' => 'giao_dich_nguoi_mua',
                'doi_tuong' => $thanhToan->ma_giao_dich ?? ('payment:' . $thanhToan->id),
                'noi_dung' => 'Cập nhật trạng thái thanh toán thành ' . $thanhToan->trang_thai,
                'so_tien' => $thanhToan->so_tien,
                'created_at' => now(),
            ]);

            $buyerId = $thanhToan->order?->nguoi_mua_id;
            if ($buyerId) {
                $notificationService->sendToUser(
                    $buyerId,
                    'Cập nhật thanh toán đơn hàng',
                    'Thanh toán cho đơn ' . ($thanhToan->order?->ma_don_hang ?? '') . ' hiện ở trạng thái ' . $thanhToan->trang_thai . '.',
                    'payment'
                );
            }
        });

        return response()->json(['data' => $thanhToan->fresh(['order.buyer', 'order.shop'])]);
    }

    public function updateShopSettlement(Request $request, DoiSoatShop $doiSoatShop, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
            'ngay_doi_soat' => 'nullable|date',
        ]);

        DB::transaction(function () use ($doiSoatShop, $data, $notificationService) {
            $doiSoatShop->update([
                'trang_thai' => $data['trang_thai'],
                'ghi_chu' => $data['ghi_chu'] ?? $doiSoatShop->ghi_chu,
                'ngay_doi_soat' => $data['ngay_doi_soat'] ?? $doiSoatShop->ngay_doi_soat,
            ]);

            NhatKyTaiChinh::create([
                'loai' => 'doi_soat_shop',
                'doi_tuong' => $doiSoatShop->ma_doi_soat,
                'noi_dung' => 'Cập nhật đối soát shop thành ' . $doiSoatShop->trang_thai,
                'so_tien' => $doiSoatShop->thuc_nhan,
                'created_at' => now(),
            ]);

            $ownerId = $doiSoatShop->shop?->nguoi_ban_id;
            if ($ownerId) {
                $notificationService->sendToUser(
                    $ownerId,
                    'Cập nhật đối soát shop',
                    'Phiên đối soát ' . $doiSoatShop->ma_doi_soat . ' hiện có trạng thái ' . $doiSoatShop->trang_thai . '.',
                    'settlement_shop'
                );
            }
        });

        return response()->json(['data' => $doiSoatShop->fresh(['shop.owner'])]);
    }

    public function updateShipperSettlement(Request $request, DoiSoatShipper $doiSoatShipper, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai_cong_no' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
            'ngay_cap_nhat' => 'nullable|date',
            'cod_da_nop' => 'nullable|numeric|min:0',
            'cod_con_thieu' => 'nullable|numeric|min:0',
            'cong_no' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($doiSoatShipper, $data, $notificationService) {
            $doiSoatShipper->update([
                'trang_thai_cong_no' => $data['trang_thai_cong_no'],
                'ghi_chu' => $data['ghi_chu'] ?? $doiSoatShipper->ghi_chu,
                'ngay_cap_nhat' => $data['ngay_cap_nhat'] ?? $doiSoatShipper->ngay_cap_nhat,
                'cod_da_nop' => $data['cod_da_nop'] ?? $doiSoatShipper->cod_da_nop,
                'cod_con_thieu' => $data['cod_con_thieu'] ?? $doiSoatShipper->cod_con_thieu,
                'cong_no' => $data['cong_no'] ?? $doiSoatShipper->cong_no,
            ]);

            NhatKyTaiChinh::create([
                'loai' => 'doi_soat_shipper',
                'doi_tuong' => $doiSoatShipper->ma_doi_soat_shipper,
                'noi_dung' => 'Cập nhật đối soát shipper thành ' . $doiSoatShipper->trang_thai_cong_no,
                'so_tien' => $doiSoatShipper->cong_no,
                'created_at' => now(),
            ]);

            $notificationService->sendToUser(
                $doiSoatShipper->shipper_id,
                'Cập nhật đối soát shipper',
                'Phiên đối soát ' . $doiSoatShipper->ma_doi_soat_shipper . ' hiện có trạng thái công nợ ' . $doiSoatShipper->trang_thai_cong_no . '.',
                'settlement_shipper'
            );
        });

        return response()->json(['data' => $doiSoatShipper->fresh(['shipper.shipperProfile'])]);
    }

    public function updateRefund(Request $request, HoanTien $hoanTien, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hoanTien, $data, $notificationService) {
            $hoanTien->update([
                'trang_thai' => $data['trang_thai'],
                'ghi_chu' => $data['ghi_chu'] ?? $hoanTien->ghi_chu,
            ]);

            NhatKyTaiChinh::create([
                'loai' => 'hoan_tien',
                'doi_tuong' => 'refund:' . $hoanTien->id,
                'noi_dung' => 'Cập nhật hoàn tiền thành ' . $hoanTien->trang_thai,
                'so_tien' => $hoanTien->so_tien,
                'created_at' => now(),
            ]);

            $buyerId = $hoanTien->order?->nguoi_mua_id;
            if ($buyerId) {
                $notificationService->sendToUser(
                    $buyerId,
                    'Cập nhật hoàn tiền đơn hàng',
                    'Yêu cầu hoàn tiền của bạn hiện có trạng thái ' . $hoanTien->trang_thai . '.',
                    'refund'
                );
            }
        });

        return response()->json(['data' => $hoanTien->fresh(['order.buyer', 'payment'])]);
    }
}
