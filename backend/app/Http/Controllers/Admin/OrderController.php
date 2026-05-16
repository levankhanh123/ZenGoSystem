<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonHang;
use App\Models\LichSuTrangThaiDonHang;
use App\Models\NhatKyHoatDong;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DonHang::query()->with(['buyer', 'shop.owner', 'delivery']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_don_hang', 'like', "%{$keyword}%")
                    ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%")
                    ->orWhere('so_dien_thoai_nguoi_nhan', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('trang_thai_don_hang')) {
            $query->where('trang_thai_don_hang', $request->input('trang_thai_don_hang'));
        }

        if ($request->filled('trang_thai_thanh_toan')) {
            $query->where('trang_thai_thanh_toan', $request->input('trang_thai_thanh_toan'));
        }

        if ($request->filled('loai_xu_ly')) {
            $query->where('loai_xu_ly', $request->input('loai_xu_ly'));
        }

        if ($request->has('bat_thuong') && $request->input('bat_thuong') !== '') {
            $query->where('bat_thuong', $request->boolean('bat_thuong'));
        }

        $perPage = $request->input('per_page', 10);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json(array_merge($orders->toArray(), [
            'stats' => [
                'total' => DonHang::count(),
                'abnormal' => DonHang::where('bat_thuong', true)->count(),
                'need_review' => DonHang::where('trang_thai_xac_nhan', 'can_admin_xac_nhan')->count(),
                'delivered' => DonHang::where('trang_thai_don_hang', 'da_giao')->count(),
            ]
        ]));
    }

    public function show(DonHang $donHang): JsonResponse
    {
        return response()->json([
            'data' => $donHang->load([
                'buyer', 
                'shop.owner', 
                'delivery', 
                'complaints', 
                'conversations', 
                'chiTietDonHang.sanPham', 
                'lichSuTrangThai.nguoiCapNhat'
            ]),
        ]);
    }

    public function updateStatus(Request $request, DonHang $donHang, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai_don_hang' => 'nullable|string|max:30',
            'trang_thai_thanh_toan' => 'nullable|string|max:30',
            'trang_thai_xac_nhan' => 'nullable|string|max:30',
            'bat_thuong' => 'nullable|boolean',
            'ly_do_bat_thuong' => 'nullable|array',
            'ly_do_bat_thuong.*' => 'string|max:255',
            'loai_xu_ly' => 'nullable|string|max:30',
            'ly_do_huy' => 'nullable|string',
            'ghi_chu_lich_su' => 'nullable|string',
            'nguoi_cap_nhat_id' => 'nullable|integer|exists:nguoi_dung,id',
        ]);

        DB::transaction(function () use ($donHang, $data, $notificationService) {
            $oldStatus = $donHang->trang_thai_don_hang;

            $donHang->update([
                'trang_thai_don_hang' => $data['trang_thai_don_hang'] ?? $donHang->trang_thai_don_hang,
                'trang_thai_thanh_toan' => $data['trang_thai_thanh_toan'] ?? $donHang->trang_thai_thanh_toan,
                'trang_thai_xac_nhan' => $data['trang_thai_xac_nhan'] ?? $donHang->trang_thai_xac_nhan,
                'bat_thuong' => array_key_exists('bat_thuong', $data) ? $data['bat_thuong'] : $donHang->bat_thuong,
                'ly_do_bat_thuong' => array_key_exists('ly_do_bat_thuong', $data) ? $data['ly_do_bat_thuong'] : $donHang->ly_do_bat_thuong,
                'loai_xu_ly' => $data['loai_xu_ly'] ?? $donHang->loai_xu_ly,
                'ly_do_huy' => $data['ly_do_huy'] ?? $donHang->ly_do_huy,
                'nguoi_xac_nhan_id' => $data['nguoi_cap_nhat_id'] ?? $donHang->nguoi_xac_nhan_id,
                'thoi_gian_xac_nhan' => array_key_exists('trang_thai_xac_nhan', $data) ? now() : $donHang->thoi_gian_xac_nhan,
            ]);

            if (isset($data['trang_thai_xac_nhan']) && $data['trang_thai_xac_nhan'] === 'da_xac_nhan') {
                NhatKyHoatDong::create([
                    'nguoi_dung_id' => $donHang->nguoi_mua_id,
                    'hanh_dong' => 'order_verify',
                    'mo_ta' => "Admin xác minh đơn hàng '{$donHang->ma_don_hang}'. Trạng thái bất thường đã được gỡ bỏ.",
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }

            if (! empty($data['trang_thai_don_hang']) && $data['trang_thai_don_hang'] !== $oldStatus) {
                LichSuTrangThaiDonHang::create([
                    'don_hang_id' => $donHang->id,
                    'nguoi_cap_nhat_id' => $data['nguoi_cap_nhat_id'] ?? null,
                    'trang_thai_cu' => $oldStatus,
                    'trang_thai_moi' => $data['trang_thai_don_hang'],
                    'ghi_chu' => $data['ghi_chu_lich_su'] ?? $data['ly_do_huy'] ?? null,
                    'created_at' => now(),
                ]);
            }

            $notificationService->sendToUser(
                $donHang->nguoi_mua_id,
                'Cập nhật đơn hàng ' . $donHang->ma_don_hang,
                'Đơn hàng của bạn hiện có trạng thái: ' . $donHang->trang_thai_don_hang . '.',
                'order'
            );

            $shopOwnerId = $donHang->shop?->nguoi_ban_id;
            if ($shopOwnerId) {
                $notificationService->sendToUser(
                    $shopOwnerId,
                    'Cập nhật đơn hàng shop ' . $donHang->ma_don_hang,
                    'Đơn hàng tại shop của bạn hiện có trạng thái: ' . $donHang->trang_thai_don_hang . '.',
                    'order'
                );
            }
        });

        return response()->json(['data' => $donHang->fresh(['buyer', 'shop.owner', 'delivery', 'statusHistories'])]);
    }
}
