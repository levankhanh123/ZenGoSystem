namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\CuocTroChuyen;
use App\Models\HoiThoai;
use App\Models\HoiThoaiThanhVien;
use App\Models\NguoiDung;
use App\Models\TinNhan;
use App\Models\TinNhanHoiThoai;
use App\Services\AdminNotificationService;
use App\Services\SocketRelayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function getConversations(Request $request, $cuaHangId): JsonResponse
    {
        $shop = CuaHang::query()->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')->find($cuaHangId);

        if (! $shop) {
            return response()->json(['message' => 'Cua hang khong ton tai'], 404);
        }

        $selectedUserId = $request->integer('user_id') ?: null;
        $selectedUser = $selectedUserId
            ? NguoiDung::query()->find($selectedUserId)
            : $shop->owner;

        if (! $selectedUser || (int) $selectedUser->id !== (int) $shop->nguoi_ban_id) {
            $selectedUser = $shop->owner;
        }

        $customerConversations = CuocTroChuyen::query()
            ->where('cua_hang_id', $cuaHangId)
            ->join('nguoi_dung', 'cuoc_tro_chuyen.nguoi_mua_id', '=', 'nguoi_dung.id')
            ->select('cuoc_tro_chuyen.*', 'nguoi_dung.ho_ten as nguoi_nhan_ten', 'nguoi_dung.vai_tro as nguoi_nhan_vai_tro')
            ->with(['tin_nhan' => function ($query) {
                $query->orderByDesc('created_at');
            }])
            ->get()
            ->map(function (CuocTroChuyen $conversation) {
                return [
                    'id' => 'customer-' . $conversation->id,
                    'backend_id' => $conversation->id,
                    'conversation_type' => 'customer',
                    'name' => $conversation->nguoi_nhan_vai_tro === 'admin'
                        ? 'Hỗ trợ Zengo (Admin)'
                        : ($conversation->nguoi_nhan_ten ?: 'Khách hàng'),
                    'participant_name' => $conversation->nguoi_nhan_ten,
                    'participant_role' => $conversation->nguoi_nhan_vai_tro,
                    'is_admin' => $conversation->nguoi_nhan_vai_tro === 'admin',
                    'last_message' => $conversation->tin_nhan->first()?->noi_dung ?: 'Chưa có tin nhắn',
                    'avatar' => mb_substr($conversation->nguoi_nhan_ten ?: 'K', 0, 1),
                    'updated_at' => optional($conversation->tin_nhan->first()?->created_at ?? $conversation->created_at)?->toIso8601String(),
                ];
            });

        $supportConversation = $this->resolveSellerSupportConversation($shop, $selectedUser);

        $supportItems = collect();

        if ($supportConversation) {
            $supportConversation->loadMissing([
                'members.user:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai',
                'messages' => function ($query) {
                    $query->with(['sender:id,ho_ten,vai_tro'])->orderByDesc('created_at');
                },
            ]);

            $adminNames = $supportConversation->members
                ->map(fn (HoiThoaiThanhVien $member) => $member->user)
                ->filter(fn (?NguoiDung $user) => $user && in_array($user->vai_tro, ['admin', 'quan_tri'], true))
                ->map(fn (NguoiDung $user) => $user->ho_ten)
                ->filter()
                ->values();

            $supportItems->push([
                'id' => 'support-' . $supportConversation->id,
                'backend_id' => $supportConversation->id,
                'conversation_type' => 'support',
                'name' => 'Hỗ trợ Zengo (Admin)',
                'participant_name' => $adminNames->isNotEmpty() ? $adminNames->join(', ') : 'Đội ngũ hỗ trợ',
                'participant_role' => 'admin',
                'is_admin' => true,
                'last_message' => $supportConversation->messages->first()?->noi_dung ?: 'Chưa có tin nhắn',
                'avatar' => 'A',
                'updated_at' => optional($supportConversation->thoi_gian_cuoi ?? $supportConversation->created_at)?->toIso8601String(),
                'shop_id' => $shop->id,
            ]);
        }

        $conversations = $customerConversations
            ->concat($supportItems)
            ->sortByDesc(function (array $conversation) {
                return strtotime($conversation['updated_at'] ?? '') ?: 0;
            })
            ->values();

        return response()->json($conversations);
    }

    public function getMessages($id): JsonResponse
    {
        [$type, $backendId] = $this->parseConversationReference($id);

        if ($type === 'support') {
            $conversation = HoiThoai::query()
                ->with([
                    'messages.sender:id,ho_ten,vai_tro',
                    'messages.recipient:id,ho_ten,vai_tro',
                ])
                ->find($backendId);

            if (! $conversation) {
                return response()->json(['message' => 'Hoi thoai ho tro khong ton tai'], 404);
            }

            $messages = $conversation->messages
                ->sortBy('created_at')
                ->values()
                ->map(function (TinNhanHoiThoai $message) use ($backendId) {
                    return [
                        'id' => $message->id,
                        'cuoc_tro_chuyen_id' => 'support-' . $backendId,
                        'nguoi_gui_id' => $message->nguoi_gui_id,
                        'nguoi_nhan_id' => $message->nguoi_nhan_id,
                        'noi_dung' => $message->noi_dung,
                        'loai_tin_nhan' => $message->loai_tin_nhan,
                        'created_at' => optional($message->created_at)?->toIso8601String(),
                        'sender' => $message->sender,
                        'recipient' => $message->recipient,
                    ];
                });

            return response()->json($messages);
        }

        if (! CuocTroChuyen::query()->whereKey($backendId)->exists()) {
            return response()->json(['message' => 'Cuoc tro chuyen khong ton tai'], 404);
        }

        $messages = TinNhan::query()
            ->where('cuoc_tro_chuyen_id', $backendId)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, AdminNotificationService $notificationService, SocketRelayService $socketRelay): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['nullable', 'string'],
            'cuoc_tro_chuyen_id' => ['nullable'],
            'nguoi_gui_id' => ['required', 'integer', 'exists:nguoi_dung,id'],
            'noi_dung' => ['required', 'string'],
            'loai_tin_nhan' => ['nullable', 'string'],
        ]);

        $conversationReference = $validated['conversation_id'] ?? $validated['cuoc_tro_chuyen_id'] ?? null;

        if (! $conversationReference) {
            return response()->json(['message' => 'Thieu dinh danh cuoc tro chuyen.'], 422);
        }

        [$type, $backendId] = $this->parseConversationReference($conversationReference);

        if ($type === 'support') {
            $conversation = HoiThoai::query()->with('members.user')->find($backendId);

            if (! $conversation) {
                return response()->json(['message' => 'Hoi thoai ho tro khong ton tai'], 404);
            }

            $message = DB::transaction(function () use ($validated, $conversation, $notificationService) {
                $isMember = $conversation->members()
                    ->where('nguoi_dung_id', $validated['nguoi_gui_id'])
                    ->exists();

                abort_if(! $isMember, 422, 'Nguoi gui khong thuoc hoi thoai nay.');

                $message = TinNhanHoiThoai::create([
                    'hoi_thoai_id' => $conversation->id,
                    'nguoi_gui_id' => $validated['nguoi_gui_id'],
                    'nguoi_nhan_id' => null,
                    'noi_dung' => $validated['noi_dung'],
                    'loai_tin_nhan' => $validated['loai_tin_nhan'] ?? 'van_ban',
                    'da_xem' => 0,
                    'created_at' => now(),
                ]);

                $conversation->update([
                    'tin_nhan_cuoi' => $validated['noi_dung'],
                    'thoi_gian_cuoi' => $message->created_at,
                    'trang_thai' => 'dang_xu_ly',
                    'chua_doc_admin' => 1,
                ]);

                $conversation->members()
                    ->where('nguoi_dung_id', '!=', $validated['nguoi_gui_id'])
                    ->update(['da_doc' => 0]);

                $conversation->members()
                    ->where('nguoi_dung_id', $validated['nguoi_gui_id'])
                    ->update([
                        'da_doc' => 1,
                        'last_read_at' => now(),
                    ]);

                $notificationService->notifyConversationMembers(
                    $conversation->members()->pluck('nguoi_dung_id'),
                    (int) $validated['nguoi_gui_id'],
                    'Tin nhắn mới từ người bán',
                    $validated['noi_dung']
                );

                return $message->load(['sender:id,ho_ten,vai_tro', 'recipient:id,ho_ten,vai_tro']);
            });

            $shopId = $this->extractShopIdFromConversationCode($conversation->ma_hoi_thoai);

            $rooms = [
                'admin.conversations',
                'conversation.' . $conversation->id,
            ];

            if ($shopId) {
                $rooms[] = 'seller.shop.' . $shopId;
            }

            $socketRelay->emit('conversation.updated', [
                'type' => 'message.created',
                'conversationId' => $conversation->id,
                'complaintId' => $conversation->khieu_nai_id,
                'senderId' => $message->nguoi_gui_id,
                'targetUserId' => null,
                'shopId' => $shopId,
            ], $rooms);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $message->id,
                    'cuoc_tro_chuyen_id' => 'support-' . $conversation->id,
                    'nguoi_gui_id' => $message->nguoi_gui_id,
                    'nguoi_nhan_id' => $message->nguoi_nhan_id,
                    'noi_dung' => $message->noi_dung,
                    'loai_tin_nhan' => $message->loai_tin_nhan,
                    'created_at' => optional($message->created_at)?->toIso8601String(),
                    'sender' => $message->sender,
                    'recipient' => $message->recipient,
                ],
            ], 201);
        }

        if (! CuocTroChuyen::query()->whereKey($backendId)->exists()) {
            return response()->json(['message' => 'Cuoc tro chuyen khong ton tai'], 404);
        }

        $message = TinNhan::create([
            'cuoc_tro_chuyen_id' => $backendId,
            'nguoi_gui_id' => $validated['nguoi_gui_id'],
            'noi_dung' => $validated['noi_dung'],
            'loai_tin_nhan' => $validated['loai_tin_nhan'] ?? 'text',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $message,
        ], 201);
    }

    private function resolveSellerSupportConversation(CuaHang $shop, ?NguoiDung $sellerUser): ?HoiThoai
    {
        if (! $sellerUser) {
            return null;
        }

        $adminIds = NguoiDung::query()
            ->whereIn('vai_tro', ['admin', 'quan_tri'])
            ->where('trang_thai', '!=', 'khoa')
            ->orderBy('id')
            ->pluck('id')
            ->values();

        if ($adminIds->isEmpty()) {
            return null;
        }

        $conversationCode = 'seller-support-shop-' . $shop->id;

        return DB::transaction(function () use ($adminIds, $conversationCode, $sellerUser) {
            $conversation = HoiThoai::query()->firstOrCreate(
                ['ma_hoi_thoai' => $conversationCode],
                [
                    'loai_hoi_thoai' => 'ho_tro',
                    'trang_thai' => 'moi',
                    'chua_doc_admin' => 0,
                ]
            );

            $memberIds = $adminIds
                ->push($sellerUser->id)
                ->unique()
                ->values();

            foreach ($memberIds as $memberId) {
                HoiThoaiThanhVien::query()->firstOrCreate(
                    [
                        'hoi_thoai_id' => $conversation->id,
                        'nguoi_dung_id' => $memberId,
                    ],
                    [
                        'vai_tro_tham_gia' => (int) $memberId === (int) $sellerUser->id ? 'seller' : 'admin',
                        'da_doc' => (int) $memberId === (int) $sellerUser->id,
                        'created_at' => now(),
                    ]
                );
            }

            return $conversation;
        });
    }

    private function parseConversationReference(string|int $reference): array
    {
        $value = (string) $reference;

        if (str_starts_with($value, 'support-')) {
            return ['support', (int) substr($value, strlen('support-'))];
        }

        if (str_starts_with($value, 'customer-')) {
            return ['customer', (int) substr($value, strlen('customer-'))];
        }

        return ['customer', (int) $value];
    }

    private function extractShopIdFromConversationCode(?string $conversationCode): ?int
    {
        if (! $conversationCode || ! str_starts_with($conversationCode, 'seller-support-shop-')) {
            return null;
        }

        $shopId = (int) substr($conversationCode, strlen('seller-support-shop-'));

        return $shopId > 0 ? $shopId : null;
    }
}