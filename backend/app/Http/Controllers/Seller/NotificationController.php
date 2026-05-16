<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ThongBao;
use App\Services\SocketRelayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => 'required|integer|exists:nguoi_dung,id',
        ]);

        $query = ThongBao::query()
            ->with('user')
            ->where('nguoi_dung_id', $payload['user_id'])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        return response()->json([
            'data' => $query->limit(20)->get(),
            'unread_count' => (clone $query)->where('da_doc', 0)->count(),
        ]);
    }

    public function markAsRead(Request $request, ThongBao $thongBao, SocketRelayService $socketRelay): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => 'required|integer|exists:nguoi_dung,id',
        ]);

        abort_unless((int) $thongBao->nguoi_dung_id === (int) $payload['user_id'], 403);

        $thongBao->update(['da_doc' => 1]);
        $thongBao->loadMissing('user');

        $socketRelay->emit('notification.updated', [
            'notification' => $thongBao->toArray(),
        ], ["user.{$thongBao->nguoi_dung_id}", 'admin.notifications']);

        return response()->json(['data' => $thongBao]);
    }
}
