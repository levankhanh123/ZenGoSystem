<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KhieuNai;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = KhieuNai::query()->with(['order', 'complainant', 'assignedAdmin', 'conversation']);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_khieu_nai', 'like', "%{$keyword}%")
                    ->orWhere('ly_do', 'like', "%{$keyword}%")
                    ->orWhere('noi_dung', 'like', "%{$keyword}%")
                    ->orWhereHas('order', function ($orderQuery) use ($keyword) {
                        $orderQuery->where('ma_don_hang', 'like', "%{$keyword}%")
                            ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('complainant', function ($userQuery) use ($keyword) {
                        $userQuery->where('ho_ten', 'like', "%{$keyword}%")
                            ->orWhere('email', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        if ($request->filled('nguon_tao')) {
            $query->where('nguon_tao', $request->string('nguon_tao'));
        }

        if ($request->filled('uu_tien')) {
            $query->where('uu_tien', $request->string('uu_tien'));
        }

        if ($request->input('assigned_admin_id') === 'unassigned') {
            $query->whereNull('assigned_admin_id');
        } elseif ($request->filled('assigned_admin_id')) {
            $query->where('assigned_admin_id', $request->integer('assigned_admin_id'));
        }

        return response()->json([
            'data' => $query->orderByDesc('created_at')->get(),
        ]);
    }

    public function show(KhieuNai $khieuNai): JsonResponse
    {
        $khieuNai->load(['order', 'complainant', 'assignedAdmin', 'conversation.messages.sender', 'conversation.members.user']);

        return response()->json(['data' => $khieuNai]);
    }

    public function update(Request $request, KhieuNai $khieuNai, AdminNotificationService $notificationService): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'nullable|string|max:30',
            'uu_tien' => 'nullable|string|max:20',
            'phan_quyet_admin' => 'nullable|string',
            'ly_do_tu_choi' => 'nullable|string',
            'assigned_admin_id' => 'nullable|integer|exists:nguoi_dung,id',
        ]);

        if (($data['trang_thai'] ?? null) === 'da_xu_ly') {
            $data['resolved_at'] = now();
        }

        $khieuNai->update($data);

        $notificationService->sendToUser(
            $khieuNai->nguoi_khieu_nai_id,
            'Cập nhật khiếu nại ' . $khieuNai->ma_khieu_nai,
            'Khiếu nại của bạn hiện có trạng thái: ' . $khieuNai->trang_thai . '.',
            'complaint'
        );

        return response()->json(['data' => $khieuNai->fresh(['order', 'complainant', 'assignedAdmin', 'conversation'])]);
    }
}
