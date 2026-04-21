<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\DanhGia;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;

class DanhGiaController extends Controller
{
    // ================== TẠO ĐÁNH GIÁ ==================
    public function store(Request $request)
    {
        $userId = auth()->id();

        $request->validate([
            'don_hang_id' => 'required|exists:don_hang,id',
            'san_pham_id' => 'required|exists:san_pham,id',
            'so_sao' => 'required|integer|min:1|max:5',
            'noi_dung' => 'nullable|string'
        ]);

        // Check đơn hàng
        $donHang = DonHang::where('id', $request->don_hang_id)
            ->where('nguoi_mua_id', $userId)
            ->first();

        if (!$donHang) {
            return response()->json(['message' => 'Đơn hàng không hợp lệ'], 403);
        }

        // Check trạng thái
        if ($donHang->trang_thai_don_hang !== 'da_giao') {
            return response()->json(['message' => 'Chỉ đánh giá khi đã nhận hàng'], 400);
        }

        // Check sản phẩm thuộc đơn
        $exists = ChiTietDonHang::where('don_hang_id', $request->don_hang_id)
            ->where('san_pham_id', $request->san_pham_id)
            ->exists();

        if (!$exists) {
            return response()->json(['message' => 'Sản phẩm không thuộc đơn'], 400);
        }

        // Check đã đánh giá chưa
        $daDanhGia = DanhGia::where('nguoi_mua_id', $userId)
            ->where('don_hang_id', $request->don_hang_id)
            ->where('san_pham_id', $request->san_pham_id)
            ->exists();

        if ($daDanhGia) {
            return response()->json(['message' => 'Đã đánh giá rồi'], 400);
        }

        $danhGia = DanhGia::create([
            'nguoi_mua_id' => $userId,
            'don_hang_id' => $request->don_hang_id,
            'san_pham_id' => $request->san_pham_id,
            'so_sao' => $request->so_sao,
            'noi_dung' => $request->noi_dung,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Đánh giá thành công',
            'data' => $danhGia
        ], 201);
    }

    // ================== LẤY THEO SẢN PHẨM ==================
    public function getByProduct($san_pham_id)
    {
        $reviews = DanhGia::with('nguoiMua:id,ho_ten,anh_dai_dien')
            ->where('san_pham_id', $san_pham_id)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // ================== UPDATE ==================
    public function update(Request $request, $id)
    {
        $userId = auth()->id();

        $review = DanhGia::where('id', $id)
            ->where('nguoi_mua_id', $userId)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Không tìm thấy đánh giá'], 404);
        }

        $review->update([
            'so_sao' => $request->so_sao ?? $review->so_sao,
            'noi_dung' => $request->noi_dung ?? $review->noi_dung,
        ]);

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $review
        ]);
    }

    // ================== DELETE ==================
    public function destroy($id)
    {
        $userId = auth()->id();

        $review = DanhGia::where('id', $id)
            ->where('nguoi_mua_id', $userId)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Không tìm thấy'], 404);
        }

        $review->delete();

        return response()->json(['message' => 'Đã xoá đánh giá']);
    }
}