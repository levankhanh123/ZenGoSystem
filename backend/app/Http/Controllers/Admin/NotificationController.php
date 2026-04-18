<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminNotificationService;
use App\Services\SocketRelayService;
use App\Models\NguoiDung;
use App\Models\ThongBao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
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
        $query = ThongBao::query()->with('user');

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('tieu_de', 'like', "%{$keyword}%")
                    ->orWhere('noi_dung', 'like', "%{$keyword}%")
                    ->orWhereHas('user', function ($userQuery) use ($keyword) {
                        $userQuery
                            ->where('ho_ten', 'like', "%{$keyword}%")
                            ->orWhere('email', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('nguoi_dung_id')) {
            $query->where('nguoi_dung_id', $request->input('nguoi_dung_id'));
        }

        if ($request->filled('loai_thong_bao')) {
            $query->where('loai_thong_bao', $request->input('loai_thong_bao'));
        }

        if ($request->filled('vai_tro')) {
            $userIds = NguoiDung::whereIn('vai_tro', $this->normalizeRoles($request->input('vai_tro')))->pluck('id');
            $query->whereIn('nguoi_dung_id', $userIds);
        }

        if ($request->has('da_doc')) {
            $query->where('da_doc', $request->boolean('da_doc'));
        }

        $unreadCount = (clone $query)->where('da_doc', 0)->count();
        $totalCount = (clone $query)->count();

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->get(),
            'total_count' => $totalCount,
            'unread_count' => $unreadCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'nguoi_dung_id' => 'required|integer|exists:nguoi_dung,id',
            'tieu_de' => 'required|string|max:255',
            'noi_dung' => 'required|string',
            'loai_thong_bao' => 'nullable|string|max:50',
        ]);

        $notification = app(AdminNotificationService::class)->sendToUser(
            (int) $payload['nguoi_dung_id'],
            $payload['tieu_de'],
            $payload['noi_dung'],
            $payload['loai_thong_bao'] ?? 'general'
        );

        return response()->json(['data' => $notification->load('user')], 201);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'vai_tro' => 'required|string',
            'tieu_de' => 'required|string|max:255',
            'noi_dung' => 'required|string',
            'loai_thong_bao' => 'nullable|string|max:50',
        ]);

        $userIds = NguoiDung::whereIn('vai_tro', $this->normalizeRoles($payload['vai_tro']))->pluck('id');

        if ($userIds->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy người dùng phù hợp để gửi thông báo.',
            ], 422);
        }

        app(AdminNotificationService::class)->sendToUsers(
            $userIds,
            $payload['tieu_de'],
            $payload['noi_dung'],
            $payload['loai_thong_bao'] ?? 'general'
        );

        return response()->json([
            'message' => 'Thông báo đã gửi cho vai trò ' . $payload['vai_tro'],
            'sent_count' => $userIds->count(),
        ]);
    }

    public function markAsRead(ThongBao $thongBao, SocketRelayService $socketRelay): JsonResponse
    {
        $thongBao->update(['da_doc' => 1]);

        $thongBao->loadMissing('user');
        $socketRelay->emit('notification.updated', [
            'notification' => $thongBao->toArray(),
        ], ["user.{$thongBao->nguoi_dung_id}", 'admin.notifications']);

        return response()->json(['data' => $thongBao]);
    }

    public function markAllAsRead(Request $request, SocketRelayService $socketRelay): JsonResponse
    {
        $query = ThongBao::query();

        if ($request->filled('nguoi_dung_id')) {
            $query->where('nguoi_dung_id', $request->input('nguoi_dung_id'));
        }

        if ($request->filled('vai_tro')) {
            $userIds = NguoiDung::whereIn('vai_tro', $this->normalizeRoles($request->input('vai_tro')))->pluck('id');
            $query->whereIn('nguoi_dung_id', $userIds);
        }

        $notifications = (clone $query)->where('da_doc', 0)->get();
        $updated = $query->where('da_doc', 0)->update(['da_doc' => 1]);

        $notifications
            ->each(function (ThongBao $notification) use ($socketRelay) {
                $notification->da_doc = true;
                $notification->loadMissing('user');

                $socketRelay->emit('notification.updated', [
                    'notification' => $notification->toArray(),
                ], ["user.{$notification->nguoi_dung_id}", 'admin.notifications']);
            });

        return response()->json([
            'message' => "Đã đánh dấu $updated thông báo đã đọc",
            'updated_count' => $updated,
        ]);
    }

    public function bulkDelete(Request $request, SocketRelayService $socketRelay): JsonResponse
    {
        $payload = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:thong_bao,id',
        ]);

        $notifications = ThongBao::query()
            ->with('user')
            ->whereIn('id', $payload['ids'])
            ->get();

        $deleted = ThongBao::whereIn('id', $payload['ids'])->delete();

        $notifications->each(function (ThongBao $notification) use ($socketRelay) {
            $socketRelay->emit('notification.deleted', [
                'notification_id' => $notification->id,
                'user_id' => $notification->nguoi_dung_id,
            ], ["user.{$notification->nguoi_dung_id}", 'admin.notifications']);
        });

        return response()->json([
            'message' => 'Đã xóa thông báo đã chọn',
            'deleted_count' => $deleted,
        ]);
    }

    public function destroy(ThongBao $thongBao, SocketRelayService $socketRelay): JsonResponse
    {
        $notificationId = $thongBao->id;
        $userId = $thongBao->nguoi_dung_id;
        $thongBao->delete();

        $socketRelay->emit('notification.deleted', [
            'notification_id' => $notificationId,
            'user_id' => $userId,
        ], ["user.{$userId}", 'admin.notifications']);

        return response()->json(['message' => 'Thông báo đã được xóa']);
    }
}
