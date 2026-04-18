<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CuaHang::query()
            ->with('owner')
            ->withCount('orders')
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

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function show(CuaHang $cuaHang): JsonResponse
    {
        return response()->json([
            'data' => CuaHang::query()
                ->with(['owner', 'orders.delivery'])
                ->withCount('orders')
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

        $cuaHang->update([
            'trang_thai' => $request->input('trang_thai'),
            'ly_do_tu_choi' => $request->input('ly_do_tu_choi'),
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
