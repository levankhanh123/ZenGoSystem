<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipperController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NguoiDung::query()
            ->whereIn('vai_tro', ['shipper', 'giao_hang'])
            ->with('shipperProfile');

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ho_ten', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('so_dien_thoai', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->input('trang_thai'));
        }

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function show(NguoiDung $shipper): JsonResponse
    {
        return response()->json([
            'data' => $shipper->load('shipperProfile'),
        ]);
    }

    public function intervene(Request $request, NguoiDung $shipper, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'nullable|string|max:20',
            'trang_thai_noi_bo' => 'nullable|string|max:20',
            'ly_do_can_thiep_gan_nhat' => 'required|string',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($data['trang_thai'] ?? null) {
            $shipper->update(['trang_thai' => $data['trang_thai']]);
        }

        $profile = $shipper->shipperProfile;
        if ($profile) {
            $profile->update([
                'trang_thai_noi_bo' => $data['trang_thai_noi_bo'] ?? $profile->trang_thai_noi_bo,
                'lan_can_thiep_gan_nhat' => now(),
                'ly_do_can_thiep_gan_nhat' => $data['ly_do_can_thiep_gan_nhat'],
                'ghi_chu' => $data['ghi_chu'] ?? $profile->ghi_chu,
            ]);
        }

        $notificationService->sendToUser(
            $shipper->id,
            'Thông báo từ bộ phận vận hành giao hàng',
            $data['ly_do_can_thiep_gan_nhat'],
            'shipper_ops'
        );

        return response()->json([
            'data' => $shipper->fresh()->load('shipperProfile'),
        ]);
    }
}
