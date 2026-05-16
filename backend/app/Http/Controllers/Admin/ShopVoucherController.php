<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\NhatKyHoatDong;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopVoucherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voucher::query()
            ->whereNotNull('cua_hang_id')
            ->whereNull('campaign_id') // Pure shop vouchers, not participation vouchers
            ->with(['shop.owner']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder->whereHas('shop', function ($shopQuery) use ($keyword) {
                        $shopQuery->where('ten_cua_hang', 'like', "%{$keyword}%");
                    })
                    ->orWhere('ma_voucher', 'like', "%{$keyword}%")
                    ->orWhere('ten_voucher', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('trang_thai')) {
            $status = (string) $request->string('trang_thai');
            
            // Map common slugs to Vietnamese strings for robustness
            $statusMap = [
                'dang_dien_ra' => 'Đang diễn ra',
                'sap_dien_ra' => 'Sắp diễn ra',
                'tam_dung' => 'Tạm dừng',
                'ket_thuc' => 'Đã kết thúc',
                'da_ket_thuc' => 'Đã kết thúc',
                'bi_khoa' => 'bi_khoa'
            ];

            $mappedStatus = $statusMap[$status] ?? $status;
            
            if ($mappedStatus === 'Đang diễn ra') {
                $query->whereIn('trang_thai', ['Đang diễn ra', 'dang_dien_ra']);
            } elseif ($mappedStatus === 'Sắp diễn ra') {
                $query->whereIn('trang_thai', ['Sắp diễn ra', 'sap_dien_ra']);
            } else {
                $query->where('trang_thai', $mappedStatus);
            }
        }

        $perPage = $request->input('per_page', 10);
        $vouchers = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($vouchers);
    }

    public function lock(Request $request, Voucher $voucher, AdminNotificationService $notificationService): JsonResponse
    {
        if (!$voucher->cua_hang_id) {
            return response()->json(['message' => 'Không thể khóa voucher hệ thống tại đây.'], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $reason = $request->input('reason');
        $oldStatus = $voucher->trang_thai;
        
        DB::transaction(function () use ($voucher, $reason) {
            $voucher->update([
                'trang_thai' => 'bi_khoa',
                'ghi_chu' => "Admin khóa: " . $reason . " (Trước đó: {$voucher->trang_thai})"
            ]);
        });

        // Send notification to seller
        $ownerId = $voucher->shop?->nguoi_ban_id;
        if ($ownerId) {
            $notificationService->sendToUser(
                $ownerId,
                'Voucher bị khóa do vi phạm',
                "Voucher '{$voucher->ten_voucher}' ({$voucher->ma_voucher}) của bạn đã bị Admin khóa. Lý do: {$reason}",
                'system'
            );
        }

        NhatKyHoatDong::create([
            'nguoi_dung_id' => auth()->id() ?? 1,
            'hanh_dong' => 'voucher_lock',
            'mo_ta' => "Admin khóa voucher shop: {$voucher->ma_voucher} của shop {$voucher->shop?->ten_cua_hang}. Lý do: {$reason}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Voucher đã bị khóa thành công.',
            'data' => $voucher->fresh(['shop.owner'])
        ]);
    }

    public function unlock(Request $request, Voucher $voucher): JsonResponse
    {
        if (!$voucher->cua_hang_id) {
            return response()->json(['message' => 'Thao tác không hợp lệ.'], 403);
        }

        DB::transaction(function () use ($voucher) {
            $voucher->update([
                'trang_thai' => 'dang_dien_ra', // Or restore to a logical state
            ]);
        });

        NhatKyHoatDong::create([
            'nguoi_dung_id' => auth()->id() ?? 1,
            'hanh_dong' => 'voucher_unlock',
            'mo_ta' => "Admin mở khóa voucher shop: {$voucher->ma_voucher} của shop {$voucher->shop?->ten_cua_hang}.",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Voucher đã được mở khóa.',
            'data' => $voucher->fresh(['shop.owner'])
        ]);
    }
}
