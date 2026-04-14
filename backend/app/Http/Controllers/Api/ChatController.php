<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CuocTroChuyen;
use App\Models\TinNhan;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    // Lấy danh sách cuộc trò chuyện (tuỳ biến theo người mua hoặc cửa hàng)
    // Ở đây, ví dụ lấy theo cửa hàng
    public function getConversations($cua_hang_id)
    {
        $conversations = CuocTroChuyen::where('cua_hang_id', $cua_hang_id)
            ->join('nguoi_dung', 'cuoc_tro_chuyen.nguoi_mua_id', '=', 'nguoi_dung.id')
            ->select('cuoc_tro_chuyen.*', 'nguoi_dung.ho_ten as nguoi_nhan_ten', 'nguoi_dung.vai_tro as nguoi_nhan_vai_tro')
            ->with(['tin_nhan' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->get();
            
        return response()->json($conversations);
    }
    
    // Lấy tin nhắn của 1 cuộc trò chuyện
    public function getMessages($id)
    {
        $messages = TinNhan::where('cuoc_tro_chuyen_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($messages);
    }

    // Gửi tin nhắn và lưu vào DB
    public function sendMessage(Request $request)
    {
        $request->validate([
            'cuoc_tro_chuyen_id' => 'required|integer',
            'nguoi_gui_id' => 'required|integer',
            'noi_dung' => 'required|string',
            'loai_tin_nhan' => 'nullable|string'
        ]);

        $message = TinNhan::create([
            'cuoc_tro_chuyen_id' => $request->cuoc_tro_chuyen_id,
            'nguoi_gui_id' => $request->nguoi_gui_id,
            'noi_dung' => $request->noi_dung,
            'loai_tin_nhan' => $request->loai_tin_nhan ?? 'text',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $message
        ], 201);
    }
}
