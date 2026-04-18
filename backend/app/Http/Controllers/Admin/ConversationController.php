<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HoiThoai;
use App\Models\HoiThoaiThanhVien;
use App\Models\TinNhanHoiThoai;
use App\Services\AdminNotificationService;
use App\Services\SocketRelayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    private function extractShopRoom(HoiThoai $hoiThoai): ?string
    {
        $prefix = 'seller-support-shop-';

        if (! $hoiThoai->ma_hoi_thoai || ! str_starts_with($hoiThoai->ma_hoi_thoai, $prefix)) {
            return null;
        }

        $shopId = (int) substr($hoiThoai->ma_hoi_thoai, strlen($prefix));

        return $shopId > 0 ? 'seller.shop.' . $shopId : null;
    }

    private function relayConversationUpdate(HoiThoai $hoiThoai, SocketRelayService $socketRelay, string $type, array $extra = []): void
    {
        $rooms = [
            'admin.conversations',
            "conversation.{$hoiThoai->id}",
        ];

        $sellerShopRoom = $this->extractShopRoom($hoiThoai);

        if ($sellerShopRoom) {
            $rooms[] = $sellerShopRoom;
        }

        $socketRelay->emit('conversation.updated', [
            'type' => $type,
            'conversationId' => $hoiThoai->id,
            'complaintId' => $hoiThoai->khieu_nai_id,
            'shopId' => $sellerShopRoom ? (int) str_replace('seller.shop.', '', $sellerShopRoom) : null,
            ...$extra,
        ], $rooms);
    }

    public function index(Request $request): JsonResponse
    {
        $query = HoiThoai::query()->with([
            'order',
            'complaint',
            'members.user',
        ]);

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('ma_hoi_thoai', 'like', "%{$keyword}%")
                    ->orWhere('tin_nhan_cuoi', 'like', "%{$keyword}%")
                    ->orWhereHas('order', function ($orderQuery) use ($keyword) {
                        $orderQuery->where('ma_don_hang', 'like', "%{$keyword}%")
                            ->orWhere('ten_nguoi_nhan', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('complaint', function ($complaintQuery) use ($keyword) {
                        $complaintQuery->where('ma_khieu_nai', 'like', "%{$keyword}%")
                            ->orWhere('noi_dung', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('members.user', function ($userQuery) use ($keyword) {
                        $userQuery->where('ho_ten', 'like', "%{$keyword}%")
                            ->orWhere('email', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->string('trang_thai'));
        }

        if ($request->filled('loai_hoi_thoai')) {
            $query->where('loai_hoi_thoai', $request->string('loai_hoi_thoai'));
        }

        if ($request->has('chua_doc_admin')) {
            $query->where('chua_doc_admin', $request->boolean('chua_doc_admin'));
        }

        if ($request->filled('don_hang_id')) {
            $query->where('don_hang_id', $request->integer('don_hang_id'));
        }

        if ($request->filled('khieu_nai_id')) {
            $query->where('khieu_nai_id', $request->integer('khieu_nai_id'));
        }

        return response()->json([
            'data' => $query->orderByDesc('thoi_gian_cuoi')->orderByDesc('created_at')->get(),
        ]);
    }

    public function show(HoiThoai $hoiThoai): JsonResponse
    {
        $hoiThoai->load([
            'order.shop',
            'order.buyer',
            'complaint.complainant',
            'members.user',
            'messages.sender',
            'messages.recipient',
        ]);

        return response()->json(['data' => $hoiThoai]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ma_hoi_thoai' => 'required|string|max:50|unique:hoi_thoai,ma_hoi_thoai',
            'loai_hoi_thoai' => 'required|string|max:20',
            'don_hang_id' => 'nullable|integer|exists:don_hang,id',
            'khieu_nai_id' => 'nullable|integer|exists:khieu_nai,id',
            'trang_thai' => 'nullable|string|max:20',
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'integer|exists:nguoi_dung,id',
            'vai_tro_tham_gia' => 'nullable|array',
        ]);

        if (($data['loai_hoi_thoai'] ?? null) === 'khieu_nai' && empty($data['khieu_nai_id'])) {
            return response()->json([
                'message' => 'Hội thoại khiếu nại phải gắn với một khiếu nại.',
            ], 422);
        }

        if (! empty($data['khieu_nai_id'])) {
            $existingConversation = HoiThoai::with(['members.user'])
                ->where('khieu_nai_id', $data['khieu_nai_id'])
                ->first();

            if ($existingConversation) {
                return response()->json([
                    'data' => $existingConversation,
                    'message' => 'Hội thoại cho khiếu nại này đã tồn tại.',
                ]);
            }
        }

        $conversation = DB::transaction(function () use ($data) {
            $conversation = HoiThoai::create([
                'ma_hoi_thoai' => $data['ma_hoi_thoai'],
                'loai_hoi_thoai' => $data['loai_hoi_thoai'],
                'don_hang_id' => $data['don_hang_id'] ?? null,
                'khieu_nai_id' => $data['khieu_nai_id'] ?? null,
                'trang_thai' => $data['trang_thai'] ?? 'moi',
                'chua_doc_admin' => 1,
            ]);

            foreach ($data['member_ids'] as $memberId) {
                HoiThoaiThanhVien::create([
                    'hoi_thoai_id' => $conversation->id,
                    'nguoi_dung_id' => $memberId,
                    'vai_tro_tham_gia' => $data['vai_tro_tham_gia'][$memberId] ?? 'participant',
                    'da_doc' => 0,
                    'created_at' => now(),
                ]);
            }

            return $conversation;
        });

        return response()->json(['data' => $conversation->load(['members.user'])], 201);
    }

    public function sendMessage(Request $request, HoiThoai $hoiThoai, AdminNotificationService $notificationService, SocketRelayService $socketRelay): JsonResponse
    {
        $data = $request->validate([
            'nguoi_gui_id' => 'required|integer|exists:nguoi_dung,id',
            'nguoi_nhan_id' => 'nullable|integer|exists:nguoi_dung,id',
            'noi_dung' => 'required|string',
            'loai_tin_nhan' => 'nullable|string|max:20',
        ]);

        $message = DB::transaction(function () use ($data, $hoiThoai, $notificationService) {
            $isMember = $hoiThoai->members()
                ->where('nguoi_dung_id', $data['nguoi_gui_id'])
                ->exists();

            abort_if(! $isMember, 422, 'Người gửi không thuộc hội thoại này.');

            $recipientId = isset($data['nguoi_nhan_id']) ? (int) $data['nguoi_nhan_id'] : null;

            if ($recipientId !== null) {
                $isRecipientMember = $hoiThoai->members()
                    ->where('nguoi_dung_id', $recipientId)
                    ->exists();

                abort_if(! $isRecipientMember, 422, 'Người nhận không thuộc hội thoại này.');
                abort_if($recipientId === (int) $data['nguoi_gui_id'], 422, 'Người nhận phải khác người gửi.');
            }

            $message = TinNhanHoiThoai::create([
                'hoi_thoai_id' => $hoiThoai->id,
                'nguoi_gui_id' => $data['nguoi_gui_id'],
                'nguoi_nhan_id' => $recipientId,
                'noi_dung' => $data['noi_dung'],
                'loai_tin_nhan' => $data['loai_tin_nhan'] ?? 'van_ban',
                'da_xem' => 0,
                'created_at' => now(),
            ]);

            $hoiThoai->update([
                'tin_nhan_cuoi' => $data['noi_dung'],
                'thoi_gian_cuoi' => $message->created_at,
                'chua_doc_admin' => 1,
            ]);

            $membersToMarkUnread = $hoiThoai->members()->where('nguoi_dung_id', '!=', $data['nguoi_gui_id']);

            if ($recipientId !== null) {
                $membersToMarkUnread->where('nguoi_dung_id', $recipientId);
            }

            $membersToMarkUnread->update([
                'da_doc' => 0,
            ]);

            $hoiThoai->members()->where('nguoi_dung_id', $data['nguoi_gui_id'])->update([
                'da_doc' => 1,
                'last_read_at' => now(),
            ]);

            $hoiThoai->messages()
                ->where('id', '!=', $message->id)
                ->where('nguoi_gui_id', $data['nguoi_gui_id'])
                ->update(['da_xem' => 1]);

            $notificationRecipients = $recipientId !== null
                ? collect([$recipientId])
                : $hoiThoai->members()->pluck('nguoi_dung_id');

            $notificationService->notifyConversationMembers(
                $notificationRecipients,
                (int) $data['nguoi_gui_id'],
                'Tin nhắn mới từ hỗ trợ',
                $data['noi_dung']
            );

            return $message;
        });

        $this->relayConversationUpdate($hoiThoai, $socketRelay, 'message.created', [
            'targetUserId' => $message->nguoi_nhan_id,
            'senderId' => $message->nguoi_gui_id,
            'messageId' => $message->id,
        ]);

        return response()->json(['data' => $message->load(['sender', 'recipient'])], 201);
    }

    public function markAdminRead(Request $request, HoiThoai $hoiThoai, SocketRelayService $socketRelay): JsonResponse
    {
        $hoiThoai->update(['chua_doc_admin' => 0]);

        $hoiThoai->messages()->update(['da_xem' => 1]);

        if ($request->filled('nguoi_dung_id')) {
            $hoiThoai->members()
                ->where('nguoi_dung_id', $request->integer('nguoi_dung_id'))
                ->update([
                    'da_doc' => 1,
                    'last_read_at' => now(),
                ]);
        }

        $this->relayConversationUpdate($hoiThoai, $socketRelay, 'conversation.read', [
            'targetUserId' => $request->integer('nguoi_dung_id') ?: null,
        ]);

        return response()->json(['data' => $hoiThoai]);
    }

    public function updateStatus(Request $request, HoiThoai $hoiThoai, SocketRelayService $socketRelay): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|string|max:20',
        ]);

        $hoiThoai->update($data);

        $this->relayConversationUpdate($hoiThoai, $socketRelay, 'conversation.status');

        return response()->json(['data' => $hoiThoai]);
    }
}
