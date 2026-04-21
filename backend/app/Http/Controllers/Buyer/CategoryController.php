<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\DanhMuc;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * 👉 Chỉ lấy danh mục cha + con
     */
    public function index()
    {
        $categories = DanhMuc::whereNull('danh_muc_cha_id')
            ->with('children')
            ->get();

        return response()->json($categories);
    }

    /**
     * GET /api/categories/{slug}
     * 👉 Chi tiết danh mục (KHÔNG load sản phẩm)
     */
    public function show($slug)
    {
        $category = DanhMuc::where('slug', $slug)
            ->with('children')
            ->firstOrFail();

        return response()->json($category);
    }

    /**
     * GET /api/categories/tree
     */
    public function tree()
    {
        return response()->json(
            DanhMuc::whereNull('danh_muc_cha_id')
                ->with('children')
                ->get()
        );
    }
}