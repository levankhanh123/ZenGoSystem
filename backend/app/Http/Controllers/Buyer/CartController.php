<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\GioHang;
use App\Models\ChiTietGioHang;
use App\Models\SanPham;

class CartController extends Controller
{
    // ── GET /api/cart ─────────────────────────────────────────────
    public function getCart()
    {
        $userId = auth()->id();

        $cart = GioHang::firstOrCreate(['nguoi_mua_id' => $userId]);

        $items = ChiTietGioHang::where('gio_hang_id', $cart->id)
            ->with(['sanPham:id,ten_san_pham,gia,hinh_dai_dien,so_luong_ton,so_luong_tam_giu,cua_hang_id',
                    'sanPham.cuaHang:id,ten_cua_hang'])
            ->get()
            ->map(function ($item) {
                $sp = $item->sanPham;
                return [
                    'id'           => $item->id,          // chi_tiet_gio_hang.id — dùng để update/remove
                    'san_pham_id'  => $sp->id,
                    'ten_san_pham' => $sp->ten_san_pham,
                    'don_gia'      => (float) $item->don_gia,
                    'so_luong'     => $item->so_luong,
                    'hinh_anh'     => $sp->hinh_dai_dien,
                    'cua_hang_id'  => $sp->cua_hang_id,
                    'ten_cua_hang' => $sp->cuaHang?->ten_cua_hang,
                    'ton_kho'      => max(0, $sp->so_luong_ton - ($sp->so_luong_tam_giu ?? 0)),
                ];
            });

        $tongTien = $items->sum(fn($i) => $i['don_gia'] * $i['so_luong']);

        return response()->json([
            'items'     => $items,
            'tong_tien' => $tongTien,
            'so_luong'  => $items->sum('so_luong'),
        ]);
    }

    // ── POST /api/cart/add  { san_pham_id, so_luong } ────────────
    public function addToCart(Request $request)
    {
        $request->validate([
            'san_pham_id' => 'required|exists:san_pham,id',
            'so_luong'    => 'required|integer|min:1',
        ]);

        $userId = auth()->id();
        $sp     = SanPham::findOrFail($request->san_pham_id);

        // Kiểm tra tồn kho
        $tonKho = $sp->so_luong_ton - ($sp->so_luong_tam_giu ?? 0);
        if ($tonKho < $request->so_luong) {
            return response()->json(['message' => 'Sản phẩm không đủ tồn kho.'], 422);
        }

        $cart = GioHang::firstOrCreate(['nguoi_mua_id' => $userId]);

        // Nếu đã có → cộng thêm số lượng
        $existing = ChiTietGioHang::where('gio_hang_id', $cart->id)
            ->where('san_pham_id', $sp->id)
            ->first();

        if ($existing) {
            $newQty = $existing->so_luong + $request->so_luong;
            if ($newQty > $tonKho) {
                return response()->json(['message' => 'Vượt quá tồn kho.'], 422);
            }
            $existing->update(['so_luong' => $newQty]);
        } else {
            ChiTietGioHang::create([
                'gio_hang_id' => $cart->id,
                'san_pham_id' => $sp->id,
                'so_luong'    => $request->so_luong,
                'don_gia'     => $sp->gia,
            ]);
        }

        return response()->json(['message' => 'Đã thêm vào giỏ hàng']);
    }

    // ── PUT /api/cart/item/{id}  { so_luong } ─────────────────────
    public function updateItem(Request $request, $id)
    {
        $request->validate(['so_luong' => 'required|integer|min:1']);

        $userId = auth()->id();
        $cart   = GioHang::where('nguoi_mua_id', $userId)->firstOrFail();

        $item = ChiTietGioHang::where('id', $id)
            ->where('gio_hang_id', $cart->id)
            ->firstOrFail();

        // Kiểm tra tồn kho
        $sp     = SanPham::find($item->san_pham_id);
        $tonKho = $sp->so_luong_ton - ($sp->so_luong_tam_giu ?? 0);

        if ($request->so_luong > $tonKho) {
            return response()->json([
                'message' => "Chỉ còn {$tonKho} sản phẩm trong kho."
            ], 422);
        }

        $item->update(['so_luong' => $request->so_luong]);

        return response()->json(['message' => 'Đã cập nhật số lượng']);
    }

    // ── DELETE /api/cart/item/{id} ─────────────────────────────────
    public function removeItem($id)
    {
        $userId = auth()->id();
        $cart   = GioHang::where('nguoi_mua_id', $userId)->firstOrFail();

        ChiTietGioHang::where('id', $id)
            ->where('gio_hang_id', $cart->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Đã xoá sản phẩm khỏi giỏ hàng']);
    }

    // ── DELETE /api/cart/clear ─────────────────────────────────────
    public function clearCart()
    {
        $userId = auth()->id();
        $cart   = GioHang::where('nguoi_mua_id', $userId)->first();

        if ($cart) {
            ChiTietGioHang::where('gio_hang_id', $cart->id)->delete();
        }

        return response()->json(['message' => 'Đã xoá toàn bộ giỏ hàng']);
    }
}