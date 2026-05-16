<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DangKyChienDich;
use App\Models\Voucher;
use App\Models\NhatKyHoatDong;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\DanhMuc;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voucher::query()
            ->whereNull('cua_hang_id')
            ->withCount('registrations');

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_voucher', 'like', "%{$keyword}%")
                    ->orWhere('ten_voucher', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('loai')) {
            $query->where('loai', $request->string('loai'));
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        $totalCount = (clone $query)->count();
        $stats = [
            'total' => $totalCount,
            'active' => (clone $query)->where('trang_thai', 'dang_dien_ra')->count(),
            'open' => (clone $query)->where('trang_thai', 'dang_mo_dang_ky')->count(),
            'sold_out' => (clone $query)->where('so_luong_con_lai', '<=', 0)->count(),
        ];

        $perPage = $request->input('per_page', 10);
        $campaigns = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json(array_merge($campaigns->toArray(), ['stats' => $stats]));
    }

    public function getCategories(): JsonResponse
    {
        $categories = DanhMuc::whereNull('danh_muc_cha_id')
            ->with('children')
            ->get();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ma_voucher' => 'required|string|max:50|unique:voucher,ma_voucher',
            'ten_voucher' => 'required|string|max:255',
            'loai' => 'required|string|max:50',
            'mo_ta' => 'nullable|string',
            'thoi_gian_bat_dau' => 'required|date',
            'thoi_gian_ket_thuc' => 'required|date|after:thoi_gian_bat_dau',
            'trang_thai' => 'nullable|string|max:30',
            'gia_tri_voucher' => 'nullable|numeric|min:0',
            'gia_tri_don_toi_thieu' => 'nullable|numeric|min:0',
            'giam_toi_da' => 'nullable|numeric|min:0',
            'so_luong_voucher' => 'nullable|integer|min:0',
            'so_luong_moi_nguoi' => 'nullable|integer|min:1',
            'muc_ho_tro_san' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
            'doi_tuong_ap_dung' => 'nullable|string|in:toan_san,shop_dang_ky',
            'danh_muc_id' => 'nullable|integer|exists:danh_muc,id',
            'banner_url' => 'nullable|string',
            'mo_ta_rich' => 'nullable|string',
            'han_dang_ky' => 'required|date',
        ]);

        if (strtotime($data['thoi_gian_bat_dau']) <= strtotime($data['han_dang_ky'])) {
            return response()->json(['message' => 'Ngày bắt đầu chiến dịch phải sau hạn đăng ký của Seller.'], 422);
        }

        $soLuongVoucher = (int) ($data['so_luong_voucher'] ?? 0);

        $campaign = Voucher::create([
            ...$data,
            'trang_thai' => 'dang_mo_dang_ky', // Default as requested
            'gia_tri_voucher' => $data['gia_tri_voucher'] ?? 0,
            'gia_tri_don_toi_thieu' => $data['gia_tri_don_toi_thieu'] ?? 0,
            'giam_toi_da' => $data['giam_toi_da'] ?? 0,
            'so_luong_voucher' => $soLuongVoucher,
            'so_luong_da_dung' => 0,
            'so_luong_con_lai' => $soLuongVoucher,
            'so_luong_moi_nguoi' => $data['so_luong_moi_nguoi'] ?? 1,
            'muc_ho_tro_san' => $data['muc_ho_tro_san'] ?? 0,
            'cua_hang_id' => null, // Explicitly system campaign
        ]);

        NhatKyHoatDong::create([
            'nguoi_dung_id' => auth()->id() ?? 1,
            'hanh_dong' => 'campaign_create',
            'mo_ta' => "Admin tạo chiến dịch mới: {$campaign->ten_voucher} ({$campaign->ma_voucher}).",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json(['data' => $campaign], 201);
    }

    public function update(Request $request, Voucher $voucher): JsonResponse
    {
        $data = $request->validate([
            'ten_voucher' => 'nullable|string|max:255',
            'loai' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
            'thoi_gian_bat_dau' => 'nullable|date',
            'thoi_gian_ket_thuc' => 'nullable|date',
            'trang_thai' => 'nullable|string|max:30',
            'gia_tri_voucher' => 'nullable|numeric|min:0',
            'gia_tri_don_toi_thieu' => 'nullable|numeric|min:0',
            'giam_toi_da' => 'nullable|numeric|min:0',
            'so_luong_voucher' => 'nullable|integer|min:0',
            'so_luong_con_lai' => 'nullable|integer|min:0',
            'so_luong_moi_nguoi' => 'nullable|integer|min:1',
            'muc_ho_tro_san' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
            'doi_tuong_ap_dung' => 'nullable|string|in:toan_san,shop_dang_ky',
            'danh_muc_id' => 'nullable|integer|exists:danh_muc,id',
            'banner_url' => 'nullable|string',
            'mo_ta_rich' => 'nullable|string',
            'han_dang_ky' => 'nullable|date',
        ]);

        $start = $data['thoi_gian_bat_dau'] ?? $voucher->thoi_gian_bat_dau;
        $deadline = $data['han_dang_ky'] ?? $voucher->han_dang_ky;
        $end = $data['thoi_gian_ket_thuc'] ?? $voucher->thoi_gian_ket_thuc;

        if ($deadline && $start && strtotime($start) <= strtotime($deadline)) {
            return response()->json(['message' => 'Ngày bắt đầu chiến dịch phải sau hạn đăng ký của Seller.'], 422);
        }

        if ($start && $end && strtotime($end) <= strtotime($start)) {
            return response()->json(['message' => 'Ngày kết thúc chiến dịch phải sau ngày bắt đầu.'], 422);
        }

        if (
            isset($data['so_luong_voucher']) &&
            (int) $data['so_luong_voucher'] < (int) $voucher->so_luong_da_dung
        ) {
            return response()->json([
                'message' => 'Số lượng voucher không được nhỏ hơn số lượng đã dùng.',
            ], 422);
        }

        if (isset($data['so_luong_voucher']) && ! isset($data['so_luong_con_lai'])) {
            $data['so_luong_con_lai'] = max(0, (int) $data['so_luong_voucher'] - (int) $voucher->so_luong_da_dung);
        }

        $voucher->update($data);

        NhatKyHoatDong::create([
            'nguoi_dung_id' => auth()->id() ?? 1,
            'hanh_dong' => 'campaign_update',
            'mo_ta' => "Admin cập nhật chiến dịch: {$voucher->ten_voucher} ({$voucher->ma_voucher}).",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json(['data' => $voucher->fresh()]);
    }

    public function destroy(Voucher $voucher): JsonResponse
    {
        if (! in_array($voucher->trang_thai, ['tam_dung', 'ket_thuc'], true)) {
            return response()->json([
                'message' => 'Chỉ được xóa chiến dịch khi đã tạm dừng hoặc kết thúc.',
            ], 422);
        }

        $campaignName = $voucher->ten_voucher;
        $campaignCode = $voucher->ma_voucher;
        $voucher->delete();

        NhatKyHoatDong::create([
            'nguoi_dung_id' => auth()->id() ?? 1,
            'hanh_dong' => 'campaign_delete',
            'mo_ta' => "Admin xóa chiến dịch: {$campaignName} ({$campaignCode}).",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json(['message' => 'Đã xóa chiến dịch']);
    }

    public function registrations(Request $request): JsonResponse
    {
        $query = DangKyChienDich::query()->with([
            'campaign',
            'shop' => function ($shopQuery) {
                $shopQuery->withCount(['orders', 'products', 'orders as completed_orders_count' => function ($q) {
                    $q->where('trang_thai', 'hoan_thanh');
                }])->with('owner')
                ->addSelect([
                    'rating_trung_binh' => DB::table('danh_gia as dg')
                        ->join('san_pham as sp', 'dg.san_pham_id', '=', 'sp.id')
                        ->whereColumn('sp.cua_hang_id', 'cua_hang.id')
                        ->selectRaw('avg(dg.so_sao)')
                ]);
            }
        ]);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->whereHas('campaign', function ($campaignQuery) use ($keyword) {
                        $campaignQuery->where('ma_voucher', 'like', "%{$keyword}%")
                            ->orWhere('ten_voucher', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('shop', function ($shopQuery) use ($keyword) {
                        $shopQuery->where('ten_cua_hang', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->integer('campaign_id'));
        }

        if ($request->filled('campaign_type')) {
            $query->whereHas('campaign', function ($q) use ($request) {
                $q->where('loai', $request->string('campaign_type'));
            });
        }

        $stats = [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('trang_thai', 'cho_duyet')->count(),
            'approved' => (clone $query)->where('trang_thai', 'da_duyet')->count(),
            'rejected' => (clone $query)->where('trang_thai', 'tu_choi')->count(),
        ];

        $perPage = $request->input('per_page', 10);
        $registrations = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json(array_merge($registrations->toArray(), ['stats' => $stats]));
    }

    public function updateRegistration(Request $request, DangKyChienDich $dangKyChienDich, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ly_do_tu_choi' => 'nullable|string',
            'ghi_chu_admin' => 'nullable|string',
        ]);

        DB::transaction(function () use ($dangKyChienDich, $data, $notificationService) {
            $dangKyChienDich->update($data);

            $dangKyChienDich->load(['campaign', 'shop.owner']);
            $ownerId = $dangKyChienDich->shop?->nguoi_ban_id;

            if ($ownerId) {
                $notificationService->sendToUser(
                    $ownerId,
                    'Cập nhật đăng ký chiến dịch',
                    'Đăng ký chiến dịch ' . ($dangKyChienDich->campaign?->ten_voucher ?? '') . ' đã chuyển sang trạng thái ' . $dangKyChienDich->trang_thai . '.',
                    'campaign'
                );
            }

            NhatKyHoatDong::create([
                'nguoi_dung_id' => auth()->id() ?? 1,
                'hanh_dong' => 'campaign_registration_update',
                'mo_ta' => "Admin cập nhật trạng thái đăng ký của shop '{$dangKyChienDich->shop?->ten_cua_hang}' cho chiến dịch '{$dangKyChienDich->campaign?->ten_voucher}' sang '{$dangKyChienDich->trang_thai}'.",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        return response()->json(['data' => $dangKyChienDich->fresh(['campaign', 'shop.owner'])]);
    }

    public function bulkUpdateRegistrations(Request $request, AdminNotificationService $notificationService): JsonResponse
    {
        $payload = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:dang_ky_chien_dich,id',
            'trang_thai' => 'required|string|max:20',
            'ly_do_tu_choi' => 'nullable|string',
            'ghi_chu_admin' => 'nullable|string',
        ]);

        $count = 0;
        DB::transaction(function () use ($payload, $notificationService, &$count) {
            DangKyChienDich::whereIn('id', $payload['ids'])->update([
                'trang_thai' => $payload['trang_thai'],
                'ly_do_tu_choi' => $payload['ly_do_tu_choi'] ?? null,
                'ghi_chu_admin' => $payload['ghi_chu_admin'] ?? null,
            ]);

            $registrations = DangKyChienDich::with(['campaign', 'shop.owner'])
                ->whereIn('id', $payload['ids'])
                ->get();

            foreach ($registrations as $reg) {
                $ownerId = $reg->shop?->nguoi_ban_id;
                if ($ownerId) {
                    $notificationService->sendToUser(
                        $ownerId,
                        'Cập nhật đăng ký chiến dịch',
                        "Đăng ký chiến dịch '{$reg->campaign?->ten_voucher}' đã được cập nhật trạng thái mới.",
                        'campaign'
                    );
                }
                $count++;
            }

            NhatKyHoatDong::create([
                'nguoi_dung_id' => auth()->id() ?? 1,
                'hanh_dong' => 'campaign_registration_bulk_update',
                'mo_ta' => "Admin cập nhật hàng loạt {$count} đăng ký chiến dịch sang trạng thái '{$payload['trang_thai']}'.",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        return response()->json([
            'message' => "Đã cập nhật {$count} hồ sơ đăng ký.",
            'updated_count' => $count,
        ]);
    }
}
