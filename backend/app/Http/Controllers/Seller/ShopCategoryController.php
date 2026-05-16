<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\DanhMucShop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShopCategoryController extends Controller
{
    public function index(Request $request)
    {
        $shopId = $request->query('shop_id');
        if (!$shopId) {
            return response()->json(['message' => 'Shop ID is required'], 400);
        }

        $categories = DanhMucShop::where('cua_hang_id', $shopId)->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_danh_muc_shop' => 'required|string|max:150',
            'cua_hang_id' => 'required|exists:cua_hang,id',
        ]);

        $category = DanhMucShop::create([
            'cua_hang_id' => $request->cua_hang_id,
            'ten_danh_muc_shop' => $request->ten_danh_muc_shop,
            'slug' => Str::slug($request->ten_danh_muc_shop) . '-' . uniqid(),
        ]);

        return response()->json($category, 201);
    }
}
