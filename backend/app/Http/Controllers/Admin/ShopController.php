<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\NhatKyHoatDong;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CuaHang::query()
            ->with('owner')
            ->withCount(['orders', 'sanPhams'])
            ->withSum('orders as doanh_thu', 'tong_tien');

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ten_cua_hang', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('so_dien_thoai', 'like', "%{$keyword}%")
                    ->orWhere('ma_so_thue', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->input('trang_thai'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 10);

        $shops = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);

        return response()->json(array_merge($shops->toArray(), [
            'stats' => [
                'total' => CuaHang::count(),
                'pending' => CuaHang::where('trang_thai', 'cho_duyet')->count(),
                'approved' => CuaHang::where('trang_thai', 'da_duyet')->count(),
                'blocked' => CuaHang::where('trang_thai', 'tam_khoa')->count(),
            ]
        ]));
    }

    public function show(CuaHang $cuaHang): JsonResponse
    {
        return response()->json([
            'data' => CuaHang::query()
                ->with(['owner', 'orders.delivery'])
                ->withCount(['orders', 'sanPhams'])
                ->withSum('orders as doanh_thu', 'tong_tien')
                ->findOrFail($cuaHang->id),
        ]);
    }

    public function updateStatus(Request $request, CuaHang $cuaHang, AdminNotificationService $notificationService): JsonResponse
    {
        $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ly_do_tu_choi' => 'nullable|string',
        ]);

        $oldStatus = $cuaHang->trang_thai;
        $cuaHang->update([
            'trang_thai' => $request->input('trang_thai'),
            'ly_do_tu_choi' => $request->input('ly_do_tu_choi'),
        ]);

        NhatKyHoatDong::create([
            'nguoi_dung_id' => $cuaHang->nguoi_ban_id, // Gán log cho chủ shop
            'hanh_dong' => 'shop_status_update',
            'mo_ta' => "Cập nhật trạng thái shop '{$cuaHang->ten_cua_hang}' từ {$oldStatus} sang {$cuaHang->trang_thai}." . ($request->input('ly_do_tu_choi') ? " Lý do: " . $request->input('ly_do_tu_choi') : ""),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($cuaHang->nguoi_ban_id) {
            $content = 'Cửa hàng ' . $cuaHang->ten_cua_hang . ' đã được cập nhật trạng thái thành ' . $cuaHang->trang_thai . '.';

            if ($cuaHang->ly_do_tu_choi) {
                $content .= ' Lý do: ' . $cuaHang->ly_do_tu_choi;
            }

            $notificationService->sendToUser(
                $cuaHang->nguoi_ban_id,
                'Cập nhật hồ sơ cửa hàng',
                $content,
                'shop'
            );
        }

        return response()->json(['data' => $cuaHang]);
    }
}
