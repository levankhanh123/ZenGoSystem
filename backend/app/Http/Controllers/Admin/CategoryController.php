<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DanhMuc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = DanhMuc::whereNull('danh_muc_cha_id')
            ->with('childrenRecursive')
            ->orderBy('thu_tu')
            ->get();

        return response()->json([
            'data' => $categories
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'ten_danh_muc' => 'required|string|max:255',
            'danh_muc_cha_id' => 'nullable|exists:danh_muc,id',
            'hinh_anh' => 'nullable|string',
            'thu_tu' => 'integer',
            'trang_thai' => 'boolean'
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->ten_danh_muc) . '-' . time();

        $category = DanhMuc::create($data);

        return response()->json([
            'message' => 'Tạo danh mục thành công',
            'data' => $category
        ]);
    }

    public function update(Request $request, DanhMuc $danhMuc): JsonResponse
    {
        $request->validate([
            'ten_danh_muc' => 'required|string|max:255',
            'danh_muc_cha_id' => 'nullable|exists:danh_muc,id',
            'hinh_anh' => 'nullable|string',
            'thu_tu' => 'integer',
            'trang_thai' => 'boolean'
        ]);

        $data = $request->all();
        if ($request->ten_danh_muc !== $danhMuc->ten_danh_muc) {
            $data['slug'] = Str::slug($request->ten_danh_muc) . '-' . time();
        }

        $oldStatus = $danhMuc->trang_thai;
        $danhMuc->update($data);

        // Recursive visibility logic: If parent hidden, hide all children
        if ($oldStatus == 1 && $request->trang_thai == 0) {
            $this->recursiveUpdateStatus($danhMuc, 0);
        }

        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'data' => $danhMuc
        ]);
    }

    public function destroy(DanhMuc $danhMuc): JsonResponse
    {
        // Check for products
        $productCount = $danhMuc->sanPhams()->count();
        
        // Also check children products recursively
        $totalProducts = $this->countProductsRecursive($danhMuc);

        if ($totalProducts > 0) {
            return response()->json([
                'message' => 'Không thể xóa danh mục này vì đã có sản phẩm bám vào. Hãy chuyển sang trạng thái Ẩn thay vì xóa.',
                'can_delete' => false
            ], 400);
        }

        $danhMuc->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công'
        ]);
    }

    public function toggleStatus(Request $request, DanhMuc $danhMuc): JsonResponse
    {
        $newStatus = !$danhMuc->trang_thai;
        $danhMuc->update(['trang_thai' => $newStatus]);

        if ($newStatus == 0) {
            $this->recursiveUpdateStatus($danhMuc, 0);
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => ['trang_thai' => $newStatus]
        ]);
    }

    private function recursiveUpdateStatus($category, $status)
    {
        $children = $category->children;
        foreach ($children as $child) {
            $child->update(['trang_thai' => $status]);
            $this->recursiveUpdateStatus($child, $status);
        }
    }

    private function countProductsRecursive($category)
    {
        $count = $category->sanPhams()->count();
        foreach ($category->children as $child) {
            $count += $this->countProductsRecursive($child);
        }
        return $count;
    }

    public function getTreeSelect(): JsonResponse
    {
        $categories = DanhMuc::whereNull('danh_muc_cha_id')
            ->with('childrenRecursive')
            ->orderBy('thu_tu')
            ->get();

        return response()->json([
            'data' => $categories
        ]);
    }
}
