<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\CuaHang;
use App\Models\NguoiDung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerContextController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $authenticatedUser = auth()->user();
        if (!$authenticatedUser) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $selectedUser = $authenticatedUser;
        
        $availableShops = CuaHang::query()
            ->with('owner:id,ho_ten,email,so_dien_thoai,vai_tro,trang_thai')
            ->where('nguoi_ban_id', $selectedUser->id)
            ->get([
                'id',
                'nguoi_ban_id',
                'ten_cua_hang',
                'email',
                'so_dien_thoai',
                'dia_chi_lay_hang',
                'logo',
                'trang_thai',
            ]);

        $selectedShop = null;
        if ($request->filled('shop_id')) {
            $selectedShop = $availableShops->firstWhere('id', (int) $request->input('shop_id'));
        }

        if (!$selectedShop && $availableShops->isNotEmpty()) {
            $selectedShop = $availableShops->first();
        }

        $availableUsers = collect([$selectedUser]);

        \Illuminate\Support\Facades\Log::info('SellerContext: Result', [
            'selected_user_id' => $selectedUser?->id,
            'selected_shop_id' => $selectedShop?->id,
            'shops_count' => $availableShops->count(),
        ]);

        return response()->json([
            'data' => [
                'selected_user' => $selectedUser,
                'selected_shop' => $selectedShop,
                'available_users' => $availableUsers,
                'available_shops' => $availableShops->values(),
            ],
        ]);
    }
}
