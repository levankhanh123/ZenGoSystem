<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DangKyChienDich;
use App\Models\Voucher;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voucher::query()->withCount('registrations');

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

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
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
        ]);

        $soLuongVoucher = (int) ($data['so_luong_voucher'] ?? 0);

        $campaign = Voucher::create([
            ...$data,
            'trang_thai' => $data['trang_thai'] ?? 'dang_mo_dang_ky',
            'gia_tri_voucher' => $data['gia_tri_voucher'] ?? 0,
            'gia_tri_don_toi_thieu' => $data['gia_tri_don_toi_thieu'] ?? 0,
            'giam_toi_da' => $data['giam_toi_da'] ?? 0,
            'so_luong_voucher' => $soLuongVoucher,
            'so_luong_da_dung' => 0,
            'so_luong_con_lai' => $soLuongVoucher,
            'so_luong_moi_nguoi' => $data['so_luong_moi_nguoi'] ?? 1,
            'muc_ho_tro_san' => $data['muc_ho_tro_san'] ?? 0,
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
        ]);

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

        return response()->json(['data' => $voucher->fresh()]);
    }

    public function destroy(Voucher $voucher): JsonResponse
    {
        if (! in_array($voucher->trang_thai, ['tam_dung', 'ket_thuc'], true)) {
            return response()->json([
                'message' => 'Chỉ được xóa chiến dịch khi đã tạm dừng hoặc kết thúc.',
            ], 422);
        }

        $voucher->delete();

        return response()->json(['message' => 'Đã xóa chiến dịch']);
    }

    public function registrations(Request $request): JsonResponse
    {
        $query = DangKyChienDich::query()->with(['campaign', 'shop.owner']);

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

        return response()->json(['data' => $query->orderByDesc('created_at')->get()]);
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
        });

        return response()->json(['data' => $dangKyChienDich->fresh(['campaign', 'shop.owner'])]);
    }
}
