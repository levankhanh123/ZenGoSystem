<?php

namespace App\Services;

use App\Models\NguoiDung;
use App\Models\ThongBao;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminNotificationService
{
    public function __construct(private readonly SocketRelayService $socketRelay)
    {
    }

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

    private function emitCreatedNotification(ThongBao $notification): void
    {
        $notification->loadMissing('user');

        $payload = [
            'notification' => $notification->toArray(),
        ];

        $this->socketRelay->emit('notification.created', $payload, [
            "user.{$notification->nguoi_dung_id}",
            'admin.notifications',
        ]);
    }

    public function sendToUser(int $userId, string $title, string $content, ?string $type = 'general'): ThongBao
    {
        $notification = ThongBao::create([
            'nguoi_dung_id' => $userId,
            'tieu_de' => $title,
            'noi_dung' => $content,
            'loai_thong_bao' => $type,
            'da_doc' => 0,
            'created_at' => now(),
        ]);

        $this->emitCreatedNotification($notification);

        return $notification;
    }

    public function sendToUsers(iterable $userIds, string $title, string $content, ?string $type = 'general'): int
    {
        $ids = collect($userIds)
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return 0;
        }

        $createdAt = now();

        $rows = $ids->map(fn ($userId) => [
                'nguoi_dung_id' => $userId,
                'tieu_de' => $title,
                'noi_dung' => $content,
                'loai_thong_bao' => $type,
                'da_doc' => 0,
                'created_at' => $createdAt,
            ])->all();

        DB::table('thong_bao')->insert($rows);

        ThongBao::query()
            ->with('user')
            ->where('created_at', $createdAt)
            ->whereIn('nguoi_dung_id', $ids)
            ->orderBy('id')
            ->get()
            ->each(fn (ThongBao $notification) => $this->emitCreatedNotification($notification));

        return $ids->count();
    }

    public function broadcastToRole(string $role, string $title, string $content, ?string $type = 'general'): int
    {
        $userIds = NguoiDung::whereIn('vai_tro', $this->normalizeRoles($role))->pluck('id');

        return $this->sendToUsers($userIds, $title, $content, $type);
    }

    public function notifyConversationMembers(Collection $memberIds, int $senderId, string $title, string $content): int
    {
        return $this->sendToUsers(
            $memberIds->reject(fn ($memberId) => (int) $memberId === $senderId),
            $title,
            $content,
            'chat_admin'
        );
    }
}
