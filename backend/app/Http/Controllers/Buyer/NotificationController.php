<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\ThongBao;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Lấy danh sách thông báo của người dùng
     */
    public function index($nguoi_dung_id)
    {
        $notifications = ThongBao::where('nguoi_dung_id', $nguoi_dung_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    public function markAsRead($id)
    {
        $notification = ThongBao::find($id);
        if ($notification) {
            $notification->da_doc = 1;
            $notification->save();
            return response()->json([
                'success' => true, 
                'message' => 'Đã đánh dấu thông báo là đã đọc'
            ]);
        }

        return response()->json([
            'success' => false, 
            'message' => 'Không tìm thấy thông báo'
        ], 404);
    }
}
