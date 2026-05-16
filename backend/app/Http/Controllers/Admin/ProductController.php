<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use App\Models\DanhMuc;
use App\Models\CuaHang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SanPham::query()
            ->with(['cuaHang', 'danhMuc']);

        // Search by keyword (Name, SKU, Shop Name)
        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('ten_san_pham', 'like', "%{$keyword}%")
                  ->orWhere('sku', 'like', "%{$keyword}%")
                  ->orWhereHas('cuaHang', function ($sq) use ($keyword) {
                      $sq->where('ten_cua_hang', 'like', "%{$keyword}%");
                  });
            });
        }

        // Filter by Category
        if ($request->filled('danh_muc_id')) {
            $query->where('danh_muc_id', $request->input('danh_muc_id'));
        }

        // Filter by Shop
        if ($request->filled('cua_hang_id')) {
            $query->where('cua_hang_id', $request->input('cua_hang_id'));
        }

        // Filter by Status (Tab system)
        if ($request->filled('trang_thai')) {
            $status = $request->input('trang_thai');
            if ($status === 'het_hang') {
                $query->where('so_luong_ton', 0);
            } else {
                $query->where('trang_thai', $status);
            }
        }

        $perPage = $request->input('per_page', 10);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Calculate Stats for Overview
        $stats = [
            'pending' => SanPham::where('trang_thai', 'cho_duyet')->count(),
            'active' => SanPham::where('trang_thai', 'dang_ban')->count(),
            'locked' => SanPham::whereIn('trang_thai', ['bi_khoa', 'vi_pham'])->count(),
            'out_of_stock' => SanPham::where('so_luong_ton', 0)->count(),
        ];

        return response()->json(array_merge($products->toArray(), [
            'stats' => $stats
        ]));
    }

    public function show(SanPham $sanPham): JsonResponse
    {
        return response()->json([
            'data' => $sanPham->load(['cuaHang', 'danhMuc', 'hinhAnhSanPham'])
        ]);
    }

    public function updateStatus(Request $request, SanPham $sanPham): JsonResponse
    {
        $request->validate([
            'trang_thai' => 'required|string|in:dang_ban,tu_choi,bi_khoa,vi_pham',
            'ly_do' => 'nullable|string'
        ]);

        $sanPham->update([
            'trang_thai' => $request->trang_thai,
            'ghi_chu' => $request->ly_do // Assuming ghi_chu is used for admin notes
        ]);

        // Logic for notifications to seller could be added here

        return response()->json([
            'message' => 'Cập nhật trạng thái sản phẩm thành công',
            'data' => $sanPham->load(['cuaHang', 'danhMuc'])
        ]);
    }

    public function getFilterData(): JsonResponse
    {
        return response()->json([
            'categories' => DanhMuc::orderBy('ten_danh_muc')->get(['id', 'ten_danh_muc']),
            'shops' => CuaHang::orderBy('ten_cua_hang')->get(['id', 'ten_cua_hang'])
        ]);
    }
}
