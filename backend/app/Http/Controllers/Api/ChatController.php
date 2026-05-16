<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HoiThoai;
use App\Models\HoiThoaiThanhVien;
use App\Models\TinNhanHoiThoai;
use App\Models\NguoiDung;
use App\Models\CuaHang;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Lấy danh sách hội thoại của user hiện tại
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();
        
        $conversations = HoiThoai::whereHas('members', function($q) use ($user) {
            $q->where('nguoi_dung_id', $user->id);
        })
        ->with(['members.user', 'members.user.cuaHang', 'order', 'complaint'])
        ->orderBy('thoi_gian_cuoi', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Khởi tạo hoặc lấy hội thoại hiện có
     */
    public function initiateConversation(Request $request)
    {
        $request->validate([
            'loai_hoi_thoai' => 'required|string|in:tu_van,giao_hang,ho_tro,khieu_nai',
            'target_user_id' => 'required_without:cua_hang_id|integer',
            'cua_hang_id' => 'required_without:target_user_id|integer',
            'don_hang_id' => 'nullable|integer',
            'khieu_nai_id' => 'nullable|integer',
            'context_data' => 'nullable|array'
        ]);

        $user = $request->user();
        $targetUserId = $request->target_user_id;

        // Nếu truyền cua_hang_id, tìm nguoi_dung_id của chủ cửa hàng
        if ($request->cua_hang_id) {
            $shop = CuaHang::find($request->cua_hang_id);
            if (!$shop) return response()->json(['success' => false, 'message' => 'Cửa hàng không tồn tại'], 404);
            $targetUserId = $shop->nguoi_ban_id;
        }

        // Ngăn chặn tự chat với chính mình
        if ((int)$user->id === (int)$targetUserId) {
            return response()->json([
                'success' => false, 
                'message' => 'Bạn không thể tự trò chuyện với chính mình.'
            ], 400);
        }

        // Tìm hội thoại 1-1 đã có (cùng loại và cùng đơn hàng/khiếu nại nếu có)
        $existing = HoiThoai::where('loai_hoi_thoai', $request->loai_hoi_thoai)
            ->where('don_hang_id', $request->don_hang_id)
            ->where('khieu_nai_id', $request->khieu_nai_id)
            ->whereHas('members', function($q) use ($user) {
                $q->where('nguoi_dung_id', $user->id);
            })
            ->whereHas('members', function($q) use ($targetUserId) {
                $q->where('nguoi_dung_id', $targetUserId);
            })
            ->first();

        if ($existing) {
            // Cập nhật context data nếu cần
            if ($request->context_data) {
                $existing->context_data = array_merge((array)$existing->context_data, $request->context_data);
                $existing->save();
            }
            return response()->json(['success' => true, 'data' => $existing->load(['members.user', 'members.user.cuaHang'])]);
        }

        // Tạo mới hội thoại
        $conversation = HoiThoai::create([
            'ma_hoi_thoai' => 'HT' . strtoupper(Str::random(8)),
            'loai_hoi_thoai' => $request->loai_hoi_thoai,
            'don_hang_id' => $request->don_hang_id,
            'khieu_nai_id' => $request->khieu_nai_id,
            'trang_thai' => 'dang_mo',
            'context_data' => $request->context_data,
            'chua_doc_admin' => false,
        ]);

        // Thêm members
        HoiThoaiThanhVien::create(['hoi_thoai_id' => $conversation->id, 'nguoi_dung_id' => $user->id, 'vai_tro_tham_gia' => 'creator']);
        HoiThoaiThanhVien::create(['hoi_thoai_id' => $conversation->id, 'nguoi_dung_id' => $targetUserId, 'vai_tro_tham_gia' => 'participant']);

        return response()->json(['success' => true, 'data' => $conversation->load(['members.user', 'members.user.cuaHang'])]);
    }

    /**
     * Lấy danh sách tin nhắn của 1 hội thoại
     */
    public function getMessages(Request $request, $id)
    {
        $user = $request->user();
        
        // Check quyền
        $isMember = HoiThoaiThanhVien::where('hoi_thoai_id', $id)->where('nguoi_dung_id', $user->id)->exists();
        // TODO: Admin god mode check
        if (!$isMember && $user->vai_tro !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập'], 403);
        }

        $messages = TinNhanHoiThoai::where('hoi_thoai_id', $id)
            ->with(['sender:id,ho_ten,anh_dai_dien'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Gửi tin nhắn mới
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'noi_dung' => 'required|string',
            'loai_tin_nhan' => 'nullable|string|in:text,image,system',
        ]);

        $user = $request->user();
        $conversation = HoiThoai::findOrFail($id);

        // Kiem tra khoa luong chat (chi ap dung cho giao_hang va truong hop don hang that_bai/da_giao)
        if ($conversation->loai_hoi_thoai === 'giao_hang') {
            if ($conversation->trang_thai === 'bi_khoa') {
                return response()->json(['success' => false, 'message' => 'Hội thoại này đã bị khóa.'], 403);
            }
        }

        $message = TinNhanHoiThoai::create([
            'hoi_thoai_id' => $id,
            'nguoi_gui_id' => $user->id,
            'noi_dung' => $request->noi_dung,
            'loai_tin_nhan' => $request->loai_tin_nhan ?? 'text',
            'da_xem' => false,
            'created_at' => now()
        ]);

        $conversation->update([
            'tin_nhan_cuoi' => substr($request->noi_dung, 0, 100),
            'thoi_gian_cuoi' => now()
        ]);

        return response()->json(['success' => true, 'data' => $message->load('sender:id,ho_ten,anh_dai_dien')]);
    }

    /**
     * Đánh dấu đã đọc
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        // Cập nhật member last_read_at
        HoiThoaiThanhVien::where('hoi_thoai_id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->update([
                'da_doc' => true,
                'last_read_at' => now()
            ]);

        // Cập nhật tin nhắn (nếu có người nhận cụ thể)
        TinNhanHoiThoai::where('hoi_thoai_id', $id)
            ->where('nguoi_gui_id', '!=', $user->id)
            ->update(['da_xem' => true]);

        return response()->json(['success' => true]);
    }
}
