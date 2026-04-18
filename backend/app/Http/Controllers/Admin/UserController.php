<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private function normalizeRoles(string $role): array
    {
        return match ($role) {
            'customer', 'nguoi_mua' => ['customer', 'nguoi_mua'],
            'shop', 'nguoi_ban' => ['shop', 'nguoi_ban'],
            'shipper', 'giao_hang' => ['shipper', 'giao_hang'],
            'admin', 'quan_tri' => ['admin', 'quan_tri'],
            default => [$role],
        };
    }

    public function index(Request $request): JsonResponse
    {
        $query = NguoiDung::query()->with(['shipperProfile'])
            ->withCount([
                'thongBao',
                'complaints',
                'conversations',
                'buyerOrders as tong_don_hang',
                'buyerOrders as don_hoan_tat' => fn ($builder) => $builder->where('trang_thai_don_hang', 'da_giao'),
                'buyerOrders as don_huy' => fn ($builder) => $builder->where('trang_thai_don_hang', 'da_huy'),
            ])
            ->withSum('buyerOrders as tong_chi_tieu', 'tong_tien');

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ho_ten', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('so_dien_thoai', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('vai_tro')) {
            $query->whereIn('vai_tro', $this->normalizeRoles($request->input('vai_tro')));
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->input('trang_thai'));
        }

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function show(NguoiDung $nguoiDung): JsonResponse
    {
        $user = NguoiDung::query()
            ->with(['shipperProfile'])
            ->withCount([
                'thongBao',
                'complaints',
                'conversations',
                'buyerOrders as tong_don_hang',
                'buyerOrders as don_hoan_tat' => fn ($builder) => $builder->where('trang_thai_don_hang', 'da_giao'),
                'buyerOrders as don_huy' => fn ($builder) => $builder->where('trang_thai_don_hang', 'da_huy'),
            ])
            ->withSum('buyerOrders as tong_chi_tieu', 'tong_tien')
            ->findOrFail($nguoiDung->id);

        return response()->json(['data' => $user]);
    }

    public function updateStatus(Request $request, NguoiDung $nguoiDung, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
        ]);

        $nguoiDung->update([
            'trang_thai' => $data['trang_thai'],
            'ghi_chu' => $data['ghi_chu'] ?? $nguoiDung->ghi_chu,
        ]);

        $notificationService->sendToUser(
            $nguoiDung->id,
            'Cập nhật trạng thái tài khoản',
            'Tài khoản của bạn đã được cập nhật sang trạng thái ' . $nguoiDung->trang_thai . '.',
            'account'
        );

        return response()->json(['data' => $nguoiDung]);
    }

    public function bulkUpdateStatus(Request $request, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:nguoi_dung,id',
            'trang_thai' => 'required|string|max:20',
            'ghi_chu' => 'nullable|string',
        ]);

        $updatedUsers = NguoiDung::query()
            ->whereIn('id', $data['ids'])
            ->get()
            ->map(function (NguoiDung $user) use ($data, $notificationService) {
                $user->update([
                    'trang_thai' => $data['trang_thai'],
                    'ghi_chu' => $data['ghi_chu'] ?? $user->ghi_chu,
                ]);

                $notificationService->sendToUser(
                    $user->id,
                    'Cập nhật trạng thái tài khoản',
                    'Tài khoản của bạn đã được cập nhật sang trạng thái ' . $user->trang_thai . '.',
                    'account'
                );

                return $user;
            })
            ->values();

        return response()->json([
            'data' => $updatedUsers,
            'updated_count' => $updatedUsers->count(),
        ]);
    }
}
